from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.infrastructure.database.models.enums import AnalysisStatus, SeverityLevel, WaterStatus, SprayUnit

class DetectedIssue(BaseModel):
    name: str
    confidence: float
    severity: SeverityLevel
    notes: Optional[str] = None

class RecommendationSchema(BaseModel):
    medicine_id: int
    medicine_name: str
    dosage_quantity: float
    dosage_unit: SprayUnit
    water_litres: float
    area_acres: float
    instructions: Optional[str] = None

class AnalysisCreate(BaseModel):
    farm_id: Optional[UUID] = None
    crop_id: Optional[int] = None
    image_id: UUID

class AnalysisResponse(BaseModel):
    id: UUID
    status: AnalysisStatus
    health_score: Optional[int] = None
    overall_severity: Optional[SeverityLevel] = None
    water_status: Optional[WaterStatus] = None
    detected_diseases: List[DetectedIssue] = []
    detected_pests: List[DetectedIssue] = []
    recommendations: List[RecommendationSchema] = []
    weather_snapshot: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
