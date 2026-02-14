import os
import httpx
import json

def final_diag():
    key = os.getenv('GEMINI_API_KEY')
    if not key:
        print("ERROR: No key")
        return

    # 1. LIST models (v1)
    print("--- LIST V1 ---")
    r = httpx.get(f"https://generativelanguage.googleapis.com/v1/models?key={key}")
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        for m in data.get('models', []):
            print(f"Model: {m['name']} | Generation Methods: {m.get('supportedGenerationMethods', [])}")
    else:
        print(f"Body: {r.text}")

    # 2. TEST specific model (gemini-1.5-flash) with full logging
    print("\n--- TEST V1 / gemini-1.5-flash ---")
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={key}"
    payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
    r = httpx.post(url, json=payload, timeout=10.0)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")

    # 3. TEST (v1beta) / gemini-1.5-flash
    print("\n--- TEST V1BETA / gemini-1.5-flash ---")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
    r = httpx.post(url, json=payload, timeout=10.0)
    print(f"Status: {r.status_code}")
    print(f"Body: {r.text}")

if __name__ == "__main__":
    final_diag()
