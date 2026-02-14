import os
from google import genai
import sys

def test_final():
    # Attempting to use the key retrieved from .env
    key = "AIzaSyA6r-HgX5wdeW_28EUoAVuE4knSs9reJmI" 
    print(f"DEBUG: Testing Key (Length: {len(key)})")
    
    try:
        client = genai.Client(api_key=key)
        
        models = [
            "gemini-2.0-flash", 
            "gemini-1.5-flash", 
            "gemini-1.5-flash-8b",
            "gemini-pro"
        ]
        
        for m in models:
            print(f"Testing {m}...")
            try:
                response = client.models.generate_content(
                    model=m,
                    contents="Explain gravity in one sentence."
                )
                print(f"✅ SUCCESS ({m}): {response.text}")
                return
            except Exception as e:
                print(f"FAIL ({m}): {e}")
                
    except Exception as e:
        print(f"GLOBAL ERROR: {e}")

if __name__ == "__main__":
    test_final()
