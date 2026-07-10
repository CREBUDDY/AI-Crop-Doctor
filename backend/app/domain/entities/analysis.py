from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from app.infrastructure.database.models.enums import AnalysisStatus, SeverityLevel, WaterStatus, SprayUnit
from enum import Enum

class RecommendationType(str, Enum):
    PREVENTIVE = "PREVENTIVE"
    CURATIVE = "CURATIVE"

class DetectedIssue(BaseModel):
    name: str
    confidence: float
    severity: SeverityLevel
    notes: Optional[str] = None

class ExplanationSchema(BaseModel):
    why_this_medicine: str
    why_this_dosage: str
    why_this_spray_interval: str
    why_this_irrigation_advice: str
    confidence_score: float
    source_document: Optional[str] = None
    reference_organization: Optional[str] = None

class RecommendationSchema(BaseModel):
    disease: str
    medicine: str
    alternative_medicine: Optional[str] = None
    organic_treatment: Optional[str] = None
    dose: str
    water: str
    spray_interval: Optional[str] = None
    recovery: Optional[str] = None
    precautions: Optional[str] = None
    reference: Optional[str] = None
    page_number: Optional[str] = None
    explanation: Optional[ExplanationSchema] = None

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

class WeatherContext(BaseModel):
    temperature_c: float
    humidity_pct: int
    rainfall_mm_24h: float
    rain_probability_pct: int
    wind_speed_kmh: float
    weather_risk_level: str
    fungal_risk_score: float
    spray_safe: bool
    spray_advisory: str
    irrigation_advisory: str

class FarmContext(BaseModel):
    farm_id: Optional[UUID] = None
    area_acres: float
    crop_stage: str

class ActionPlan(BaseModel):
    treatments: List[RecommendationSchema]
    irrigation_advice: str
    spray_advisory: str

class WeatherIntelligenceReport(BaseModel):
    disease_risk: str
    rain_impact: str
    spray_suitability: str
    irrigation_advice: str
    humidity_alert: Optional[str] = None
    wind_alert: Optional[str] = None
    temperature_impact: str

class DecisionEngineResponse(BaseModel):
    analysis_id: UUID
    crop_identified: Optional[str] = None
    health_score: int
    recommendation_type: RecommendationType
    detection: Dict[str, Any]
    weather_context: Optional[WeatherContext] = None
    weather_intelligence: Optional[WeatherIntelligenceReport] = None
    farm_context: FarmContext
    action_plan: ActionPlan
    created_at: datetime
