from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from uuid import UUID
from datetime import date
from app.infrastructure.database.models.library import Disease, Pest, Medicine, MedicineDisease, MedicinePest, MedicineStateOverride
from app.infrastructure.database.models.analysis import AnalysisRecommendation
from app.infrastructure.database.models.enums import RecommendationStatus, SeverityLevel

class RecommendationService:
    def __init__(self):
        # Severity multipliers for dosage calculations
        self.severity_multipliers = {
            SeverityLevel.NONE: 0.0,
            SeverityLevel.LOW: 0.8,     # 80% of standard dose
            SeverityLevel.MEDIUM: 1.0,  # Standard label dose
            SeverityLevel.HIGH: 1.2,    # 120% of standard dose
            SeverityLevel.CRITICAL: 1.5 # 150% of standard dose (max allowed)
        }

    async def generate_recommendations(
        self, 
        db: AsyncSession, 
        analysis_id: UUID, 
        detected_diseases: List[Dict[str, Any]], 
        detected_pests: List[Dict[str, Any]],
        farm_area_acres: float,
        farm_state: str
    ) -> List[AnalysisRecommendation]:
        """
        Advanced engine: Finds medicines, applies state overrides, scales by severity, 
        and calculates total quantities.
        """
        recommendations = []
        
        # Process Diseases
        for disease_info in detected_diseases:
            disease_name = disease_info.get("name")
            severity = SeverityLevel(disease_info.get("severity", "medium").lower())
            
            disease = await self._find_disease(db, disease_name)
            if disease:
                meds = await self._get_medicines_for_disease(db, disease.id)
                for med in meds:
                    rec = await self._create_recommendation_record(
                        db=db,
                        analysis_id=analysis_id,
                        medicine=med,
                        severity=severity,
                        farm_area_acres=farm_area_acres,
                        farm_state=farm_state,
                        disease_id=disease.id,
                        pest_id=None
                    )
                    recommendations.append(rec)
                    
        # Process Pests (Similar flow)
        for pest_info in detected_pests:
            pest_name = pest_info.get("name")
            severity = SeverityLevel(pest_info.get("severity", "medium").lower())
            
            pest = await self._find_pest(db, pest_name)
            if pest:
                meds = await self._get_medicines_for_pest(db, pest.id)
                for med in meds:
                    rec = await self._create_recommendation_record(
                        db=db,
                        analysis_id=analysis_id,
                        medicine=med,
                        severity=severity,
                        farm_area_acres=farm_area_acres,
                        farm_state=farm_state,
                        disease_id=None,
                        pest_id=pest.id
                    )
                    recommendations.append(rec)
                    
        return recommendations

    async def _create_recommendation_record(
        self, db: AsyncSession, analysis_id: UUID, medicine: Medicine, 
        severity: SeverityLevel, farm_area_acres: float, farm_state: str,
        disease_id: int = None, pest_id: int = None
    ) -> AnalysisRecommendation:
        
        # Base dosages
        base_dosage = medicine.dosage_quantity or 0.0
        base_water = medicine.water_litres_per_acre or 150.0
        
        # 1. Check for State Overrides
        override_stmt = select(MedicineStateOverride).where(
            MedicineStateOverride.medicine_id == medicine.id,
            MedicineStateOverride.state.ilike(f"%{farm_state}%")
        )
        result = await db.execute(override_stmt)
        override = result.scalars().first()
        
        if override:
            base_dosage = override.dosage_quantity or base_dosage
            base_water = override.water_litres_per_acre or base_water
            
        # 2. Scale by Severity
        multiplier = self.severity_multipliers.get(severity, 1.0)
        
        # 3. Calculate Totals based on Farm Area
        final_dosage_per_acre = float(base_dosage) * multiplier
        total_medicine = final_dosage_per_acre * farm_area_acres
        total_water = float(base_water) * farm_area_acres
        
        # Estimated time: roughly 30 mins per acre
        est_time = int(farm_area_acres * 30)
        
        rec = AnalysisRecommendation(
            analysis_id=analysis_id,
            medicine_id=medicine.id,
            recommended_for_disease_id=disease_id,
            recommended_for_pest_id=pest_id,
            dosage_quantity=final_dosage_per_acre,
            dosage_unit=medicine.dosage_unit,
            water_litres=base_water,
            area_acres=farm_area_acres,
            total_medicine_quantity=total_medicine,
            total_water_litres=total_water,
            estimated_spray_time_min=est_time,
            source=override.source if override else medicine.source,
            last_updated=date.today()
        )
        db.add(rec)
        await db.commit()
        await db.refresh(rec)
        return rec

    async def _find_disease(self, db: AsyncSession, name: str) -> Disease:
        stmt = select(Disease).where(Disease.name.ilike(f"%{name}%")).limit(1)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def _find_pest(self, db: AsyncSession, name: str) -> Pest:
        stmt = select(Pest).where(Pest.name.ilike(f"%{name}%")).limit(1)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def _get_medicines_for_disease(self, db: AsyncSession, disease_id: int) -> List[Medicine]:
        stmt = select(Medicine).join(MedicineDisease).where(
            MedicineDisease.disease_id == disease_id,
            Medicine.status == RecommendationStatus.ACTIVE
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def _get_medicines_for_pest(self, db: AsyncSession, pest_id: int) -> List[Medicine]:
        stmt = select(Medicine).join(MedicinePest).where(
            MedicinePest.pest_id == pest_id,
            Medicine.status == RecommendationStatus.ACTIVE
        )
        result = await db.execute(stmt)
        return result.scalars().all()

recommendation_service = RecommendationService()
