import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, AuthenticatedUser
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models.analysis import Analysis, AIPrediction
from sqlalchemy.future import select
from fastapi import HTTPException
from app.domain.entities.analysis import AnalysisResponse, AnalysisCreate
from app.services.upload import upload_service
from app.services.analysis import analysis_service

router = APIRouter()

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an image for crop analysis. Returns the ImageMetadata including the image_id.
    """
    image_record = await upload_service.upload_image(db, file, uuid.UUID(current_user.uid))
    return {"image_id": image_record.id, "url": image_record.download_url}

@router.post("/predict", response_model=AnalysisResponse)
async def predict_crop(
    request: AnalysisCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Core AI prediction endpoint. 
    Requires an image_id from the /upload endpoint.
    Runs Gemini Vision AI and stores the result.
    """
    return await analysis_service.process_analysis(
        db, 
        user_id=uuid.UUID(current_user.uid), 
        image_id=request.image_id, 
        farm_id=request.farm_id
    )

@router.get("/history/list")
async def get_history(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Analysis)
        .where(Analysis.user_id == uuid.UUID(current_user.uid))
        .order_by(Analysis.created_at.desc())
        .limit(50)
    )
    analyses = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "status": a.status,
            "health_score": a.health_score,
            "overall_severity": a.overall_severity,
            "created_at": a.created_at,
        }
        for a in analyses
    ]
@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch analysis and join with prediction
    result = await db.execute(select(Analysis).where(Analysis.id == analysis_id, Analysis.user_id == uuid.UUID(current_user.uid)))
    analysis = result.scalars().first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    pred_result = await db.execute(select(AIPrediction).where(AIPrediction.analysis_id == analysis_id))
    prediction = pred_result.scalars().first()
    
    # Format according to AnalysisResponse
    return {
        "id": analysis.id,
        "status": analysis.status,
        "health_score": analysis.health_score,
        "overall_severity": analysis.overall_severity,
        "water_status": analysis.water_status,
        "detected_diseases": prediction.detected_diseases if prediction else [],
        "detected_pests": prediction.detected_pests if prediction else [],
        "recommendations": [], # TODO: Map medicines here
        "weather_snapshot": analysis.weather_snapshot,
        "created_at": analysis.created_at
    }
