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
    # Use Nominatim for better village search
    async with httpx.AsyncClient() as client:
        url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=10&countrycodes=in&addressdetails=1"
        headers = {"User-Agent": "AICropDoctor/1.0"}
        try:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Failed to fetch location data")
                
            data = resp.json()
            results = []
            for loc in data:
                address = loc.get("address", {})
                # Try to get the most specific name
                name = address.get("village") or address.get("town") or address.get("city") or address.get("county") or loc.get("name")
                state = address.get("state", "")
                results.append({
                    "name": name,
                    "state": state,
                    "country": address.get("country", ""),
                    "lat": float(loc.get("lat")),
                    "lng": float(loc.get("lon")),
                    "display_name": loc.get("display_name")
                })
            return results
        except Exception as e:
            # Fallback to OpenWeatherMap if Nominatim fails
            api_key = settings.OPENWEATHER_API_KEY
            if not api_key:
                return []
            url = f"{OWM_GEO_URL}/direct?q={query}&limit=5&appid={api_key}"
            resp = await client.get(url)
            if resp.status_code != 200:
                return []
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
