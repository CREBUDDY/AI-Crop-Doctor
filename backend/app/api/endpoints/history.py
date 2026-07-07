from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.api.dependencies import get_current_user, AuthenticatedUser
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.analysis import analysis_repo
from app.domain.entities.analysis import AnalysisResponse

router = APIRouter()

@router.get("/", response_model=List[AnalysisResponse])
async def get_analysis_history(
    skip: int = 0,
    limit: int = 50,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the history of crop analyses performed by the authenticated user.
    """
    return await analysis_repo.get_by_user(db, user_id=UUID(current_user.uid), skip=skip, limit=limit)
