import os
from google import genai
import sys

def discover():
    key = os.getenv('GEMINI_API_KEY')
    print(f"DEBUG: Using API Key: {key[:10]}...")
    if not key:
        print("ERROR: GEMINI_API_KEY not found in env")
        return

    try:
        client = genai.Client(api_key=key)
        print("Listing all accessible models...")
        for m in client.models.list():
            print(f"Name: {m.name}, Display: {m.display_name}, Methods: {m.supported_generation_methods}")
    except Exception as e:
        print(f"FAIL to list models: {e}")

if __name__ == "__main__":
    discover()
