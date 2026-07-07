from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.infrastructure.repositories.user import user_repo
from app.infrastructure.database.models.user import User

class UserService:
    async def get_or_create_by_firebase_uid(self, db: AsyncSession, firebase_uid: str, email: str = "") -> User:
        user = await user_repo.get_by_firebase_uid(db, firebase_uid=firebase_uid)
        if not user:
            # Create user if doesn't exist
            obj_in = {
                "firebase_uid": firebase_uid,
                "email": email,
                "name": email.split("@")[0] if email else "Farmer",
                "is_active": True
            }
            user = await user_repo.create(db, obj_in=obj_in)
        return user

user_service = UserService()
