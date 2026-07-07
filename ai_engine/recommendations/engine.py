from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ai_engine.schemas import AIPipelineOutput, Recommendation
from app.infrastructure.database.models.library import Disease, Pest, Medicine, MedicineDisease, MedicinePest
from app.infrastructure.database.models.enums import RecommendationStatus

class RecommendationEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recommendations(self, vision_output: AIPipelineOutput) -> List[Recommendation]:
        """
        Takes the detected diseases and pests and queries the database for verified active treatments.
        """
        recommendations = []
        
        # 1. Handle Diseases
        for disease_info in vision_output.detected_diseases:
            # Find the disease in DB
            disease = await self._find_disease_by_name(disease_info.name)
            if disease:
                # Find medicines for this disease
                meds = await self._get_medicines_for_disease(disease.id)
                for med in meds:
                    recommendations.append(self._format_recommendation(med, f"Treats {disease_info.name}"))
                    
        # 2. Handle Pests
        for pest_info in vision_output.detected_pests:
            # Find the pest in DB
            pest = await self._find_pest_by_name(pest_info.name)
            if pest:
                # Find medicines for this pest
                meds = await self._get_medicines_for_pest(pest.id)
                for med in meds:
                    recommendations.append(self._format_recommendation(med, f"Controls {pest_info.name}"))

        # In a real scenario, we might want to deduplicate recommendations if one medicine covers both.
        return recommendations

    async def _find_disease_by_name(self, name: str) -> Disease:
        # Case insensitive search
        stmt = select(Disease).where(Disease.name.ilike(f"%{name}%")).limit(1)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def _find_pest_by_name(self, name: str) -> Pest:
        stmt = select(Pest).where(Pest.name.ilike(f"%{name}%")).limit(1)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def _get_medicines_for_disease(self, disease_id: int) -> List[Medicine]:
        stmt = (
            select(Medicine)
            .join(MedicineDisease, Medicine.id == MedicineDisease.medicine_id)
            .where(
                MedicineDisease.disease_id == disease_id,
                Medicine.status == RecommendationStatus.ACTIVE,
                Medicine.is_active == True
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()
        
    async def _get_medicines_for_pest(self, pest_id: int) -> List[Medicine]:
        stmt = (
            select(Medicine)
            .join(MedicinePest, Medicine.id == MedicinePest.medicine_id)
            .where(
                MedicinePest.pest_id == pest_id,
                Medicine.status == RecommendationStatus.ACTIVE,
                Medicine.is_active == True
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    def _format_recommendation(self, med: Medicine, reason: str) -> Recommendation:
        return Recommendation(
            medicine_name=med.name,
            active_ingredient=med.active_ingredient or "Unknown",
            dosage_quantity=float(med.dosage_quantity) if med.dosage_quantity else 0.0,
            dosage_unit=str(med.dosage_unit.value) if med.dosage_unit else "ml",
            water_litres_per_acre=float(med.water_litres_per_acre) if med.water_litres_per_acre else 150.0,
            instructions=f"{reason}. {med.spray_time_recommendation or ''} {med.precautions or ''}"
        )
