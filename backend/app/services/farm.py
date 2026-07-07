from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from fastapi import HTTPException
from app.infrastructure.repositories.farm import farm_repo
from app.infrastructure.database.models.farm import Farm
from app.domain.entities.farm import FarmCreate, FarmUpdate

class FarmService:
    async def get_user_farms(self, db: AsyncSession, user_id: UUID) -> List[Farm]:
        return await farm_repo.get_by_user(db, user_id=user_id)

    async def create_farm(self, db: AsyncSession, user_id: UUID, farm_in: FarmCreate) -> Farm:
        obj_in = farm_in.model_dump()
        obj_in["user_id"] = user_id
        return await farm_repo.create(db, obj_in=obj_in)

    async def get_farm(self, db: AsyncSession, farm_id: UUID, user_id: UUID) -> Farm:
        farm = await farm_repo.get(db, id=farm_id)
        if not farm or farm.user_id != user_id:
            raise HTTPException(status_code=404, detail="Farm not found")
        return farm

    async def delete_farm(self, db: AsyncSession, farm_id: UUID, user_id: UUID) -> Farm:
        farm = await self.get_farm(db, farm_id, user_id)
        # Soft delete
        return await farm_repo.update(db, db_obj=farm, obj_in={"is_deleted": True})

farm_service = FarmService()
