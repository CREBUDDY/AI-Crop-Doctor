from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.infrastructure.database.session import get_db
from app.infrastructure.database.models.library import Crop, Disease, Pest, Medicine
from app.infrastructure.repositories.base import BaseRepository

router = APIRouter()

crop_repo = BaseRepository(Crop)
disease_repo = BaseRepository(Disease)
pest_repo = BaseRepository(Pest)
medicine_repo = BaseRepository(Medicine)

@router.get("/crops")
async def list_crops(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List all verified crops."""
    return await crop_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/diseases")
async def list_diseases(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List all verified diseases."""
    return await disease_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/pests")
async def list_pests(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List all verified pests."""
    return await pest_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/medicines")
async def list_medicines(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List all verified medicines and treatments."""
    return await medicine_repo.get_multi(db, skip=skip, limit=limit)
