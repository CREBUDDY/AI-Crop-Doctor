from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.api.dependencies import get_current_user, AuthenticatedUser
from app.infrastructure.database.session import get_db
from app.domain.entities.farm import FarmCreate, FarmResponse, FarmUpdate
from app.services.farm import farm_service

router = APIRouter()

@router.post("/", response_model=FarmResponse)
async def create_farm(
    farm_in: FarmCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new farm for the authenticated user."""
    return await farm_service.create_farm(db, UUID(current_user.uid), farm_in)

@router.get("/", response_model=List[FarmResponse])
async def list_farms(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all active farms for the authenticated user."""
    return await farm_service.get_user_farms(db, UUID(current_user.uid))

@router.get("/{farm_id}", response_model=FarmResponse)
async def get_farm(
    farm_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific farm by ID."""
    return await farm_service.get_farm(db, farm_id, UUID(current_user.uid))

@router.delete("/{farm_id}")
async def delete_farm(
    farm_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a farm (soft delete)."""
    await farm_service.delete_farm(db, farm_id, UUID(current_user.uid))
    return {"message": "Farm deleted successfully"}
