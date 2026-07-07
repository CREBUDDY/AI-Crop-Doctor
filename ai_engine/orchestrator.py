from sqlalchemy.ext.asyncio import AsyncSession
from ai_engine.vision.gemini_vision import GeminiVisionAnalyzer
from ai_engine.scoring.health_score import calculate_health_score
from ai_engine.recommendations.engine import RecommendationEngine
from ai_engine.schemas import AIPipelineOutput
import logging

logger = logging.getLogger(__name__)

class AIOrchestrator:
    def __init__(self, gemini_api_key: str):
        """
        Initializes the AI pipeline. The DB session is intentionally NOT passed here, 
        to ensure the AI module can be instantiated independently of a request lifecycle.
        """
        self.vision_analyzer = GeminiVisionAnalyzer(api_key=gemini_api_key)

    async def run_pipeline(self, image_path: str, db_session: AsyncSession) -> str:
        """
        Executes the full AI pipeline:
        1. Vision Analysis (Gemini)
        2. Health Scoring
        3. Recommendation Generation
        Returns the final result as a structured JSON string.
        """
        try:
            logger.info("Starting Vision Analysis...")
            # Step 1: Vision Inference
            vision_result: AIPipelineOutput = self.vision_analyzer.analyze_image(image_path)
            
            logger.info("Calculating Health Score...")
            # Step 2: Scoring
            health_score = calculate_health_score(vision_result)
            vision_result.health_score = health_score
            
            logger.info("Fetching Recommendations...")
            # Step 3: Recommendations (Inject DB session here for data access)
            rec_engine = RecommendationEngine(db=db_session)
            recommendations = await rec_engine.get_recommendations(vision_result)
            vision_result.recommendations = recommendations
            
            logger.info("AI Pipeline Complete.")
            
            # Return as JSON string
            return vision_result.model_dump_json(indent=4)
            
        except Exception as e:
            logger.error(f"AI Pipeline Failed: {str(e)}")
            raise e
