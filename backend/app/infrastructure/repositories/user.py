from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infrastructure.database.models.user import User
from app.infrastructure.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    async def get_by_firebase_uid(self, db: AsyncSession, firebase_uid: str) -> Optional[User]:
        result = await db.execute(select(self.model).filter(self.model.firebase_uid == firebase_uid))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(self.model).filter(self.model.email == email))
        return result.scalars().first()

user_repo = UserRepository(User)
