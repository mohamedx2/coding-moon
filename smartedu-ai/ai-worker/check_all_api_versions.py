import os
import httpx
from google import genai

def check_all():
    key = "AIzaSyA6r-HgX5wdeW_28EUoAVuE4knSs9reJmI"
    
    # 1. SDK Check
    print("--- SDK Check ---")
    try:
        client = genai.Client(api_key=key)
        # Try a model that actually exists in the v1 list we saw earlier
        model_name = "gemini-1.5-flash"
        print(f"Testing SDK with {model_name}...")
        resp = client.models.generate_content(model=model_name, contents="Hi")
        print(f"✅ SDK SUCCESS: {resp.text}")
    except Exception as e:
        print(f"❌ SDK FAIL: {e}")

    # 2. Raw HTTP v1 Check
    print("\n--- HTTP v1 Check ---")
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={key}"
    try:
        r = httpx.post(url, json={"contents": [{"parts": [{"text": "Hi"}]}]}, timeout=10)
        print(f"v1 Status: {r.status_code}")
        print(f"v1 Body: {r.text}")
    except Exception as e:
        print(f"v1 Error: {e}")

    # 3. Raw HTTP v1beta Check
    print("\n--- HTTP v1beta Check ---")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
    try:
        r = httpx.post(url, json={"contents": [{"parts": [{"text": "Hi"}]}]}, timeout=10)
        print(f"v1beta Status: {r.status_code}")
        print(f"v1beta Body: {r.text}")
    except Exception as e:
        print(f"v1beta Error: {e}")

if __name__ == "__main__":
    check_all()
