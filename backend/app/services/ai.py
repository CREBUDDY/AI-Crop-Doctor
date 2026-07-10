import json
import asyncio
from fastapi import HTTPException
from google import genai
from google.genai import types
from app.core.config import settings

class AIService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # gemini-2.5-flash: high availability, multimodal support
        self.model_name = 'gemini-2.5-flash'

    def _normalize_result(self, result: dict) -> dict:
        """
        Make image validation forgiving so real plant photos are not rejected
        just because the model over-reported overlapping leaves or uncertainty.
        """
        img_q = result.setdefault("image_quality", {})
        img_q.setdefault("is_acceptable", True)
        img_q.setdefault("is_blurry", False)
        img_q.setdefault("is_too_dark", False)
        img_q.setdefault("has_multiple_leaves", False)
        img_q.setdefault("is_non_crop", False)
        img_q.setdefault("is_wrong_crop", False)
        img_q.setdefault("rejection_reason", "")

        crop_identified = str(result.get("crop_identified") or "").strip().lower()
        crop_confidence = float(result.get("crop_confidence") or 0)
        overall_confidence = float(result.get("overall_confidence") or 0)
        diseases = result.get("detected_diseases") or []
        pests = result.get("detected_pests") or []
        rejection_reason = str(
            img_q.get("rejection_reason") or result.get("rejection_reason") or ""
        ).lower()

        has_crop_signal = (
            crop_identified not in {"", "unknown", "none", "n/a"}
            or crop_confidence >= 0.2
            or overall_confidence >= 0.2
            or len(diseases) > 0
            or len(pests) > 0
        )

        clearly_unusable = (
            img_q.get("is_too_dark", False)
            or (img_q.get("is_blurry", False) and not has_crop_signal)
            or (
                img_q.get("is_non_crop", False)
                and not has_crop_signal
                and "plant" in rejection_reason
            )
        )

        mentions_multiple_leaves = any(
            phrase in rejection_reason
            for phrase in ["multiple leaves", "overlapping leaves", "too many leaves"]
        )

        # Accept whenever the model detected any reasonable plant signal or the
        # only complaint is about multiple/overlapping leaves.
        if has_crop_signal or mentions_multiple_leaves:
            img_q["is_acceptable"] = True
            img_q["is_non_crop"] = False
            img_q["is_wrong_crop"] = False
            if mentions_multiple_leaves and not clearly_unusable:
                img_q["rejection_reason"] = ""
                result["rejection_reason"] = ""
            result["is_valid_crop"] = True
        elif clearly_unusable:
            img_q["is_acceptable"] = False
            result["is_valid_crop"] = False
        else:
            # Default to accept when the model is uncertain rather than block
            # the user with false negatives.
            img_q["is_acceptable"] = True
            img_q["is_non_crop"] = False
            result["is_valid_crop"] = True
            img_q["rejection_reason"] = ""
            result["rejection_reason"] = ""

        return result

    async def analyze_crop_image(self, image_path: str) -> dict:
        """
        Analyzes a crop image using Gemini and returns structured JSON output.
        Uses the new google-genai SDK.
        """
        try:
            # Read image as bytes and convert to Part
            with open(image_path, 'rb') as f:
                image_bytes = f.read()

            # Determine MIME type from extension
            ext = image_path.rsplit('.', 1)[-1].lower()
            mime_map = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}
            mime_type = mime_map.get(ext, 'image/jpeg')

            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            
            prompt = """You are an expert agricultural AI. Analyze this crop/plant image.

IMAGE VALIDATION (be EXTREMELY LENIENT):
Only set is_acceptable=false if the image is CLEARLY unusable (e.g. a face, a car, a completely black image). 
- is_non_crop=true ONLY if the image contains absolutely NO plant, leaf, or vegetation. Even a distant view of a field, a blurry leaf, or multiple leaves MUST be considered a valid crop (is_non_crop=false).
- is_blurry=true ONLY if the image is a completely unrecognizable blur.
- is_too_dark=true ONLY if the image is completely black.
- has_multiple_leaves=true is informational only, NEVER a reason to reject.

DEFAULT RULE: If there is ANY hint of a plant, leaf, crop, or vegetation, you MUST set is_acceptable=true, is_valid_crop=true, and is_non_crop=false. When in doubt, ACCEPT the image.

CRITICAL RULE: You are strictly a VISION DETECTION MODEL. You MUST NEVER recommend medicines, dosages, recovery times, or treatments. Your ONLY job is to detect the crop, the disease/pest, severity, and output confidence scores. All recommendations will be provided by an external PostgreSQL database.

Return ONLY a valid JSON object matching this exact schema (no markdown, no extra text):
{
    "image_quality": {
        "is_acceptable": boolean,
        "is_blurry": boolean,
        "is_too_dark": boolean,
        "has_multiple_leaves": boolean,
        "is_non_crop": boolean,
        "is_wrong_crop": boolean,
        "rejection_reason": "string (Empty if acceptable, otherwise explain why it was rejected)"
    },
    "is_valid_crop": boolean (Must be false if image_quality.is_acceptable is false),
    "rejection_reason": "string (Legacy field, duplicate of image_quality.rejection_reason)",
    "crop_identified": "string (e.g. Rice, Tomato, Wheat, or Unknown if unsure)",
    "crop_confidence": float (0-1),
    "detected_diseases": [
        {
            "name": "string (e.g. Rice Blast)",
            "confidence": float (0-1),
            "severity": "none|low|medium|high|critical",
            "notes": "string"
        }
    ],
    "detected_pests": [
        {
            "name": "string (e.g. Brown Plant Hopper)",
            "confidence": float (0-1),
            "severity": "none|low|medium|high|critical",
            "notes": "string"
        }
    ],
    "leaf_condition_score": integer (0-100),
    "color_analysis_score": integer (0-100),
    "water_status": "dry|normal|excess|waterlogged",
    "overall_confidence": float (0-1)
}"""

            # Retry mechanism for Gemini API transient errors (e.g. 503 UNAVAILABLE under load)
            max_retries = 3
            backoff_factor = 1.5
            response = None
            last_err = None

            for attempt in range(max_retries):
                try:
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=[prompt, image_part]
                    )
                    break
                except Exception as e:
                    last_err = e
                    err_msg = str(e).lower()
                    if "503" in err_msg or "resource_exhausted" in err_msg or "unavailable" in err_msg:
                        sleep_time = backoff_factor ** attempt
                        print(f"Gemini API transient error (attempt {attempt + 1}/{max_retries}): {e}. Retrying in {sleep_time:.1f}s...")
                        await asyncio.sleep(sleep_time)
                    else:
                        raise e

            if response is None:
                raise last_err

            text_response = response.text.strip()
            
            # Strip markdown code fences if present
            if text_response.startswith("```json"):
                text_response = text_response[7:]
                if text_response.endswith("```"):
                    text_response = text_response[:-3]
            elif text_response.startswith("```"):
                text_response = text_response[3:]
                if text_response.endswith("```"):
                    text_response = text_response[:-3]
                    
            result = json.loads(text_response.strip())
            return self._normalize_result(result)
            
        except Exception as e:
            print(f"AI Service Error: {str(e)}")
            err_msg = str(e).lower()

            if "resource_exhausted" in err_msg or "quota" in err_msg or "429" in err_msg:
                raise HTTPException(
                    status_code=429,
                    detail="Gemini API quota limit reached for this key. This can happen on the free tier after repeated image analyses. Please wait and try again later, or use a higher-limit API key."
                )

            # Raise proper HTTPException so FastAPI handles it as a server/gateway issue
            raise HTTPException(
                status_code=503,
                detail=f"AI Service is currently overloaded or experiencing issues. Please try again. ({str(e)})"
            )

ai_service = AIService()
