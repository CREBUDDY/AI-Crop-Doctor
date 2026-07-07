from fastapi import APIRouter
from app.api.endpoints import auth, farms, analyze, history, library, weather, admin, location

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(library.router, prefix="/library", tags=["library"])
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(location.router, prefix="/location", tags=["location"])
