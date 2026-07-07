from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.infrastructure.database.models.analysis import Analysis, ImageMetadata
from app.infrastructure.repositories.base import BaseRepository

class AnalysisRepository(BaseRepository[Analysis]):
    async def get_full_analysis(self, db: AsyncSession, analysis_id: UUID) -> Optional[Analysis]:
        result = await db.execute(
            select(self.model)
            .options(selectinload(self.model.image))
            .filter(self.model.id == analysis_id)
        )
        return result.scalars().first()
        
    async def get_by_user(self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 50) -> List[Analysis]:
        result = await db.execute(
            select(self.model)
            .options(selectinload(self.model.image))
            .filter(self.model.user_id == user_id)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

class ImageRepository(BaseRepository[ImageMetadata]):
    pass

analysis_repo = AnalysisRepository(Analysis)
image_repo = ImageRepository(ImageMetadata)
