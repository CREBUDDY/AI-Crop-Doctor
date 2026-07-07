import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_analyze_unauthorized():
    """Test that the analyze endpoint rejects requests without a valid token."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Pass a dummy image file
        files = {'image': ('test.jpg', b'dummydata', 'image/jpeg')}
        data = {'farm_id': '123e4567-e89b-12d3-a456-426614174000'}
        response = await ac.post("/api/v1/analyze/", files=files, data=data)
    
    assert response.status_code == 401
    assert "Not authenticated" in response.json().get("detail", "")

@pytest.mark.asyncio
async def test_get_farm_weather_unauthorized():
    """Test that the weather endpoint rejects unauthenticated requests."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/weather/123e4567-e89b-12d3-a456-426614174000")
    
    assert response.status_code == 401
