import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.infrastructure.database.session import get_db
from app.infrastructure.database.models.agricultural import (
    Crop, CropDisease, CropPest, Medicine, TreatmentPlan, KnowledgeSource
)
from app.domain.schemas.agricultural import (
    CropResponse, CropListResponse,
    DiseaseResponse, DiseaseDetailResponse, DiseaseListResponse,
    PestResponse, PestListResponse,
    MedicineResponse, MedicineListResponse,
    TreatmentPlanResponse, TreatmentPlanListResponse,
    RecommendationRequest, RecommendationResponse, RecommendationDetail,
    CalculateDoseRequest, CalculateDoseResponse
)

router = APIRouter()

def paginate(items: list, total: int, page: int, size: int) -> dict:
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size if size > 0 else 0
    }

# =======================
# Crops
# =======================
@router.get("/crops", response_model=CropListResponse)
async def list_crops(
    q: Optional[str] = Query(None, description="Search by crop name"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List and search verified crops."""
    stmt = select(Crop)
    count_stmt = select(func.count(Crop.id))
    
    if q:
        stmt = stmt.where(Crop.name.ilike(f"%{q}%"))
        count_stmt = count_stmt.where(Crop.name.ilike(f"%{q}%"))
        
    total = await db.scalar(count_stmt)
    stmt = stmt.offset((page - 1) * size).limit(size)
    
    result = await db.execute(stmt)
    crops = result.scalars().all()
    
    return paginate(crops, total, page, size)

@router.get("/crops/{crop_id}", response_model=CropResponse)
async def get_crop(crop_id: int, db: AsyncSession = Depends(get_db)):
    """Get crop details."""
    crop = await db.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


# =======================
# Diseases
# =======================
@router.get("/diseases", response_model=DiseaseListResponse)
async def list_diseases(
    q: Optional[str] = Query(None, description="Search by disease name"),
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List and search verified diseases."""
    stmt = select(CropDisease)
    count_stmt = select(func.count(CropDisease.id))
    
    if q:
        stmt = stmt.where(CropDisease.name.ilike(f"%{q}%"))
        count_stmt = count_stmt.where(CropDisease.name.ilike(f"%{q}%"))
    if crop_id:
        stmt = stmt.where(CropDisease.crop_id == crop_id)
        count_stmt = count_stmt.where(CropDisease.crop_id == crop_id)
        
    total = await db.scalar(count_stmt)
    stmt = stmt.offset((page - 1) * size).limit(size)
    
    result = await db.execute(stmt)
    diseases = result.scalars().all()
    
    return paginate(diseases, total, page, size)

@router.get("/diseases/{disease_id}", response_model=DiseaseDetailResponse)
async def get_disease(disease_id: int, db: AsyncSession = Depends(get_db)):
    """Get detailed information about a specific disease."""
    disease = await db.get(CropDisease, disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease


# =======================
# Pests
# =======================
@router.get("/pests", response_model=PestListResponse)
async def list_pests(
    q: Optional[str] = Query(None, description="Search by pest name"),
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List and search verified pests."""
    stmt = select(CropPest)
    count_stmt = select(func.count(CropPest.id))
    
    if q:
        stmt = stmt.where(CropPest.name.ilike(f"%{q}%"))
        count_stmt = count_stmt.where(CropPest.name.ilike(f"%{q}%"))
    if crop_id:
        stmt = stmt.where(CropPest.crop_id == crop_id)
        count_stmt = count_stmt.where(CropPest.crop_id == crop_id)
        
    total = await db.scalar(count_stmt)
    stmt = stmt.offset((page - 1) * size).limit(size)
    
    result = await db.execute(stmt)
    pests = result.scalars().all()
    
    return paginate(pests, total, page, size)


# =======================
# Medicines
# =======================
@router.get("/medicines", response_model=MedicineListResponse)
async def list_medicines(
    q: Optional[str] = Query(None, description="Search by medicine name"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List and search verified medicines."""
    stmt = select(Medicine)
    count_stmt = select(func.count(Medicine.id))
    
    if q:
        stmt = stmt.where(or_(
            Medicine.normalized_name.ilike(f"%{q}%"),
            Medicine.active_ingredient.ilike(f"%{q}%")
        ))
        count_stmt = count_stmt.where(or_(
            Medicine.normalized_name.ilike(f"%{q}%"),
            Medicine.active_ingredient.ilike(f"%{q}%")
        ))
        
    total = await db.scalar(count_stmt)
    stmt = stmt.offset((page - 1) * size).limit(size)
    
    result = await db.execute(stmt)
    medicines = result.scalars().all()
    
    return paginate(medicines, total, page, size)


# =======================
# Recommendations
# =======================
@router.get("/recommendations", response_model=TreatmentPlanListResponse)
async def list_recommendations(
    disease_id: Optional[int] = None,
    pest_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List available treatment plans."""
    stmt = select(TreatmentPlan).options(selectinload(TreatmentPlan.medicine))
    count_stmt = select(func.count(TreatmentPlan.id))
    
    if disease_id:
        stmt = stmt.where(TreatmentPlan.disease_id == disease_id)
        count_stmt = count_stmt.where(TreatmentPlan.disease_id == disease_id)
    if pest_id:
        stmt = stmt.where(TreatmentPlan.pest_id == pest_id)
        count_stmt = count_stmt.where(TreatmentPlan.pest_id == pest_id)
        
    total = await db.scalar(count_stmt)
    stmt = stmt.offset((page - 1) * size).limit(size)
    
    result = await db.execute(stmt)
    plans = result.scalars().all()
    
    return paginate(plans, total, page, size)

@router.post("/recommendation", response_model=RecommendationResponse)
async def get_ai_recommendation(request: RecommendationRequest, db: AsyncSession = Depends(get_db)):
    """
    Get a dynamic treatment recommendation based on Crop and Disease/Pest.
    This queries the database for verified treatment plans and calculates dosages based on farm area.
    """
    # 1. Find the Crop
    crop_stmt = select(Crop).where(Crop.name.ilike(f"%{request.crop}%"))
    crop = (await db.execute(crop_stmt)).scalars().first()
    
    if not crop:
        return RecommendationResponse(success=False, message=f"Crop '{request.crop}' not found in knowledge base.")
        
    # 2. Try to find the disease or pest
    disease_stmt = select(CropDisease).options(selectinload(CropDisease.source)).where(
        CropDisease.crop_id == crop.id,
        CropDisease.name.ilike(f"%{request.disease}%")
    )
    disease = (await db.execute(disease_stmt)).scalars().first()
    
    pest_stmt = select(CropPest).options(selectinload(CropPest.source)).where(
        CropPest.crop_id == crop.id,
        CropPest.name.ilike(f"%{request.disease}%")
    )
    pest = (await db.execute(pest_stmt)).scalars().first()
    
    target = disease or pest
    if not target:
        return RecommendationResponse(success=False, message=f"Issue '{request.disease}' not found for crop '{crop.name}'.")
        
    # 3. Get Treatment Plans for this target
    plan_stmt = select(TreatmentPlan).options(
        selectinload(TreatmentPlan.medicine),
        selectinload(TreatmentPlan.source)
    )
    if disease:
        plan_stmt = plan_stmt.where(TreatmentPlan.disease_id == disease.id)
    else:
        plan_stmt = plan_stmt.where(TreatmentPlan.pest_id == pest.id)
        
    plans = (await db.execute(plan_stmt)).scalars().all()
    
    if not plans:
        return RecommendationResponse(success=False, message=f"No treatment plans found for '{target.name}'.")
        
    # Take the primary plan (first one)
    primary_plan = plans[0]
    
    # Calculate dose for farm area
    def scale_dosage(base_val: str, area: float) -> str:
        if not base_val: return "N/A"
        match = re.match(r"([\d\.]+)\s*(.*)", str(base_val).strip())
        if match:
            num, unit = match.groups()
            try:
                scaled = float(num) * area
                return f"{scaled:g} {unit}"
            except ValueError:
                pass
        return f"{base_val} (per acre, scale to {area} acres manually)"
        
    scaled_dose = scale_dosage(primary_plan.dosage_per_acre, request.farm_area)
    scaled_water = scale_dosage(primary_plan.water_per_acre, request.farm_area)
    
    alt_meds = [p.medicine.normalized_name.title() for p in plans[1:]] if len(plans) > 1 else None
    
    return RecommendationResponse(
        success=True,
        data=RecommendationDetail(
            disease=target.name,
            medicine=primary_plan.medicine.normalized_name.title(),
            alternative_medicine=", ".join(alt_meds) if alt_meds else None,
            organic_treatment=getattr(target, 'organic_control', None),
            dose=scaled_dose,
            water=scaled_water,
            spray_interval=primary_plan.spray_interval,
            recovery=getattr(target, 'recovery_time', getattr(target, 'recovery_estimate', None)),
            precautions=primary_plan.precautions,
            reference=primary_plan.source.document_name if primary_plan.source else target.source.document_name if getattr(target, 'source', None) else None,
            page_number=primary_plan.source.page_number if primary_plan.source else target.source.page_number if getattr(target, 'source', None) else None
        )
    )

@router.post("/calculate-dose", response_model=CalculateDoseResponse)
async def calculate_dose(request: CalculateDoseRequest):
    """Utility endpoint to scale base dosage by farm area."""
    def scale(base_val: str, area: float) -> str:
        match = re.match(r"([\d\.]+)\s*(.*)", str(base_val).strip())
        if match:
            num, unit = match.groups()
            try:
                scaled = float(num) * area
                return f"{scaled:g} {unit}"
            except ValueError:
                pass
        return base_val
        
    return CalculateDoseResponse(
        calculated_dose=scale(request.base_dose_per_acre, request.farm_area),
        calculated_water=scale(request.base_water_per_acre, request.farm_area)
    )
