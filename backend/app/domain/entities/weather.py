from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.infrastructure.database.models.enums import WeatherRiskLevel

class WeatherResponse(BaseModel):
    id: UUID
    temperature_c: float
    feels_like_c: float
    humidity_pct: int
    wind_speed_kmh: float
    wind_direction_deg: int
    cloud_cover_pct: int
    uv_index: float
    visibility_km: float
    rainfall_mm_24h: float
    
    rain_forecast_6h: bool
    rain_forecast_12h: bool
    rain_forecast_24h: bool
    rain_probability_pct: int
    
    weather_risk_level: WeatherRiskLevel
    fungal_risk_score: float = Field(..., description="Score 0-100 indicating risk of fungal disease based on temp/humidity")
    
    frost_risk: bool
    heat_stress_risk: bool
    
    spray_advisory: str
    spray_safe: bool
    irrigation_advisory: str
    
    provider: str
    provider_timestamp: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True
