import os
import google.generativeai as genai
import sys

def test():
    key = os.getenv('GEMINI_API_KEY')
    print(f"DEBUG: Using API Key: {key[:10]}...")
    if not key:
        print("ERROR: GEMINI_API_KEY not found in env")
        return

    try:
        # Try with transport='rest'
        print("Configuring genai with transport='rest'...")
        genai.configure(api_key=key, transport='rest')
        
        test_models = ['models/gemini-1.5-flash', 'models/gemini-pro']
        for model_name in test_models:
            print(f"Testing model: {model_name} (REST)...")
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content('Hello')
                print(f"SUCCESS ({model_name} REST): {response.text}")
                return
            except Exception as e:
                print(f"FAIL ({model_name} REST): {e}")
                sys.stdout.flush()

        # Try with default transport again
        print("Configuring genai with default transport...")
        genai.configure(api_key=key)
        for model_name in test_models:
            print(f"Testing model: {model_name} (Default)...")
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content('Hello')
                print(f"SUCCESS ({model_name} Default): {response.text}")
                return
            except Exception as e:
                print(f"FAIL ({model_name} Default): {e}")
                sys.stdout.flush()

    except Exception as e:
        print(f"GLOBAL ERROR: {e}")

if __name__ == "__main__":
    test()
