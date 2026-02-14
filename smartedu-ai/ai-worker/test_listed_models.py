import os
from google import genai
import sys

def test_listed():
    key = "AIzaSyA6r-HgX5wdeW_28EUoAVuE4knSs9reJmI"
    if not key:
        print("ERROR: No key")
        return

    client = genai.Client(api_key=key)
    
    try:
        print("Listing models...")
        models = list(client.models.list())
        if not models:
            print("No models found in list.")
            return
            
        for m in models:
            print(f"Testing {m.name}...")
            if 'generateContent' not in m.supported_generation_methods:
                print(f"   Skipping {m.name} (no generateContent support)")
                continue
                
            try:
                # Use the exact name from the list (which includes 'models/')
                response = client.models.generate_content(
                    model=m.name,
                    contents="Hello"
                )
                print(f"✅ SUCCESS ({m.name}): {response.text[:100]}...")
                return
            except Exception as e:
                print(f"FAIL ({m.name}): {e}")
    except Exception as e:
        print(f"GLOBAL ERROR: {e}")

if __name__ == "__main__":
    test_listed()
