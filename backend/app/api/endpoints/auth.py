from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.dependencies import get_current_user, AuthenticatedUser
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models.user import User
from app.infrastructure.database.models.enums import UserRole

router = APIRouter()

class SyncResponse(BaseModel):
    uid: str
    email: str
    role: str
    message: str

@router.post("/sync", response_model=SyncResponse)
async def sync_user(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Called by the frontend immediately after Firebase login.
    Ensures the user exists in the PostgreSQL database.
    Returns the user's role from the database.
    """
    
    result = await db.execute(select(User).where(User.firebase_uid == current_user.firebase_uid))
    user = result.scalars().first()
    
    if not user:
        new_role = UserRole.ADMIN if (current_user.email and "admin" in current_user.email.lower()) else UserRole.FARMER
        user = User(
            firebase_uid=current_user.firebase_uid,
            email=current_user.email,
            name=current_user.email.split('@')[0] if current_user.email else "Unknown User",
            role=new_role
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return {
        "uid": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "message": "User synced successfully"
    }

@router.get("/me")
async def get_my_profile(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Returns the current authenticated user's profile.
    """
    return {
        "uid": current_user.uid,
        "email": current_user.email,
        "role": current_user.role
    }
