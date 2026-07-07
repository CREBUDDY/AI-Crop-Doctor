from fastapi.testclient import TestClient
from app.main import app
from app.api.dependencies import get_current_user, AuthenticatedUser
import uuid

# Override the dependency
app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
    uid=str(uuid.uuid4()), 
    email="test@example.com", 
    role="farmer", 
    firebase_uid="test_uid"
)

client = TestClient(app)

# We need to make sure the user exists in DB first because of FK constraint
# Let's create a real user in DB directly, then use that user's ID
import asyncio
from app.infrastructure.database.session import SessionLocal
from app.infrastructure.database.models.user import User

async def setup():
    async with SessionLocal() as db:
        user_id = uuid.uuid4()
        user = User(
            id=user_id,
            firebase_uid="test_firebase_uid",
            name="Test User",
            email="test@example.com"
        )
        db.add(user)
        await db.commit()
        return user_id

def test():
    user_id = asyncio.run(setup())
    
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        uid=str(user_id), 
        email="test@example.com", 
        role="farmer", 
        firebase_uid="test_firebase_uid"
    )
    
    payload = {
        "name": "My Farm",
        "lat": 20.5,
        "lng": 78.9,
        "village": "Prayagraj",
        "state": "UP"
    }
    
    response = client.post("/api/v1/farms/", json=payload)
    print("STATUS:", response.status_code)
    print("RESPONSE:", response.json())

test()
