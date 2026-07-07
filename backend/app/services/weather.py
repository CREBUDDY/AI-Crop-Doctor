import uuid
import httpx
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.repositories.base import BaseRepository
from app.infrastructure.database.models.analysis import WeatherRecord
from app.infrastructure.database.models.enums import WeatherRiskLevel
from app.infrastructure.repositories.farm import farm_repo
from fastapi import HTTPException
from app.core.config import settings

# Base URL for OpenWeatherMap (standard 2.5 API)
OWM_BASE_URL = "https://api.openweathermap.org/data/2.5"

class WeatherService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.weather_repo = BaseRepository(WeatherRecord)

    async def get_weather_for_farm(self, db: AsyncSession, farm_id: uuid.UUID, user_id: uuid.UUID) -> WeatherRecord:
        # 1. Fetch Farm
        farm = await farm_repo.get(db, id=farm_id)
        if not farm or farm.user_id != user_id:
            raise HTTPException(status_code=404, detail="Farm not found")

        lat = float(farm.lat) if farm.lat else 20.5937 # Default India roughly
        lng = float(farm.lng) if farm.lng else 78.9629
        
        return await self.get_weather_for_location(db, lat, lng, user_id, farm_id)

    async def get_weather_for_location(self, db: AsyncSession, lat: float, lng: float, user_id: uuid.UUID, farm_id: uuid.UUID = None) -> WeatherRecord:
        # 1.5 Check Cache if farm_id is provided
        if farm_id:
            fifteen_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=15)
            stmt = select(WeatherRecord).where(
                WeatherRecord.farm_id == farm_id,
                WeatherRecord.provider_timestamp >= fifteen_mins_ago
            ).order_by(WeatherRecord.provider_timestamp.desc()).limit(1)
            result = await db.execute(stmt)
            cached_record = result.scalar_one_or_none()
            if cached_record:
                # Re-calculate irrigation advisory for monkey patch consistency
                cached_record.irrigation_advisory = self._calculate_irrigation_advisory(
                    cached_record.temperature_c, 
                    cached_record.humidity_pct, 
                    float(cached_record.rainfall_mm_24h) if cached_record.rainfall_mm_24h else 0.0, 
                    cached_record.rain_forecast_24h
                )
                return cached_record

        # 2. Fetch Data
        if self.api_key:
            data = await self._fetch_from_owm(lat, lng)
        else:
            data = self._get_mock_weather(lat, lng)

        # 3. Process Intelligence Rules
        fungal_risk = self._calculate_fungal_risk(data['temp'], data['humidity'])
        frost_risk = data['temp'] < 4.0
        heat_stress = data['temp'] > 38.0
        
        spray_safe, spray_advisory = self._calculate_spray_advisory(data['wind_speed'], data['rain_probability'])
        irrigation_advisory = self._calculate_irrigation_advisory(data['temp'], data['humidity'], data['rainfall_24h'], data['rain_forecast_24h'])

        # Determine overall risk
        overall_risk = WeatherRiskLevel.LOW
        if frost_risk or heat_stress or fungal_risk > 80:
            overall_risk = WeatherRiskLevel.HIGH
        elif fungal_risk > 50 or data['rain_probability'] > 60:
            overall_risk = WeatherRiskLevel.MODERATE

        # 4. Save Record
        obj_in = {
            "user_id": user_id,
            "farm_id": farm_id,
            "lat": lat,
            "lng": lng,
            "temperature_c": data['temp'],
            "feels_like_c": data['feels_like'],
            "humidity_pct": data['humidity'],
            "wind_speed_kmh": data['wind_speed'],
            "wind_direction_deg": data['wind_deg'],
            "cloud_cover_pct": data['clouds'],
            "uv_index": data['uv'],
            "visibility_km": data['visibility'] / 1000.0,
            "rainfall_mm_24h": data['rainfall_24h'],
            "rain_forecast_6h": data['rain_probability'] > 30, # Simplified
            "rain_forecast_12h": data['rain_probability'] > 40,
            "rain_forecast_24h": data['rain_forecast_24h'],
            "rain_probability_pct": data['rain_probability'],
            "weather_risk_level": overall_risk,
            "fungal_risk_score": fungal_risk,
            "frost_risk": frost_risk,
            "heat_stress_risk": heat_stress,
            "spray_advisory": spray_advisory,
            "spray_safe": spray_safe,
            "provider": data['provider'],
            "provider_timestamp": datetime.now(timezone.utc)
        }
        
        record = await self.weather_repo.create(db, obj_in=obj_in)
        # Monkey patch the irrigation advisory since it's not a DB field on this table but a derived property
        record.irrigation_advisory = irrigation_advisory
        return record

    async def _fetch_from_owm(self, lat: float, lng: float) -> dict:
        async with httpx.AsyncClient() as client:
            url = f"{OWM_BASE_URL}/weather?lat={lat}&lon={lng}&appid={self.api_key}&units=metric"
            resp = await client.get(url)
            if resp.status_code != 200:
                return self._get_mock_weather(lat, lng) # Fallback to mock on error
            w = resp.json()
            return {
                "temp": w['main']['temp'],
                "feels_like": w['main']['feels_like'],
                "humidity": w['main']['humidity'],
                "wind_speed": w['wind']['speed'] * 3.6, # m/s to km/h
                "wind_deg": w['wind']['deg'],
                "clouds": w['clouds']['all'],
                "visibility": w.get('visibility', 10000),
                "uv": 5.0, # OWM free API doesn't include UV in current weather
                "rainfall_24h": w.get('rain', {}).get('1h', 0) * 24, # Rough estimation
                "rain_forecast_24h": 'rain' in w,
                "rain_probability": 80 if 'rain' in w else 10,
                "provider": "OpenWeatherMap"
            }

    def _get_mock_weather(self, lat: float, lng: float) -> dict:
        return {
            "temp": 32.5,
            "feels_like": 34.0,
            "humidity": 65,
            "wind_speed": 12.5,
            "wind_deg": 180,
            "clouds": 40,
            "visibility": 10000,
            "uv": 6.5,
            "rainfall_24h": 0.0,
            "rain_forecast_24h": False,
            "rain_probability": 15,
            "provider": "MockWeather (Dev)"
        }

    def _calculate_fungal_risk(self, temp: float, humidity: int) -> float:
        # Fungi thrive in 20-30C and >80% humidity
        score = 0
        if 20 <= temp <= 30:
            score += 40
        elif 15 <= temp < 20 or 30 < temp <= 35:
            score += 20
            
        if humidity > 85:
            score += 60
        elif humidity > 70:
            score += 40
        elif humidity > 50:
            score += 15
            
        return min(100.0, score)

    def _calculate_spray_advisory(self, wind_kmh: float, rain_prob: int) -> tuple[bool, str]:
        if wind_kmh > 15:
            return False, f"Not recommended: Wind speeds are too high ({wind_kmh:.1f} km/h). Risk of drift."
        if rain_prob > 50:
            return False, "Not recommended: High chance of rain may wash away the spray."
        return True, "Conditions are optimal for spraying."

    def _calculate_irrigation_advisory(self, temp: float, humidity: int, rain_24h: float, rain_forecast: bool) -> str:
        if rain_24h > 10.0 or rain_forecast:
            return "No irrigation needed. Recent or expected rainfall is sufficient."
        if temp > 35 and humidity < 40:
            return "High irrigation required to combat heat stress and high evapotranspiration."
        if temp > 28:
            return "Moderate irrigation recommended."
        return "Normal irrigation schedule."

weather_service = WeatherService()
