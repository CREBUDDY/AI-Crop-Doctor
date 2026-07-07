from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.infrastructure.database.models.farm import Farm
from app.infrastructure.repositories.base import BaseRepository

class FarmRepository(BaseRepository[Farm]):
    async def get_by_user(self, db: AsyncSession, user_id: UUID) -> List[Farm]:
        result = await db.execute(
            select(self.model)
            .options(selectinload(self.model.farm_crops))
            .filter(self.model.user_id == user_id, self.model.is_deleted == False)
        )
        return result.scalars().all()

farm_repo = FarmRepository(Farm)
