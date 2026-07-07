from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

class FarmBase(BaseModel):
    name: str = Field(..., max_length=255)
    area_acres: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(FarmBase):
    name: Optional[str] = None

class FarmCropBase(BaseModel):
    crop_id: int
    season: Optional[str] = None
    sowing_date: Optional[date] = None
    expected_harvest_date: Optional[date] = None
    area_acres: Optional[float] = None

class FarmCropCreate(FarmCropBase):
    pass

class FarmCropResponse(FarmCropBase):
    id: UUID
    farm_id: UUID
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class FarmInDB(FarmBase):
    id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FarmResponse(FarmInDB):
    crops: List[FarmCropResponse] = []
