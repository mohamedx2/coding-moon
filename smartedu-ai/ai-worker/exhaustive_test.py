import os
from google import genai
import sys

def test_exhaustive():
    key = os.getenv('GEMINI_API_KEY')
    if not key:
        print("ERROR: No key")
        return

    client = genai.Client(api_key=key)
    
    # Try every possible model ID that might exist
    test_models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro"
    ]

    for m in test_models:
        print(f"Testing {m}...")
        try:
            response = client.models.generate_content(
                model=m,
                contents="Hello"
            )
            print(f"✅ SUCCESS ({m}): {response.text[:100]}...")
            return
        except Exception as e:
            print(f"FAIL ({m}): {e}")

if __name__ == "__main__":
    test_exhaustive()
