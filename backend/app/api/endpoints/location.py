import httpx
from fastapi import APIRouter, HTTPException, Depends
from app.api.dependencies import get_current_user, AuthenticatedUser
from app.core.config import settings

router = APIRouter()
OWM_GEO_URL = "http://api.openweathermap.org/geo/1.0"

@router.get("/reverse")
async def reverse_geocode(
    lat: float,
    lng: float,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        return {"name": "Default Village", "state": "Default State", "district": "Default District", "country": "IN"}
    
    async with httpx.AsyncClient() as client:
        url = f"{OWM_GEO_URL}/reverse?lat={lat}&lon={lng}&limit=1&appid={api_key}"
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Failed to fetch location data")
        
        data = resp.json()
        if not data:
            return {"name": "Unknown Location", "state": "Unknown State", "district": "Unknown District"}
        
        loc = data[0]
        return {
            "name": loc.get("name", "Unknown Village"),
            "state": loc.get("state", ""),
            "district": loc.get("local_names", {}).get("en", loc.get("name", "")),
            "country": loc.get("country", "")
        }

@router.get("/search")
async def search_location(
    query: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        return []
        
    async with httpx.AsyncClient() as client:
        url = f"{OWM_GEO_URL}/direct?q={query}&limit=5&appid={api_key}"
        resp = await client.get(url)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Failed to fetch location data")
            
        data = resp.json()
        return [
            {
                "name": loc.get("name"),
                "state": loc.get("state", ""),
                "country": loc.get("country", ""),
                "lat": loc.get("lat"),
                "lng": loc.get("lon")
            }
            for loc in data
        ]
