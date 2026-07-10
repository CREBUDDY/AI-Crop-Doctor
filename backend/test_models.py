import asyncio
import os
from google import genai
from app.core.config import settings

async def test_model(model_name):
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    print(f"Testing model: {model_name}...")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Hello! Tell me in one word if you are working."
        )
        print(f"[{model_name}] Response: {response.text.strip()}")
        return True
    except Exception as e:
        print(f"[{model_name}] Error: {e}")
        return False

async def main():
    models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
    for model in models:
        await test_model(model)

if __name__ == "__main__":
    asyncio.run(main())
