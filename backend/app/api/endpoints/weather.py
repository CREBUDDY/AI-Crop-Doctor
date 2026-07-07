import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user, AuthenticatedUser
from app.infrastructure.database.session import get_db
from app.domain.entities.weather import WeatherResponse
from app.services.weather import weather_service

router = APIRouter()

@router.get("/location", response_model=WeatherResponse)
async def get_location_weather(
    lat: float,
    lng: float,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get hyper-local weather intelligence for a specific lat/lon.
    """
    return await weather_service.get_weather_for_location(db, lat, lng, uuid.UUID(current_user.uid))

@router.get("/{farm_id}", response_model=WeatherResponse)
async def get_farm_weather(
    farm_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get hyper-local weather intelligence for a specific farm.
    """
    return await weather_service.get_weather_for_farm(db, farm_id, uuid.UUID(current_user.uid))
