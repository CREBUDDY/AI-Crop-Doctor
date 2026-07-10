import asyncio
import os
import sys

from app.services.ai import ai_service
from PIL import Image

async def test():
    # Create a dummy image
    image = Image.new('RGB', (100, 100), color = 'green')
    image_path = "test_image.jpg"
    image.save(image_path)
    
    try:
        print("Sending request to Gemini...")
        result = await ai_service.analyze_crop_image(image_path)
        print("Result:", result)
    except Exception as e:
        print("Exception:", e)
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

if __name__ == "__main__":
    asyncio.run(test())
