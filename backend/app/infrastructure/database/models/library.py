from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, text, Date, Integer, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base
from .enums import LanguageCode, SprayUnit, RecommendationStatus

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False, index=True)
    scientific_name = Column(String)
    family = Column(String)
    description = Column(Text)
    growing_season = Column(String)
    image_url = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)


class Disease(Base):
    __tablename__ = "diseases"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)
    scientific_name = Column(String)
    category = Column(String)
    description = Column(Text)
    spread_mechanism = Column(Text)
    favorable_conditions = Column(Text)
    prevention_measures = Column(Text)
    image_url = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    updated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))


class Pest(Base):
    __tablename__ = "pests"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)
    scientific_name = Column(String)
    category = Column(String)
    description = Column(Text)
    lifecycle = Column(Text)
    favorable_conditions = Column(Text)
    image_url = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    updated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))


class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, index=True)
    trade_name = Column(String)
    active_ingredient = Column(String)
    formulation_type = Column(String)
    category = Column(String)
    dosage_quantity = Column(Numeric)
    dosage_unit = Column(SAEnum(SprayUnit, name="spray_unit"))
    water_litres_per_acre = Column(Numeric)
    spray_time_recommendation = Column(String)
    spray_interval_days = Column(Integer)
    max_sprays_per_season = Column(Integer)
    waiting_period_days = Column(Integer)
    source = Column(String)
    source_url = Column(Text)
    last_updated = Column(Date)
    version = Column(String)
    approved_by = Column(String)
    status = Column(SAEnum(RecommendationStatus, name="recommendation_status"), default=RecommendationStatus.ACTIVE)
    toxicity_class = Column(String)
    precautions = Column(Text)
    first_aid = Column(Text)
    ppe_required = Column(Text)
    is_organic = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    updated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))


class MedicineDisease(Base):
    __tablename__ = "medicine_diseases"
    
    medicine_id = Column(Integer, ForeignKey('medicines.id', ondelete='CASCADE'), primary_key=True)
    disease_id = Column(Integer, ForeignKey('diseases.id', ondelete='CASCADE'), primary_key=True)
    efficacy_rating = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)


class MedicinePest(Base):
    __tablename__ = "medicine_pests"
    
    medicine_id = Column(Integer, ForeignKey('medicines.id', ondelete='CASCADE'), primary_key=True)
    pest_id = Column(Integer, ForeignKey('pests.id', ondelete='CASCADE'), primary_key=True)
    efficacy_rating = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)


class MedicineCrop(Base):
    __tablename__ = "medicine_crops"
    
    medicine_id = Column(Integer, ForeignKey('medicines.id', ondelete='CASCADE'), primary_key=True)
    crop_id = Column(Integer, ForeignKey('crops.id', ondelete='CASCADE'), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)

