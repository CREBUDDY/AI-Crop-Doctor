import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, text, Date, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    name = Column(String, nullable=False)
    area_acres = Column(Numeric)
    lat = Column(Numeric)
    lng = Column(Numeric)
    state = Column(String)
    district = Column(String)
    village = Column(String)
    soil_type = Column(String)
    irrigation_type = Column(String)
    is_active = Column(Boolean, nullable=False, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    deleted_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="farms")
    farm_crops = relationship("FarmCrop", back_populates="farm")


class FarmCrop(Base):
    __tablename__ = "farm_crops"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey('farms.id'), nullable=False)
    crop_id = Column(Integer, ForeignKey('crops.id'), nullable=False)
    season = Column(String)
    sowing_date = Column(Date)
    expected_harvest_date = Column(Date)
    area_acres = Column(Numeric)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)

    @property
    def current_stage(self) -> str:
        """Estimate the crop stage based on days since sowing."""
        if not self.sowing_date:
            return "Unknown"
        days = (datetime.utcnow().date() - self.sowing_date).days
        if days < 0:
            return "Not Sown Yet"
        elif days <= 15:
            return "Seedling"
        elif days <= 45:
            return "Vegetative"
        elif days <= 75:
            return "Reproductive (Flowering)"
        else:
            return "Maturity/Harvesting"

    # Relationships
    farm = relationship("Farm", back_populates="farm_crops")
    crop = relationship("Crop")
