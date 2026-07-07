from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import security, verify_firebase_token
from typing import Optional, List
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models.user import User

# Basic Pydantic model representing the authenticated user state
class AuthenticatedUser:
    def __init__(self, uid: str, email: str, role: str, firebase_uid: str, is_anonymous: bool = False):
        self.uid = uid
        self.firebase_uid = firebase_uid
        self.email = email
        self.role = role
        self.is_anonymous = is_anonymous

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> AuthenticatedUser:
    """
    Extracts the Bearer token, verifies it with Firebase, 
    and looks up the user in PostgreSQL to attach their Role and internal UUID.
    """
    token = credentials.credentials
    decoded_token = verify_firebase_token(token)
    
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email", "")
    
    # Check if the user is a Firebase anonymous user
    sign_in_provider = decoded_token.get("firebase", {}).get("sign_in_provider")
    is_anonymous = sign_in_provider == "anonymous"
    
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalars().first()
    
    if not user:
        # User not in DB yet (e.g. during /sync)
        return AuthenticatedUser(uid=str(uuid.uuid4()), email=email, role="farmer", firebase_uid=firebase_uid, is_anonymous=is_anonymous)
        
    return AuthenticatedUser(uid=str(user.id), email=user.email, role=user.role.value, firebase_uid=firebase_uid, is_anonymous=is_anonymous)

class RequireRole:
    """
    Dependency to enforce Role-Based Access Control (RBAC).
    Usage: Depends(RequireRole(["admin", "agronomist"]))
    """
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: AuthenticatedUser = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action."
            )
        return user
