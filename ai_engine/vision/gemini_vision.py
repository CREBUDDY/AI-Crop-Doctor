import google.generativeai as genai
from PIL import Image
import json
from ai_engine.schemas import AIPipelineOutput

class GeminiVisionAnalyzer:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro-latest')

    def analyze_image(self, image_path: str) -> AIPipelineOutput:
        """
        Runs Gemini 1.5 Pro to extract classification, detection, and segmentation data.
        """
        img = Image.open(image_path)
        
        prompt = """
        You are an expert agricultural AI agronomist.
        Analyze the provided crop image for:
        1. Crop species identification.
        2. Any diseases present, their severity, and affected area percentage.
        3. Any pests present, their severity, and affected area percentage.
        4. Provide bounding boxes [ymin, xmin, ymax, xmax] (normalized 0.0 to 1.0) for where lesions or pests are visible.
        5. Leaf condition and color score (0-100).
        6. Water status (dry, normal, excess, waterlogged).

        Return ONLY a valid JSON object matching this exact schema:
        {
            "crop_identified": "string",
            "crop_confidence": float (0.0 to 1.0),
            "detected_diseases": [
                {
                    "name": "string",
                    "confidence": float (0.0 to 1.0),
                    "severity": "none|low|medium|high|critical",
                    "affected_area_percentage": float (0.0 to 100.0),
                    "bounding_boxes": [{"ymin": float, "xmin": float, "ymax": float, "xmax": float}],
                    "notes": "string"
                }
            ],
            "detected_pests": [
                 {
                    "name": "string",
                    "confidence": float (0.0 to 1.0),
                    "severity": "none|low|medium|high|critical",
                    "affected_area_percentage": float (0.0 to 100.0),
                    "bounding_boxes": [{"ymin": float, "xmin": float, "ymax": float, "xmax": float}],
                    "notes": "string"
                }
            ],
            "leaf_condition_score": int (0 to 100),
            "color_analysis_score": int (0 to 100),
            "water_status": "dry|normal|excess|waterlogged",
            "overall_confidence": float (0.0 to 1.0)
        }
        Do not include markdown blocks like ```json
        """
        
        response = self.model.generate_content([prompt, img])
        text_response = response.text
        
        # Clean up response
        if text_response.startswith("```json"):
            text_response = text_response[7:-3]
        elif text_response.startswith("```"):
            text_response = text_response[3:-3]
            
        data = json.loads(text_response.strip())
        
        # Validate and return Pydantic model
        return AIPipelineOutput(**data)
