import google.generativeai as genai
import json
from PIL import Image
from app.core.config import settings
from app.infrastructure.database.models.enums import SeverityLevel, WaterStatus

class AIService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Using Gemini 1.5 Pro for vision tasks
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest')

    async def analyze_crop_image(self, image_path: str) -> dict:
        """
        Analyzes a crop image using Gemini and returns structured JSON output.
        """
        try:
            img = Image.open(image_path)
            
            prompt = """
            You are an expert agricultural AI. Analyze this crop image.
            CRITICAL VALIDATION: First, verify that this is a genuine, physical photograph of a crop or plant taken by a user.
            If the image is a screenshot, a photo of a computer monitor, an internet stock photo, a random object, an animal, a human face, or NOT a plant, you MUST set "is_valid_crop" to false and provide a detailed "rejection_reason".

            Return ONLY a valid JSON object matching this exact schema:
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
                "leaf_condition_score": int (0-100),
                "color_analysis_score": int (0-100),
                "water_status": "dry|normal|excess|waterlogged",
                "overall_confidence": float (0-1)
            }
            Do not include any markdown tags or extra text.
            """
            
            response = self.model.generate_content([prompt, img])
            text_response = response.text
            
            # Clean up potential markdown formatting from Gemini response
            if text_response.startswith("```json"):
                text_response = text_response[7:-3]
            elif text_response.startswith("```"):
                text_response = text_response[3:-3]
                
            result = json.loads(text_response.strip())
            return result
            
        except Exception as e:
            # Fallback mock response if API fails or parsing fails
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
