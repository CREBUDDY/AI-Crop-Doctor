import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.infrastructure.repositories.analysis import analysis_repo, image_repo
from app.infrastructure.database.models.analysis import AIPrediction, Analysis
from app.infrastructure.database.models.enums import AIProvider, AnalysisStatus, SeverityLevel, WaterStatus
from app.services.ai import ai_service

class AnalysisService:
    async def process_analysis(self, db: AsyncSession, user_id: uuid.UUID, image_id: uuid.UUID, farm_id: uuid.UUID = None) -> Analysis:
        # 1. Fetch image
        image = await image_repo.get(db, id=image_id)
        if not image or image.user_id != user_id:
            raise HTTPException(status_code=404, detail="Image not found")
            
        # 2. Call AI
        ai_result = await ai_service.analyze_crop_image(image.storage_path)
        
        # 3. Validate image
        if ai_result.get("is_valid_crop") is False:
            rejection_reason = ai_result.get("rejection_reason", "This image does not appear to be a valid crop.")
            raise HTTPException(status_code=400, detail={"error_code": "INVALID_IMAGE", "message": rejection_reason})

        
        # 3. Create Prediction Record
        prediction = AIPrediction(
            image_id=image_id,
            ai_provider=AIProvider.GEMINI,
            raw_response=ai_result,
            crop_identified=ai_result.get("crop_identified"),
            crop_confidence=ai_result.get("crop_confidence"),
            detected_diseases=ai_result.get("detected_diseases", []),
            detected_pests=ai_result.get("detected_pests", []),
            leaf_condition_score=ai_result.get("leaf_condition_score"),
            color_analysis_score=ai_result.get("color_analysis_score"),
            water_status=WaterStatus(ai_result.get("water_status", "normal").lower()),
            overall_confidence=ai_result.get("overall_confidence", 0)
        )
        db.add(prediction)
        
        # 4. Calculate final scores (simplified for now)
        disease_severity_str = "none"
        if ai_result.get("detected_diseases"):
            disease_severity_str = ai_result["detected_diseases"][0].get("severity", "none").lower()
            
        overall_sev = SeverityLevel(disease_severity_str)
        
        # 5. Create Analysis Record
        analysis = Analysis(
            user_id=user_id,
            farm_id=farm_id,
            image_id=image_id,
            status=AnalysisStatus.COMPLETED,
            health_score=int(ai_result.get("overall_confidence", 0) * 100),
            overall_severity=overall_sev,
            water_status=WaterStatus(ai_result.get("water_status", "normal").lower()),
            ai_confidence=ai_result.get("overall_confidence")
        )
        db.add(analysis)
        
        # Link prediction and analysis
        await db.commit()
        prediction.analysis_id = analysis.id
        await db.commit()
        
        # Refresh to get full relations
        return await analysis_repo.get_full_analysis(db, analysis.id)

analysis_service = AnalysisService()
