import json
from google import genai
from google.genai import types
from PIL import Image
import io
from app.core.config import settings
from app.infrastructure.database.models.enums import SeverityLevel, WaterStatus

class AIService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # gemini-2.5-flash-lite: higher free-tier quota, multimodal support
        self.model_name = 'gemini-2.5-flash-lite'

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
            
            prompt = """You are an expert agricultural AI. Analyze this crop image.
CRITICAL VALIDATION: First, verify that this is a genuine, physical photograph of a crop or plant taken by a user.
If the image is a screenshot, a photo of a computer monitor, an internet stock photo, a random object, an animal, a human face, or NOT a plant, you MUST set "is_valid_crop" to false and provide a detailed "rejection_reason".

Return ONLY a valid JSON object matching this exact schema (no markdown, no extra text):
{
    "is_valid_crop": boolean,
    "rejection_reason": "string (Empty if valid, otherwise explain why it was rejected)",
    "crop_identified": "string (e.g. Tomato)",
    "crop_confidence": float (0-1),
    "detected_diseases": [
        {
            "name": "string (e.g. Early Blight)",
            "confidence": float (0-1),
            "severity": "none|low|medium|high|critical",
            "notes": "string"
        }
    ],
    "detected_pests": [],
    "leaf_condition_score": integer (0-100),
    "color_analysis_score": integer (0-100),
    "water_status": "dry|normal|excess|waterlogged",
    "overall_confidence": float (0-1)
}"""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt, image_part]
            )

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
            return result
            
        except Exception as e:
            print(f"AI Service Error: {str(e)}")
            return {
                "is_valid_crop": False,
                "rejection_reason": "Internal AI Processing Error",
                "crop_identified": "Unknown",
                "crop_confidence": 0.0,
                "detected_diseases": [],
                "detected_pests": [],
                "leaf_condition_score": 50,
                "color_analysis_score": 50,
                "water_status": "normal",
                "overall_confidence": 0.0,
                "error": str(e)
            }

ai_service = AIService()
