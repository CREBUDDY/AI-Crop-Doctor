from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.domain.entities.analysis import (
    DecisionEngineResponse, WeatherContext, FarmContext, ActionPlan, RecommendationType
)
from app.infrastructure.database.models.analysis import Analysis, AIPrediction
from app.infrastructure.database.models.farm import Farm, FarmCrop
from app.services.weather import weather_service
from app.services.recommendation import recommendation_service
from app.services.weather_intelligence import weather_intelligence_engine

class DecisionEngine:
    async def process(
        self, db: AsyncSession, analysis: Analysis, prediction: AIPrediction
    ) -> DecisionEngineResponse:
        """
        Fuses AI Detection, Weather, Farm context, and Database recommendations into a single response.
        """
        # 1. Fetch Farm Context
        farm_area = 1.0
        crop_stage = "Unknown"
        
        if analysis.farm_id:
            farm = await db.get(Farm, analysis.farm_id)
            if farm:
                farm_area = float(farm.area_acres) if farm.area_acres else 1.0
                
            # Get active crop stage
            if prediction.crop_identified:
                stmt = select(FarmCrop).where(
                    FarmCrop.farm_id == analysis.farm_id,
                    FarmCrop.is_active == True
                ).order_by(FarmCrop.created_at.desc())
                farm_crop = (await db.execute(stmt)).scalars().first()
                if farm_crop:
                    crop_stage = farm_crop.current_stage

        farm_context = FarmContext(
            farm_id=analysis.farm_id,
            area_acres=farm_area,
            crop_stage=crop_stage
        )

        # 2. Fetch Weather Context
        weather_context = None
        irrigation_advice = "Normal irrigation schedule."
        spray_advisory = "Conditions are optimal for spraying."
        
        if analysis.farm_id:
            try:
                wr = await weather_service.get_weather_for_farm(db, analysis.farm_id, analysis.user_id)
                irrigation_advice = wr.irrigation_advisory
                spray_advisory = wr.spray_advisory
                
                weather_context = WeatherContext(
                    temperature_c=float(wr.temperature_c),
                    humidity_pct=wr.humidity_pct,
                    rainfall_mm_24h=float(wr.rainfall_mm_24h),
                    rain_probability_pct=wr.rain_probability_pct,
                    wind_speed_kmh=float(wr.wind_speed_kmh),
                    weather_risk_level=wr.weather_risk_level.value,
                    fungal_risk_score=float(wr.fungal_risk_score),
                    spray_safe=wr.spray_safe,
                    spray_advisory=wr.spray_advisory,
                    irrigation_advisory=wr.irrigation_advisory
                )
            except Exception as e:
                print(f"Failed to fetch weather in decision engine: {e}")

        # 3. Rules & Recommendations (PREVENTIVE vs CURATIVE)
        diseases = prediction.detected_diseases or []
        pests = prediction.detected_pests or []
        highest_disease = max(diseases, key=lambda x: x.get("confidence", 0)) if diseases else None
        highest_pest = max(pests, key=lambda x: x.get("confidence", 0)) if pests else None
        
        target = highest_disease if highest_disease else highest_pest
        crop_identified = prediction.crop_identified or "Unknown Crop"
        
        recommendation_type = RecommendationType.PREVENTIVE
        treatments = []
        
        if target and target.get("severity", "none").lower() != "none" and target.get("confidence", 0) >= 0.70:
            # Rule 1: High confidence issue detected -> Curative
            recommendation_type = RecommendationType.CURATIVE
            treatments = await recommendation_service.get_curative_recommendations(
                db, crop_identified, target["name"], farm_area,
                confidence_score=target.get("confidence", 0),
                irrigation_advice=irrigation_advice
            )
        else:
            # Rule 2: No active issue, but high weather risk -> Preventive
            if weather_context and (weather_context.fungal_risk_score > 70 or weather_context.rain_probability_pct > 60):
                treatments = await recommendation_service.get_preventive_recommendations(
                    db, crop_identified, farm_area,
                    confidence_score=target.get("confidence", 0) if target else 0.0,
                    irrigation_advice=irrigation_advice
                )

        action_plan = ActionPlan(
            treatments=treatments,
            irrigation_advice=irrigation_advice,
            spray_advisory=spray_advisory
        )
        
        # 4. Generate Weather Intelligence
        weather_intelligence = weather_intelligence_engine.analyze(
            weather_context, crop_identified, target["name"] if target else None
        )

        return DecisionEngineResponse(
            analysis_id=analysis.id,
            crop_identified=crop_identified,
            health_score=analysis.health_score or 0,
            recommendation_type=recommendation_type,
            detection=prediction.raw_response,
            weather_context=weather_context,
            weather_intelligence=weather_intelligence,
            farm_context=farm_context,
            action_plan=action_plan,
            created_at=analysis.created_at
        )

decision_engine = DecisionEngine()
