import os
import google.generativeai as genai
import sys

def test_old():
    key = os.getenv('GEMINI_API_KEY')
    if not key:
        print("ERROR: No key")
        return

    try:
        genai.configure(api_key=key)
        print("Listing models (old SDK)...")
        models = list(genai.list_models())
        for m in models:
            print(f"Model: {m.name}")
            
        print("Attempting generate_content (gemini-1.5-flash)...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content('Hello')
        print(f"SUCCESS (old SDK): {response.text}")
    except Exception as e:
        print(f"FAIL (old SDK): {e}")

if __name__ == "__main__":
    test_old()
