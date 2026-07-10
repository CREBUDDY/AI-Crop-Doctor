from pydantic import BaseModel, Field
from typing import List, Optional, Any

# =======================
# Base Models & Responses
# =======================
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

# =======================
# Crop Schemas
# =======================
class CropBase(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    growing_season: Optional[str] = None
    climate: Optional[str] = None
    soil_type: Optional[str] = None
    ideal_temperature: Optional[str] = None
    ideal_humidity: Optional[str] = None
    rainfall_requirement: Optional[str] = None
    growth_stages: Optional[List[str]] = None

class CropResponse(CropBase):
    id: int
    
    class Config:
        from_attributes = True

class CropListResponse(PaginatedResponse):
    items: List[CropResponse]

# =======================
# Disease Schemas
# =======================
class DiseaseBase(BaseModel):
    name: str
    disease_type: Optional[str] = None
    symptoms: Optional[str] = None
    cause: Optional[str] = None
    favourable_weather: Optional[str] = None
    severity: Optional[str] = None

class DiseaseDetailResponse(DiseaseBase):
    id: int
    crop_id: int
    scientific_name: Optional[str] = None
    early_symptoms: Optional[str] = None
    advanced_symptoms: Optional[str] = None
    crop_stage: Optional[str] = None
    preventive_measures: Optional[str] = None
    organic_control: Optional[str] = None
    biological_control: Optional[str] = None
    chemical_control: Optional[str] = None
    recovery_time: Optional[str] = None
    yield_loss: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class DiseaseResponse(DiseaseBase):
    id: int
    crop_id: int
    
    class Config:
        from_attributes = True

class DiseaseListResponse(PaginatedResponse):
    items: List[DiseaseResponse]

# =======================
# Pest Schemas
# =======================
class PestBase(BaseModel):
    name: str
    scientific_name: Optional[str] = None
    damage_symptoms: Optional[str] = None
    identification: Optional[str] = None
    favourable_weather: Optional[str] = None

class PestResponse(PestBase):
    id: int
    crop_id: int
    
    class Config:
        from_attributes = True

class PestListResponse(PaginatedResponse):
    items: List[PestResponse]

# =======================
# Medicine Schemas
# =======================
class MedicineBase(BaseModel):
    normalized_name: str
    active_ingredient: Optional[str] = None
    formulation: Optional[str] = None
    category: Optional[str] = None

class MedicineResponse(MedicineBase):
    id: int
    
    class Config:
        from_attributes = True

class MedicineListResponse(PaginatedResponse):
    items: List[MedicineResponse]

# =======================
# Recommendation Schemas
# =======================
class TreatmentPlanBase(BaseModel):
    dosage_per_acre: Optional[str] = None
    water_per_acre: Optional[str] = None
    spray_interval: Optional[str] = None
    maximum_sprays: Optional[str] = None
    waiting_period: Optional[str] = None
    crop_stage: Optional[str] = None
    precautions: Optional[str] = None

class TreatmentPlanResponse(TreatmentPlanBase):
    id: int
    disease_id: Optional[int] = None
    pest_id: Optional[int] = None
    medicine_id: int
    medicine: Optional[MedicineResponse] = None
    
    class Config:
        from_attributes = True

class TreatmentPlanListResponse(PaginatedResponse):
    items: List[TreatmentPlanResponse]

class RecommendationRequest(BaseModel):
    crop: str = Field(..., description="Name of the crop (e.g., 'Rice')")
    disease: str = Field(..., description="Name of the disease or pest (e.g., 'Rice Blast')")
    farm_area: float = Field(..., gt=0, description="Farm area in acres")

class RecommendationDetail(BaseModel):
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

class RecommendationResponse(BaseModel):
    success: bool
    data: Optional[RecommendationDetail] = None
    message: Optional[str] = None

class CalculateDoseRequest(BaseModel):
    base_dose_per_acre: str = Field(..., description="Base dose per acre (e.g., '500 ml')")
    base_water_per_acre: str = Field(..., description="Base water per acre (e.g., '200 Litres')")
    farm_area: float = Field(..., gt=0, description="Farm area in acres")

class CalculateDoseResponse(BaseModel):
    calculated_dose: str
    calculated_water: str
