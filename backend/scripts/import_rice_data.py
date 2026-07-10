import sys
import os
import json
import asyncio
import logging
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field, ValidationError

# Adjust sys.path so we can import from backend app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ingestion_pipeline")

# ============================================================================
# PYDANTIC MODELS FOR VALIDATION
# ============================================================================

class SourceMixin(BaseModel):
    source_organization: str
    document_name: str
    page_number: Optional[str] = None
    section_name: Optional[str] = None

class CropModel(SourceMixin):
    name: str
    scientific_name: Optional[str] = None
    growing_season: Optional[str] = None
    climate: Optional[str] = None
    soil_type: Optional[str] = None
    ideal_temperature: Optional[str] = None
    ideal_humidity: Optional[str] = None
    rainfall_requirement: Optional[str] = None
    growth_stages: Optional[List[str]] = None

class DiseaseModel(SourceMixin):
    crop_name: str
    name: str
    scientific_name: Optional[str] = None
    disease_type: Optional[str] = None
    symptoms: Optional[str] = None
    early_symptoms: Optional[str] = None
    advanced_symptoms: Optional[str] = None
    cause: Optional[str] = None
    favourable_weather: Optional[str] = None
    crop_stage: Optional[str] = None
    severity: Optional[str] = None
    preventive_measures: Optional[str] = None
    organic_control: Optional[str] = None
    biological_control: Optional[str] = None
    chemical_control: Optional[str] = None
    recovery_time: Optional[str] = None
    yield_loss: Optional[str] = None
    notes: Optional[str] = None

class PestModel(SourceMixin):
    crop_name: str
    name: str
    scientific_name: Optional[str] = None
    damage_symptoms: Optional[str] = None
    identification: Optional[str] = None
    favourable_weather: Optional[str] = None
    preventive_measures: Optional[str] = None
    biological_control: Optional[str] = None
    chemical_control: Optional[str] = None
    recovery_estimate: Optional[str] = None

class MedicineModel(BaseModel):
    normalized_name: str
    active_ingredient: Optional[str] = None
    formulation: Optional[str] = None
    category: Optional[str] = None

class TreatmentPlanModel(SourceMixin):
    disease_name: Optional[str] = None
    pest_name: Optional[str] = None
    crop_name: str
    medicine_name: str
    dosage_per_acre: Optional[str] = None
    water_per_acre: Optional[str] = None
    spray_interval: Optional[str] = None
    maximum_sprays: Optional[str] = None
    waiting_period: Optional[str] = None
    crop_stage: Optional[str] = None
    precautions: Optional[str] = None

class FertilizerModel(SourceMixin):
    crop_name: str
    nitrogen: Optional[str] = None
    phosphorus: Optional[str] = None
    potassium: Optional[str] = None
    micronutrients: Optional[str] = None
    split_application: Optional[str] = None
    timing: Optional[str] = None

class IrrigationModel(SourceMixin):
    crop_name: str
    water_requirement: Optional[str] = None
    irrigation_schedule: Optional[str] = None
    drainage_recommendation: Optional[str] = None
    flood_management: Optional[str] = None
    drought_management: Optional[str] = None

class HarvestModel(SourceMixin):
    crop_name: str
    harvest_stage: Optional[str] = None
    harvest_time: Optional[str] = None
    moisture_percentage: Optional[str] = None
    storage_recommendation: Optional[str] = None

# ============================================================================
# NORMALIZATION & UTILS
# ============================================================================

def normalize_string(s: Optional[str]) -> Optional[str]:
    if s is None:
        return None
    return s.strip()

def normalize_medicine_name(name: str) -> str:
    return name.strip().lower()

async def get_or_create_source(conn, source_data: dict) -> int:
    query = text('''
        INSERT INTO knowledge_sources (source_organization, document_name, page_number, section_name)
        VALUES (:org, :doc, :page, :sec)
        ON CONFLICT (source_organization, document_name, page_number, section_name)
        DO UPDATE SET source_organization = EXCLUDED.source_organization
        RETURNING id
    ''')
    result = await conn.execute(query, {
        "org": source_data.get("source_organization"),
        "doc": source_data.get("document_name"),
        "page": source_data.get("page_number") or 'N/A',
        "sec": source_data.get("section_name") or 'General'
    })
    return result.scalar()

async def get_crop_id(conn, name: str) -> int:
    query = text("SELECT id FROM crops WHERE name = :name")
    res = await conn.execute(query, {"name": normalize_string(name)})
    return res.scalar()

async def get_disease_id(conn, crop_id: int, name: str) -> int:
    query = text("SELECT id FROM crop_diseases WHERE crop_id = :cid AND name = :name")
    res = await conn.execute(query, {"cid": crop_id, "name": normalize_string(name).title()})
    return res.scalar()

async def get_pest_id(conn, crop_id: int, name: str) -> int:
    query = text("SELECT id FROM crop_pests WHERE crop_id = :cid AND name = :name")
    res = await conn.execute(query, {"cid": crop_id, "name": normalize_string(name).title()})
    return res.scalar()

async def get_medicine_id(conn, name: str) -> int:
    query = text("SELECT id FROM medicines WHERE normalized_name = :name")
    res = await conn.execute(query, {"name": normalize_medicine_name(name)})
    return res.scalar()

# ============================================================================
# INGESTION WORKERS
# ============================================================================

async def import_crops(conn, items: List[Dict]):
    logger.info(f"Importing {len(items)} crops...")
    success = 0
    for item in items:
        try:
            val = CropModel(**item)
            source_id = await get_or_create_source(conn, val.model_dump())
            
            query = text('''
                INSERT INTO crops (name, scientific_name, growing_season, climate, soil_type, 
                                   ideal_temperature, ideal_humidity, rainfall_requirement, growth_stages, source_id)
                VALUES (:name, :sci, :season, :climate, :soil, :temp, :hum, :rain, :stages, :src)
                ON CONFLICT (name) DO UPDATE SET
                    scientific_name = EXCLUDED.scientific_name,
                    growing_season = EXCLUDED.growing_season,
                    climate = EXCLUDED.climate,
                    soil_type = EXCLUDED.soil_type,
                    ideal_temperature = EXCLUDED.ideal_temperature,
                    ideal_humidity = EXCLUDED.ideal_humidity,
                    rainfall_requirement = EXCLUDED.rainfall_requirement,
                    growth_stages = EXCLUDED.growth_stages,
                    source_id = EXCLUDED.source_id
            ''')
            await conn.execute(query, {
                "name": normalize_string(val.name), "sci": val.scientific_name, "season": val.growing_season,
                "climate": val.climate, "soil": val.soil_type, "temp": val.ideal_temperature,
                "hum": val.ideal_humidity, "rain": val.rainfall_requirement, 
                "stages": val.growth_stages, "src": source_id
            })
            success += 1
        except ValidationError as e:
            logger.error(f"Validation Error in Crops: {e}")
        except Exception as e:
            logger.error(f"Error importing crop {item.get('name')}: {e}")
    logger.info(f"Successfully imported {success}/{len(items)} crops.")

async def import_diseases(conn, items: List[Dict]):
    logger.info(f"Importing {len(items)} diseases...")
    success = 0
    for item in items:
        try:
            val = DiseaseModel(**item)
            crop_id = await get_crop_id(conn, val.crop_name)
            if not crop_id:
                logger.warning(f"Crop '{val.crop_name}' not found for disease '{val.name}'. Skipping.")
                continue

            source_id = await get_or_create_source(conn, val.model_dump())
            query = text('''
                INSERT INTO crop_diseases (crop_id, name, scientific_name, disease_type, symptoms, 
                                           early_symptoms, advanced_symptoms, cause, favourable_weather, 
                                           crop_stage, severity, preventive_measures, organic_control, 
                                           biological_control, chemical_control, recovery_time, yield_loss, notes, source_id)
                VALUES (:cid, :name, :sci, :type, :sym, :esym, :asym, :cause, :fav, :stage, :sev, :prev, :org, :bio, :chem, :rec, :yld, :note, :src)
                ON CONFLICT (crop_id, name) DO UPDATE SET
                    scientific_name = EXCLUDED.scientific_name, disease_type = EXCLUDED.disease_type, symptoms = EXCLUDED.symptoms,
                    early_symptoms = EXCLUDED.early_symptoms, advanced_symptoms = EXCLUDED.advanced_symptoms, cause = EXCLUDED.cause,
                    favourable_weather = EXCLUDED.favourable_weather, crop_stage = EXCLUDED.crop_stage, severity = EXCLUDED.severity,
                    preventive_measures = EXCLUDED.preventive_measures, organic_control = EXCLUDED.organic_control, 
                    biological_control = EXCLUDED.biological_control, chemical_control = EXCLUDED.chemical_control, 
                    recovery_time = EXCLUDED.recovery_time, yield_loss = EXCLUDED.yield_loss, notes = EXCLUDED.notes, source_id = EXCLUDED.source_id
            ''')
            await conn.execute(query, {
                "cid": crop_id, "name": normalize_string(val.name).title(), "sci": val.scientific_name, "type": val.disease_type,
                "sym": val.symptoms, "esym": val.early_symptoms, "asym": val.advanced_symptoms, "cause": val.cause,
                "fav": val.favourable_weather, "stage": val.crop_stage, "sev": val.severity, "prev": val.preventive_measures,
                "org": val.organic_control, "bio": val.biological_control, "chem": val.chemical_control,
                "rec": val.recovery_time, "yld": val.yield_loss, "note": val.notes, "src": source_id
            })
            success += 1
        except ValidationError as e:
            logger.error(f"Validation Error in Diseases: {e}")
        except Exception as e:
            logger.error(f"Error importing disease {item.get('name')}: {e}")
    logger.info(f"Successfully imported {success}/{len(items)} diseases.")

async def import_pests(conn, items: List[Dict]):
    logger.info(f"Importing {len(items)} pests...")
    success = 0
    for item in items:
        try:
            val = PestModel(**item)
            crop_id = await get_crop_id(conn, val.crop_name)
            if not crop_id:
                logger.warning(f"Crop '{val.crop_name}' not found for pest '{val.name}'. Skipping.")
                continue

            source_id = await get_or_create_source(conn, val.model_dump())
            query = text('''
                INSERT INTO crop_pests (crop_id, name, scientific_name, damage_symptoms, identification, 
                                        favourable_weather, preventive_measures, biological_control, chemical_control, recovery_estimate, source_id)
                VALUES (:cid, :name, :sci, :dam, :iden, :fav, :prev, :bio, :chem, :rec, :src)
                ON CONFLICT (crop_id, name) DO UPDATE SET
                    scientific_name = EXCLUDED.scientific_name, damage_symptoms = EXCLUDED.damage_symptoms, identification = EXCLUDED.identification,
                    favourable_weather = EXCLUDED.favourable_weather, preventive_measures = EXCLUDED.preventive_measures, 
                    biological_control = EXCLUDED.biological_control, chemical_control = EXCLUDED.chemical_control, 
                    recovery_estimate = EXCLUDED.recovery_estimate, source_id = EXCLUDED.source_id
            ''')
            await conn.execute(query, {
                "cid": crop_id, "name": normalize_string(val.name).title(), "sci": val.scientific_name, "dam": val.damage_symptoms,
                "iden": val.identification, "fav": val.favourable_weather, "prev": val.preventive_measures,
                "bio": val.biological_control, "chem": val.chemical_control, "rec": val.recovery_estimate, "src": source_id
            })
            success += 1
        except ValidationError as e:
            logger.error(f"Validation Error in Pests: {e}")
        except Exception as e:
            logger.error(f"Error importing pest {item.get('name')}: {e}")
    logger.info(f"Successfully imported {success}/{len(items)} pests.")

async def import_medicines(conn, items: List[Dict]):
    logger.info(f"Importing {len(items)} medicines...")
    success = 0
    for item in items:
        try:
            val = MedicineModel(**item)
            norm_name = normalize_medicine_name(val.normalized_name)
            query = text('''
                INSERT INTO medicines (normalized_name, active_ingredient, formulation, category)
                VALUES (:name, :act, :form, :cat)
                ON CONFLICT (normalized_name) DO UPDATE SET
                    active_ingredient = EXCLUDED.active_ingredient,
                    formulation = EXCLUDED.formulation,
                    category = EXCLUDED.category
            ''')
            await conn.execute(query, {
                "name": norm_name, "act": val.active_ingredient, "form": val.formulation, "cat": val.category
            })
            
            # If treatments are included, parse them out
            if "treatments" in item and isinstance(item["treatments"], list):
                for t in item["treatments"]:
                    t["medicine_name"] = norm_name
                    await import_treatment(conn, t)
                    
            success += 1
        except ValidationError as e:
            logger.error(f"Validation Error in Medicines: {e}")
        except Exception as e:
            logger.error(f"Error importing medicine {item.get('normalized_name')}: {e}")
    logger.info(f"Successfully imported {success}/{len(items)} medicines.")

async def import_treatment(conn, item: Dict):
    try:
        val = TreatmentPlanModel(**item)
        crop_id = await get_crop_id(conn, val.crop_name)
        if not crop_id: return
        
        disease_id = await get_disease_id(conn, crop_id, val.disease_name) if val.disease_name else None
        pest_id = await get_pest_id(conn, crop_id, val.pest_name) if val.pest_name else None
        med_id = await get_medicine_id(conn, val.medicine_name)
        
        if not med_id:
            logger.warning(f"Medicine '{val.medicine_name}' not found for treatment. Skipping.")
            return
            
        source_id = await get_or_create_source(conn, val.model_dump())
        query = text('''
            INSERT INTO treatment_plans (disease_id, pest_id, medicine_id, dosage_per_acre, water_per_acre, 
                                         spray_interval, maximum_sprays, waiting_period, crop_stage, precautions, source_id)
            VALUES (:did, :pid, :mid, :dos, :wat, :spr, :maxs, :wait, :cstg, :prec, :src)
        ''')
        await conn.execute(query, {
            "did": disease_id, "pid": pest_id, "mid": med_id, "dos": val.dosage_per_acre,
            "wat": val.water_per_acre, "spr": val.spray_interval, "maxs": val.maximum_sprays,
            "wait": val.waiting_period, "cstg": val.crop_stage, "prec": val.precautions, "src": source_id
        })
    except ValidationError as e:
        logger.error(f"Validation Error in Treatment Plan: {e}")
    except Exception as e:
        logger.error(f"Error importing treatment: {e}")

async def import_fertilizers(conn, items: List[Dict]):
    logger.info(f"Importing {len(items)} fertilizers...")
    success = 0
    for item in items:
        try:
            val = FertilizerModel(**item)
            crop_id = await get_crop_id(conn, val.crop_name)
            if not crop_id:
                logger.warning(f"Crop '{val.crop_name}' not found for fertilizer. Skipping.")
                continue

            source_id = await get_or_create_source(conn, val.model_dump())
            query = text('''
                INSERT INTO fertilizer_recommendations (crop_id, nitrogen, phosphorus, potassium, micronutrients, split_application, timing, source_id)
                VALUES (:cid, :n, :p, :k, :mic, :split, :tim, :src)
            ''')
            await conn.execute(query, {
                "cid": crop_id, "n": val.nitrogen, "p": val.phosphorus, "k": val.potassium, 
                "mic": val.micronutrients, "split": val.split_application, "tim": val.timing, "src": source_id
            })
            success += 1
        except ValidationError as e:
            logger.error(f"Validation Error in Fertilizers: {e}")
        except Exception as e:
            logger.error(f"Error importing fertilizer: {e}")
    logger.info(f"Successfully imported {success}/{len(items)} fertilizers.")

async def import_irrigation(conn, items: List[Dict]):
    logger.info(f"Importing {len(items)} irrigation guidelines...")
    success = 0
    for item in items:
        try:
            val = IrrigationModel(**item)
            crop_id = await get_crop_id(conn, val.crop_name)
            if not crop_id: continue

            source_id = await get_or_create_source(conn, val.model_dump())
            query = text('''
                INSERT INTO irrigation_guidelines (crop_id, water_requirement, irrigation_schedule, drainage_recommendation, flood_management, drought_management, source_id)
                VALUES (:cid, :wat, :sch, :drain, :fld, :drt, :src)
            ''')
            await conn.execute(query, {
                "cid": crop_id, "wat": val.water_requirement, "sch": val.irrigation_schedule, 
                "drain": val.drainage_recommendation, "fld": val.flood_management, "drt": val.drought_management, "src": source_id
            })
            success += 1
        except Exception as e:
            logger.error(f"Error importing irrigation: {e}")
    logger.info(f"Successfully imported {success}/{len(items)} irrigation guidelines.")

async def import_harvest(conn, items: List[Dict]):
    logger.info(f"Importing {len(items)} harvest guidelines...")
    success = 0
    for item in items:
        try:
            val = HarvestModel(**item)
            crop_id = await get_crop_id(conn, val.crop_name)
            if not crop_id: continue

            source_id = await get_or_create_source(conn, val.model_dump())
            query = text('''
                INSERT INTO harvest_guidelines (crop_id, harvest_stage, harvest_time, moisture_percentage, storage_recommendation, source_id)
                VALUES (:cid, :stage, :time, :mois, :stor, :src)
            ''')
            await conn.execute(query, {
                "cid": crop_id, "stage": val.harvest_stage, "time": val.harvest_time, 
                "mois": val.moisture_percentage, "stor": val.storage_recommendation, "src": source_id
            })
            success += 1
        except Exception as e:
            logger.error(f"Error importing harvest: {e}")
    logger.info(f"Successfully imported {success}/{len(items)} harvest guidelines.")


# ============================================================================
# MAIN ORCHESTRATION
# ============================================================================

async def main():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "knowledge"))
    
    if not os.path.exists(knowledge_dir):
        logger.error(f"Knowledge directory not found at: {knowledge_dir}")
        logger.info("Please create the directory and place your JSON files there.")
        return

    # Files to process in order (to satisfy Foreign Key constraints)
    pipeline_stages = [
        ("rice.json", import_crops),
        ("rice_diseases.json", import_diseases),
        ("rice_pests.json", import_pests),
        ("rice_medicines.json", import_medicines),
        ("rice_fertilizers.json", import_fertilizers),
        ("rice_irrigation.json", import_irrigation),
        ("rice_harvest.json", import_harvest)
    ]

    async with engine.begin() as conn:
        # Treatment plans shouldn't be blindly inserted if we run the script multiple times.
        # We can optionally clear existing non-unique relationships, or just append for now.
        
        for filename, handler in pipeline_stages:
            filepath = os.path.join(knowledge_dir, filename)
            if os.path.exists(filepath):
                logger.info(f"Processing {filename}...")
                with open(filepath, "r", encoding="utf-8") as f:
                    try:
                        data = json.load(f)
                        if isinstance(data, dict) and "data" in data:
                            items = data["data"]
                        elif isinstance(data, list):
                            items = data
                        else:
                            items = [data]
                            
                        await handler(conn, items)
                    except json.JSONDecodeError:
                        logger.error(f"Invalid JSON format in {filename}")
            else:
                logger.warning(f"File {filename} not found. Skipping.")

    await engine.dispose()
    logger.info("Data ingestion pipeline completed successfully.")
    
if __name__ == "__main__":
    asyncio.run(main())
