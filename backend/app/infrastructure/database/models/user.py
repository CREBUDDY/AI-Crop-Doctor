import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum, ForeignKey, CheckConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base
from .enums import UserRole, LanguageCode

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), index=True)
    email = Column(String(255), index=True)
    role = Column(SAEnum(UserRole, name="user_role"), nullable=False, default=UserRole.FARMER)
    state = Column(String(100))
    district = Column(String(100))
    village = Column(String(100))
    pincode = Column(String(10))
    preferred_language = Column(SAEnum(LanguageCode, name="language_code"), nullable=False, default=LanguageCode.EN)
    profile_image_url = Column(String)
    is_verified = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime(timezone=True))
    
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    is_deleted = Column(Boolean, nullable=False, default=False)
    deleted_at = Column(DateTime(timezone=True))
    
    __table_args__ = (
        CheckConstraint('phone IS NOT NULL OR email IS NOT NULL', name='chk_users_phone_or_email'),
        CheckConstraint(
            '(is_deleted = FALSE AND deleted_at IS NULL) OR (is_deleted = TRUE AND deleted_at IS NOT NULL)', 
            name='chk_users_deleted'
        ),
    )

    # Relationships
    farms = relationship("Farm", back_populates="user")
    fcm_tokens = relationship("FCMToken", back_populates="user", cascade="all, delete-orphan")


class FCMToken(Base):
    __tablename__ = "fcm_tokens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token = Column(String, nullable=False, index=True)
    device_type = Column(String(50))
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text('NOW()'), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text('NOW()'), onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="fcm_tokens")
