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
        
        # 3. Validate image quality
        img_q = ai_result.get("image_quality", {})
        is_acceptable = img_q.get("is_acceptable", True)
        is_valid = ai_result.get("is_valid_crop", True)
        
        if not is_acceptable or not is_valid:
            issues = []
            if img_q.get("is_blurry"): issues.append("Image is blurry")
            if img_q.get("is_too_dark"): issues.append("Image is too dark or poorly lit")
            if img_q.get("is_non_crop"): issues.append("Image does not contain a plant")
            if img_q.get("is_wrong_crop"): issues.append("Image contains an unsupported crop")
            
            if not issues:
                issues.append("Image does not meet quality standards or is not a valid crop.")
                
            rejection_reason = img_q.get("rejection_reason") or ai_result.get("rejection_reason", "This image does not appear to be a valid crop.")
            
            raise HTTPException(
                status_code=400, 
                detail={
                    "error_code": "IMAGE_REJECTED", 
                    "message": "We couldn't analyze this image accurately. Please upload a better image.",
                    "issues": issues,
                    "rejection_reason": rejection_reason
                }
            )
            
        # 4. Enforce Confidence Threshold
        detected_diseases = ai_result.get("detected_diseases", [])
        detected_pests = ai_result.get("detected_pests", [])
        
        highest_disease = max(detected_diseases, key=lambda x: x.get("confidence", 0)) if detected_diseases else None
        highest_pest = max(detected_pests, key=lambda x: x.get("confidence", 0)) if detected_pests else None
        
        target = highest_disease if highest_disease else highest_pest
        
        if target:
            if target.get("confidence", 0) < 0.70:
                raise HTTPException(
                    status_code=400, 
                    detail={
                        "error_code": "LOW_CONFIDENCE", 
                        "message": "Low confidence detection. Please upload a clearer image or consult your nearest KVK.",
                        "issues": ["Low Confidence", "Unclear disease symptoms"],
                        "rejection_reason": f"AI could only identify the issue with {target.get('confidence', 0)*100:.1f}% confidence. 70% is required."
                    }
                )

        # 5. Create Prediction Record
        prediction = AIPrediction(
            image_id=image_id,
            ai_provider=AIProvider.GEMINI,
            raw_response=ai_result,
            crop_identified=ai_result.get("crop_identified"),
            crop_confidence=ai_result.get("crop_confidence"),
            detected_diseases=detected_diseases,
            detected_pests=detected_pests,
            leaf_condition_score=ai_result.get("leaf_condition_score"),
            color_analysis_score=ai_result.get("color_analysis_score"),
            water_status=WaterStatus(ai_result.get("water_status", "normal").lower()),
            overall_confidence=ai_result.get("overall_confidence", 0)
        )
        db.add(prediction)
        
        # 6. Calculate final scores
        disease_severity_str = target.get("severity", "none").lower() if target else "none"
        overall_sev = SeverityLevel(disease_severity_str)
        
        # 7. Create Analysis Record
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
        
        await db.commit()
        prediction.analysis_id = analysis.id
        await db.commit()
        
        # The dynamic recommendation calculation is now offloaded to the router during response formatting.
        return await analysis_repo.get_full_analysis(db, analysis.id)

analysis_service = AnalysisService()
