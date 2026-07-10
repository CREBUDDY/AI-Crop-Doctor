import re
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models.agricultural import Crop, CropDisease, CropPest, TreatmentPlan
from app.domain.entities.analysis import RecommendationSchema, ExplanationSchema

class RecommendationService:
    
    @staticmethod
    def scale_dosage(base_val: str, area: float) -> str:
        if not base_val:
            return "N/A"
        match = re.match(r"([\d\.]+)\s*(.*)", str(base_val).strip())
        if match:
            num, unit = match.groups()
            try:
                scaled = float(num) * area
                return f"{scaled:g} {unit}"
            except ValueError:
                pass
        return f"{base_val} (per acre, scale to {area} acres manually)"

    async def get_curative_recommendations(
        self, db: AsyncSession, crop_name: str, issue_name: str, farm_area: float,
        confidence_score: float, irrigation_advice: str
    ) -> List[RecommendationSchema]:
        """
        Fetches curative treatments for a specific disease or pest on a specific crop.
        """
        recommendations = []
        
        # 1. Query Crop
        crop_stmt = select(Crop).where(Crop.name.ilike(f"%{crop_name}%"))
        crop_record = (await db.execute(crop_stmt)).scalars().first()
        
        if not crop_record:
            return recommendations
            
        # 2. Query Disease
        disease_stmt = select(CropDisease).options(selectinload(CropDisease.source)).where(
            CropDisease.crop_id == crop_record.id, CropDisease.name.ilike(f"%{issue_name}%")
        )
        db_disease = (await db.execute(disease_stmt)).scalars().first()
        
        # 3. Query Pest
        db_pest = None
        if not db_disease:
            pest_stmt = select(CropPest).options(selectinload(CropPest.source)).where(
                CropPest.crop_id == crop_record.id, CropPest.name.ilike(f"%{issue_name}%")
            )
            db_pest = (await db.execute(pest_stmt)).scalars().first()
        
        target_record = db_disease or db_pest
        
        if target_record:
            plan_stmt = select(TreatmentPlan).options(
                selectinload(TreatmentPlan.medicine), selectinload(TreatmentPlan.source)
            )
            if db_disease:
                plan_stmt = plan_stmt.where(TreatmentPlan.disease_id == db_disease.id)
            else:
                plan_stmt = plan_stmt.where(TreatmentPlan.pest_id == db_pest.id)
                
            plans = (await db.execute(plan_stmt)).scalars().all()
            
            if plans:
                primary_plan = plans[0]
                alt_meds = [p.medicine.normalized_name.title() for p in plans[1:]] if len(plans) > 1 else None
                doc_name = primary_plan.source.document_name if primary_plan.source else target_record.source.document_name if getattr(target_record, 'source', None) else "Verified Database"
                org_name = primary_plan.source.source_organization if primary_plan.source else target_record.source.source_organization if getattr(target_record, 'source', None) else "ICAR"
                
                explanation = ExplanationSchema(
                    why_this_medicine=f"Clinically verified treatment for {target_record.name} on {crop_name}.",
                    why_this_dosage=f"Calculated by scaling standard {org_name} protocol ({primary_plan.dosage_per_acre}/acre) to your active farm size of {farm_area} acres.",
                    why_this_spray_interval=f"Standard protocol to ensure maximum efficacy without causing chemical resistance in {target_record.name}.",
                    why_this_irrigation_advice=irrigation_advice,
                    confidence_score=confidence_score,
                    source_document=doc_name,
                    reference_organization=org_name
                )
                
                recommendations.append(RecommendationSchema(
                    disease=target_record.name,
                    medicine=primary_plan.medicine.normalized_name.title(),
                    alternative_medicine=", ".join(alt_meds) if alt_meds else None,
                    organic_treatment=getattr(target_record, 'organic_control', None),
                    dose=self.scale_dosage(primary_plan.dosage_per_acre, farm_area),
                    water=self.scale_dosage(primary_plan.water_per_acre, farm_area),
                    spray_interval=primary_plan.spray_interval,
                    recovery=getattr(target_record, 'recovery_time', getattr(target_record, 'recovery_estimate', None)),
                    precautions=primary_plan.precautions,
                    reference=doc_name,
                    page_number=primary_plan.source.page_number if primary_plan.source else target_record.source.page_number if getattr(target_record, 'source', None) else None,
                    explanation=explanation
                ))
                
        return recommendations

    async def get_preventive_recommendations(
        self, db: AsyncSession, crop_name: str, farm_area: float,
        confidence_score: float, irrigation_advice: str
    ) -> List[RecommendationSchema]:
        """
        Fetches preventive treatments from the database dynamically based on crop.
        """
        recommendations = []
        
        # 1. Query Crop
        crop_stmt = select(Crop).where(Crop.name.ilike(f"%{crop_name}%"))
        crop_record = (await db.execute(crop_stmt)).scalars().first()
        
        if not crop_record:
            return recommendations
            
        # 2. Fetch diseases for this crop that have preventive measures
        disease_stmt = select(CropDisease).options(selectinload(CropDisease.source)).where(
            CropDisease.crop_id == crop_record.id,
            CropDisease.preventive_measures.isnot(None)
        )
        diseases = (await db.execute(disease_stmt)).scalars().all()
        
        if diseases:
            # Pick a representative disease for preventive measures (e.g. Blast for Rice)
            # In a more advanced version, we could filter by current weather.
            target_disease = diseases[0]
            
            # Fetch a treatment plan for this disease to get a preventive medicine if possible
            plan_stmt = select(TreatmentPlan).options(
                selectinload(TreatmentPlan.medicine), selectinload(TreatmentPlan.source)
            ).where(TreatmentPlan.disease_id == target_disease.id)
            
            plans = (await db.execute(plan_stmt)).scalars().all()
            
            if plans:
                primary_plan = plans[0]
                alt_meds = [p.medicine.normalized_name.title() for p in plans[1:]] if len(plans) > 1 else None
                
                doc_name = primary_plan.source.document_name if primary_plan.source else target_disease.source.document_name if getattr(target_disease, 'source', None) else "Verified Database"
                org_name = primary_plan.source.source_organization if primary_plan.source else target_disease.source.source_organization if getattr(target_disease, 'source', None) else "ICAR"
                
                explanation = ExplanationSchema(
                    why_this_medicine=f"Preemptively selected to protect {crop_name} against high-risk conditions favoring {target_disease.name}.",
                    why_this_dosage=f"Calculated by scaling standard {org_name} preventive protocol ({primary_plan.dosage_per_acre}/acre) to your farm area.",
                    why_this_spray_interval=f"Preventive schedule based on expected duration of high-risk weather.",
                    why_this_irrigation_advice=irrigation_advice,
                    confidence_score=confidence_score,
                    source_document=doc_name,
                    reference_organization=org_name
                )
                
                recommendations.append(RecommendationSchema(
                    disease=f"High Risk (Preventing {target_disease.name})",
                    medicine=primary_plan.medicine.normalized_name.title(),
                    alternative_medicine=", ".join(alt_meds) if alt_meds else None,
                    organic_treatment=getattr(target_disease, 'organic_control', getattr(target_disease, 'preventive_measures', None)),
                    dose=self.scale_dosage(primary_plan.dosage_per_acre, farm_area),
                    water=self.scale_dosage(primary_plan.water_per_acre, farm_area),
                    spray_interval=primary_plan.spray_interval,
                    recovery="Preventive Application",
                    precautions=primary_plan.precautions,
                    reference=doc_name,
                    page_number=primary_plan.source.page_number if primary_plan.source else target_disease.source.page_number if getattr(target_disease, 'source', None) else None,
                    explanation=explanation
                ))
                
        return recommendations

recommendation_service = RecommendationService()
