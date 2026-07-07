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
    is_guest: bool
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
        
        # Handle Anonymous Users
        email_to_save = current_user.email
        name_to_save = "Unknown User"
        
        if current_user.is_anonymous:
            email_to_save = email_to_save or f"guest_{current_user.firebase_uid}@guest.local"
            name_to_save = "Guest User"
        elif email_to_save:
            name_to_save = email_to_save.split('@')[0]
            
        user = User(
            firebase_uid=current_user.firebase_uid,
            email=email_to_save,
            name=name_to_save,
            role=new_role
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return {
        "uid": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "is_guest": current_user.is_anonymous,
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
        "role": current_user.role,
        "is_guest": current_user.is_anonymous
    }
