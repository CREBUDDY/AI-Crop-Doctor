import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, ForeignKey, text, Date, Integer, Text, BigInteger, SmallInteger, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .base import Base
from .enums import ImageSource, AIProvider, WaterStatus, AnalysisStatus, SeverityLevel, PopulationLevel, SprayUnit, WeatherRiskLevel

class ImageMetadata(Base):
    __tablename__ = "image_metadata"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey('farms.id'))
    storage_path = Column(Text, nullable=False)
    download_url = Column(Text)
    file_size_bytes = Column(BigInteger)
    width_px = Column(Integer)
    height_px = Column(Integer)
    mime_type = Column(String)
    source = Column(SAEnum(ImageSource, name="image_source"))
    captured_at = Column(DateTime(timezone=True))
    lat = Column(Numeric)
    lng = Column(Numeric)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    
    prediction = relationship("AIPrediction", back_populates="image", uselist=False)
    analysis = relationship("Analysis", back_populates="image", uselist=False)


class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_id = Column(UUID(as_uuid=True), ForeignKey('image_metadata.id'), nullable=False)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analyses.id'))
    ai_provider = Column(SAEnum(AIProvider, name="ai_provider"))
    model_version = Column(String)
    raw_response = Column(JSONB)
    crop_identified = Column(String)
    crop_confidence = Column(Numeric)
    detected_diseases = Column(JSONB)
    detected_pests = Column(JSONB)
    leaf_condition_score = Column(Numeric)
    color_analysis_score = Column(Numeric)
    water_status = Column(SAEnum(WaterStatus, name="water_status"))
    water_status_score = Column(Numeric)
    overall_confidence = Column(Numeric)
    low_confidence = Column(Boolean, default=False)
    latency_ms = Column(Integer)
    tokens_used = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)

    image = relationship("ImageMetadata", back_populates="prediction")


class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey('farms.id'))
    crop_id = Column(Integer, ForeignKey('crops.id'))
    image_id = Column(UUID(as_uuid=True), ForeignKey('image_metadata.id'))
    ai_prediction_id = Column(UUID(as_uuid=True), ForeignKey('ai_predictions.id'))
    
    status = Column(SAEnum(AnalysisStatus, name="analysis_status"), default=AnalysisStatus.PENDING)
    error_message = Column(Text)
    
    health_score = Column(SmallInteger)
    disease_severity_score = Column(SmallInteger)
    pest_severity_score = Column(SmallInteger)
    leaf_condition_score = Column(SmallInteger)
    color_analysis_score = Column(SmallInteger)
    weather_risk_score = Column(SmallInteger)
    water_status_score = Column(SmallInteger)
    overall_severity = Column(SAEnum(SeverityLevel, name="severity_level"))
    water_status = Column(SAEnum(WaterStatus, name="water_status"))
    
    low_confidence = Column(Boolean, default=False)
    ai_confidence = Column(Numeric)
    area_acres = Column(Numeric)
    farm_state = Column(String)
    weather_snapshot = Column(JSONB)
    processing_time_ms = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)

    image = relationship("ImageMetadata", back_populates="analysis")


class AnalysisRecommendation(Base):
    __tablename__ = "analysis_recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analyses.id'), nullable=False)
    medicine_id = Column(Integer, ForeignKey('medicines.id'), nullable=False)
    recommended_for_disease_id = Column(Integer, ForeignKey('diseases.id'))
    recommended_for_pest_id = Column(Integer, ForeignKey('pests.id'))
    
    dosage_quantity = Column(Numeric)
    dosage_unit = Column(SAEnum(SprayUnit, name="spray_unit"))
    water_litres = Column(Numeric)
    area_acres = Column(Numeric)
    total_medicine_quantity = Column(Numeric)
    total_water_litres = Column(Numeric)
    estimated_spray_time_min = Column(Integer)
    
    source = Column(String)
    source_url = Column(Text)
    data_version = Column(String)
    last_updated = Column(Date)
    approved_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey('farms.id'))
    
    lat = Column(Numeric)
    lng = Column(Numeric)
    
    temperature_c = Column(Numeric)
    feels_like_c = Column(Numeric)
    humidity_pct = Column(Integer)
    wind_speed_kmh = Column(Numeric)
    wind_direction_deg = Column(Integer)
    cloud_cover_pct = Column(Integer)
    uv_index = Column(Numeric)
    visibility_km = Column(Numeric)
    rainfall_mm_24h = Column(Numeric)
    
    rain_forecast_6h = Column(Boolean)
    rain_forecast_12h = Column(Boolean)
    rain_forecast_24h = Column(Boolean)
    rain_probability_pct = Column(Integer)
    
    weather_risk_level = Column(SAEnum(WeatherRiskLevel, name="weather_risk_level"))
    fungal_risk_score = Column(Numeric)
    frost_risk = Column(Boolean)
    heat_stress_risk = Column(Boolean)
    
    spray_advisory = Column(Text)
    spray_safe = Column(Boolean)
    
    provider = Column(String)
    provider_timestamp = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
