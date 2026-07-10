from sqlalchemy import Column, String, Integer, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.infrastructure.database.models.base import Base

class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(Integer, primary_key=True)
    source_organization = Column(String(255), nullable=False)
    document_name = Column(String(255), nullable=False)
    page_number = Column(String(50))
    section_name = Column(String(255))
    
    crops = relationship("Crop", back_populates="source")
    diseases = relationship("CropDisease", back_populates="source")
    pests = relationship("CropPest", back_populates="source")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    scientific_name = Column(String(100))
    growing_season = Column(String(100))
    climate = Column(Text)
    soil_type = Column(Text)
    ideal_temperature = Column(Text)
    ideal_humidity = Column(String(100))
    rainfall_requirement = Column(Text)
    growth_stages = Column(ARRAY(String))
    source_id = Column(Integer, ForeignKey("knowledge_sources.id"))

    source = relationship("KnowledgeSource", back_populates="crops")
    diseases = relationship("CropDisease", back_populates="crop", cascade="all, delete-orphan")
    pests = relationship("CropPest", back_populates="crop", cascade="all, delete-orphan")


class CropDisease(Base):
    __tablename__ = "crop_diseases"

    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False, index=True)
    scientific_name = Column(Text)
    disease_type = Column(String(50), index=True)
    symptoms = Column(Text)
    early_symptoms = Column(Text)
    advanced_symptoms = Column(Text)
    cause = Column(Text)
    favourable_weather = Column(Text)
    crop_stage = Column(Text)
    severity = Column(String(50))
    preventive_measures = Column(Text)
    organic_control = Column(Text)
    biological_control = Column(Text)
    chemical_control = Column(Text)
    recovery_time = Column(Text)
    yield_loss = Column(Text)
    notes = Column(Text)
    source_id = Column(Integer, ForeignKey("knowledge_sources.id"))

    crop = relationship("Crop", back_populates="diseases")
    source = relationship("KnowledgeSource", back_populates="diseases")
    treatment_plans = relationship("TreatmentPlan", back_populates="disease", cascade="all, delete-orphan")


class CropPest(Base):
    __tablename__ = "crop_pests"

    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False, index=True)
    scientific_name = Column(Text)
    damage_symptoms = Column(Text)
    identification = Column(Text)
    favourable_weather = Column(Text)
    preventive_measures = Column(Text)
    biological_control = Column(Text)
    chemical_control = Column(Text)
    recovery_estimate = Column(Text)
    source_id = Column(Integer, ForeignKey("knowledge_sources.id"))

    crop = relationship("Crop", back_populates="pests")
    source = relationship("KnowledgeSource", back_populates="pests")
    treatment_plans = relationship("TreatmentPlan", back_populates="pest", cascade="all, delete-orphan")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True)
    normalized_name = Column(String(255), nullable=False, unique=True, index=True)
    active_ingredient = Column(String(255))
    formulation = Column(String(100))
    category = Column(String(100), index=True)

    treatment_plans = relationship("TreatmentPlan", back_populates="medicine")


class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"

    id = Column(Integer, primary_key=True)
    disease_id = Column(Integer, ForeignKey("crop_diseases.id", ondelete="CASCADE"), index=True, nullable=True)
    pest_id = Column(Integer, ForeignKey("crop_pests.id", ondelete="CASCADE"), index=True, nullable=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="RESTRICT"), index=True)
    dosage_per_acre = Column(Text)
    water_per_acre = Column(Text)
    spray_interval = Column(Text)
    maximum_sprays = Column(String(50))
    waiting_period = Column(Text)
    crop_stage = Column(Text)
    precautions = Column(Text)
    source_id = Column(Integer, ForeignKey("knowledge_sources.id"))

    disease = relationship("CropDisease", back_populates="treatment_plans")
    pest = relationship("CropPest", back_populates="treatment_plans")
    medicine = relationship("Medicine", back_populates="treatment_plans")
