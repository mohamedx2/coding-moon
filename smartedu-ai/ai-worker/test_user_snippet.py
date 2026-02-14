import os
from google import genai
import sys

def test_user_snippet():
    key = os.getenv('GEMINI_API_KEY')
    print(f"DEBUG: Using API Key: {key[:10]}...")
    if not key:
        print("ERROR: GEMINI_API_KEY not found in env")
        return

    try:
        # Use simple client initialization as per user snippet
        client = genai.Client(api_key=key)
        
        print("Attempting generate_content with gemini-2.0-flash...")
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents="Explain how AI works in a few words"
            )
            print(f"SUCCESS (gemini-2.0-flash): {response.text}")
            return
        except Exception as e:
            print(f"FAIL (gemini-2.0-flash): {e}")

        print("Attempting generate_content with gemini-1.5-flash...")
        try:
            response = client.models.generate_content(
                model="gemini-1.5-flash", 
                contents="Hello"
            )
            print(f"SUCCESS (gemini-1.5-flash): {response.text}")
            return
        except Exception as e:
            print(f"FAIL (gemini-1.5-flash): {e}")

    except Exception as e:
        print(f"GLOBAL ERROR: {e}")

if __name__ == "__main__":
    test_user_snippet()
