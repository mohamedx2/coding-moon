import os
from google import genai
import sys

def test_v1_force():
    key = os.getenv('GEMINI_API_KEY')
    print(f"DEBUG: Using API Key: {key[:10]}...")
    if not key:
        print("ERROR: GEMINI_API_KEY not found in env")
        return

    configs = [
        {"version": "v1", "model": "gemini-1.5-flash"},
        {"version": "v1", "model": "gemini-pro"},
        {"version": "v1beta", "model": "gemini-2.0-flash"},
        {"version": "v1beta", "model": "gemini-1.5-flash"},
    ]

    for cfg in configs:
        ver = cfg["version"]
        model_id = cfg["model"]
        print(f"Testing {ver} / {model_id}...")
        try:
            # Some SDK versions allow specifying version in Client or http_options
            # If not direct, we'll try raw HTTP for v1
            client = genai.Client(api_key=key, http_options={'api_version': ver})
            response = client.models.generate_content(
                model=model_id,
                contents="Hello"
            )
            print(f"SUCCESS ({ver} {model_id}): {response.text}")
            return
        except Exception as e:
            print(f"FAIL ({ver} {model_id}): {e}")

if __name__ == "__main__":
    test_v1_force()
