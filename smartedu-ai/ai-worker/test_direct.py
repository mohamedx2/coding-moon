import os
from google import genai
import sys

def test_direct():
    key = "AIzaSyA6r-HgX5wdeW_28EUoAVuE4knNnSs9reJmI" # Hardcoded for test
    print(f"DEBUG: Using Hardcoded Key...")
    
    try:
        client = genai.Client(api_key=key)
        
        models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]
        for m in models:
            print(f"Testing {m}...")
            try:
                response = client.models.generate_content(
                    model=m,
                    contents="Explain how AI works in a few words"
                )
                print(f"✅ SUCCESS ({m}): {response.text}")
                return
            except Exception as e:
                print(f"FAIL ({m}): {e}")
                
    except Exception as e:
        print(f"GLOBAL ERROR: {e}")

if __name__ == "__main__":
    test_direct()
