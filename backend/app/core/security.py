import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

# Initialize Firebase Admin
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
except Exception as e:
    # Handle missing credentials in development gracefully by mocking or warning
    print(f"Warning: Failed to initialize Firebase Admin SDK. {e}")

security = HTTPBearer()

def verify_firebase_token(token: str) -> dict:
    """
    Verifies a Firebase JWT ID token.
    Returns the decoded token dictionary if valid.
    Raises HTTPException if invalid.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
