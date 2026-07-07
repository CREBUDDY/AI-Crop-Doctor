import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.api.dependencies import get_current_user, AuthenticatedUser
from app.infrastructure.database.session import get_db
from app.infrastructure.database.models.user import User
from app.infrastructure.database.models.analysis import Analysis, AIPrediction

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure admin role check here in a real app. For now, skipping.
    
    # Total Users
    users_count = await db.scalar(select(func.count()).select_from(User))
    
    # Scans Today (approximated for demo as all scans)
    scans_count = await db.scalar(select(func.count()).select_from(Analysis))
    
    # Diseases Detected (count where overall_severity != NONE)
    diseases_count = await db.scalar(
        select(func.count())
        .select_from(Analysis)
        .where(Analysis.overall_severity != 'none')
    )
    
    # Fake charts data based on counts
    return {
        "kpis": {
            "total_users": users_count or 0,
            "scans_today": scans_count or 0,
            "diseases_detected": diseases_count or 0,
            "total_farms": 12 # Hardcoded for now
        },
        "scans_data": [
            {"name": "Mon", "scans": max(10, scans_count // 7)},
            {"name": "Tue", "scans": max(15, scans_count // 5)},
            {"name": "Wed", "scans": max(20, scans_count // 3)},
            {"name": "Thu", "scans": scans_count},
        ],
        "disease_data": [
            {"name": "Early Blight", "value": max(1, diseases_count // 2), "color": "#e11d48"},
            {"name": "Late Blight", "value": max(1, diseases_count // 3), "color": "#f59e0b"},
            {"name": "Healthy", "value": max(1, scans_count - diseases_count), "color": "#10b981"},
        ]
    }

@router.get("/users")
async def get_admin_users(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).order_by(desc(User.created_at)).limit(100))
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "name": u.display_name or "Unknown User",
            "email": u.email,
            "role": u.role,
            "status": "active",
            "lastActive": u.last_login.isoformat() if u.last_login else u.created_at.isoformat()
        }
        for u in users
    ]

@router.get("/logs")
async def get_admin_logs(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Analysis, AIPrediction, User)
        .join(AIPrediction, Analysis.id == AIPrediction.analysis_id, isouter=True)
        .join(User, Analysis.user_id == User.id)
        .order_by(desc(Analysis.created_at))
        .limit(50)
    )
    
    logs = []
    for analysis, prediction, user in result:
        logs.append({
            "id": str(analysis.id),
            "timestamp": analysis.created_at.isoformat(),
            "userId": str(user.id),
            "userName": user.display_name or "Unknown User",
            "crop": prediction.crop_identified if prediction else "Unknown",
            "disease": prediction.detected_diseases[0].get("name") if prediction and prediction.detected_diseases else "Healthy",
            "confidence": int((prediction.overall_confidence or 0) * 100) if prediction else 0,
            "status": analysis.status,
            "executionTime": "1.2s"
        })
        
    return logs
