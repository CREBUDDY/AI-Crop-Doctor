from typing import Optional, Dict, Any
from app.domain.entities.analysis import WeatherContext, WeatherIntelligenceReport

class WeatherIntelligenceEngine:
    
    def _is_fungal_disease(self, disease_name: str) -> bool:
        """Simple keyword-based categorization for fungal diseases."""
        if not disease_name:
            return False
        fungal_keywords = ["blast", "blight", "rust", "mildew", "smut", "rot", "scab", "spot", "wilt"]
        return any(keyword in disease_name.lower() for keyword in fungal_keywords)

    def analyze(self, weather: Optional[WeatherContext], crop: str, disease: Optional[str]) -> Optional[WeatherIntelligenceReport]:
        """
        Generates crop-and-disease-aware weather intelligence.
        """
        if not weather:
            return None
            
        disease_name = disease or "None"
        is_fungal = self._is_fungal_disease(disease_name)
        
        # 1. Disease Risk
        disease_risk = "Low: Current weather is not favoring disease spread."
        if disease_name != "None":
            if is_fungal and weather.fungal_risk_score > 70:
                disease_risk = f"Critical: High humidity and warm temperatures strongly favor {disease_name} spread."
            elif is_fungal and weather.fungal_risk_score > 40:
                disease_risk = f"Moderate: Weather conditions are mildly conducive to {disease_name}."
            else:
                disease_risk = f"Stable: Current weather does not accelerate {disease_name}."
        else:
            if weather.fungal_risk_score > 80:
                disease_risk = f"High Preventive Risk: Weather highly favors fungal outbreaks in {crop}. Monitor closely."
                
        # 2. Rain Impact
        rain_impact = "No immediate rain impact."
        if weather.rain_probability_pct > 60 or weather.rainfall_mm_24h > 10:
            if disease_name != "None":
                rain_impact = f"High Risk: Heavy rain will wash off treatments and may spread {disease_name} spores."
            else:
                rain_impact = "Moderate Risk: Rain may wash off any protective sprays."
        elif weather.rain_probability_pct > 30:
            rain_impact = "Monitor: Chance of rain. Wait for clear windows before applying treatments."

        # 3. Spray Suitability
        spray_suitability = "Optimal: Conditions are clear for chemical or organic spraying."
        if weather.wind_speed_kmh > 15:
            spray_suitability = f"Poor: High winds ({weather.wind_speed_kmh} km/h) will cause chemical drift. Avoid spraying."
        elif weather.rain_probability_pct > 50:
            spray_suitability = "Poor: Impending rain will wash away treatments."
        elif weather.temperature_c > 35:
            spray_suitability = "Poor: High temperatures may cause chemical burn on leaves."
            
        # 4. Irrigation Advice
        irrigation_advice = weather.irrigation_advisory
        if weather.temperature_c > 35 and weather.rainfall_mm_24h < 5:
            irrigation_advice = f"Critical: {crop} is facing severe heat stress. Immediate heavy irrigation required."
            
        # 5. Alerts
        humidity_alert = None
        if weather.humidity_pct > 85:
            if is_fungal:
                humidity_alert = f"Alert: Extreme humidity ({weather.humidity_pct}%) accelerates {disease_name}."
            else:
                humidity_alert = f"Alert: >85% humidity promotes fungal growth in {crop}."
                
        wind_alert = None
        if weather.wind_speed_kmh > 20:
            wind_alert = f"Alert: High winds ({weather.wind_speed_kmh} km/h) risk physical damage to {crop}."
            
        # 6. Temperature Impact
        temp_impact = "Optimal temperature for crop growth."
        if weather.temperature_c > 38:
            if disease_name != "None":
                temp_impact = f"Warning: Heat stress compounds the damage from {disease_name}."
            else:
                temp_impact = f"Warning: Extreme heat (>38°C) causes stress and yield loss in {crop}."
        elif weather.temperature_c < 10:
            temp_impact = f"Warning: Low temperatures may stunt {crop} growth."
            
        return WeatherIntelligenceReport(
            disease_risk=disease_risk,
            rain_impact=rain_impact,
            spray_suitability=spray_suitability,
            irrigation_advice=irrigation_advice,
            humidity_alert=humidity_alert,
            wind_alert=wind_alert,
            temperature_impact=temp_impact
        )

weather_intelligence_engine = WeatherIntelligenceEngine()
