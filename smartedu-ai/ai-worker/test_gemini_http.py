import os
import httpx
import json
import sys

def test_raw_http():
    key = os.getenv('GEMINI_API_KEY')
    print(f"DEBUG: Using API Key: {key[:10]}...")
    if not key:
        print("ERROR: GEMINI_API_KEY not found in env")
        return

    # Correct URL: https://generativelanguage.googleapis.com/v1/models/{model}:generateContent
    # If model_name is "gemini-1.5-flash", the path is models/gemini-1.5-flash
    configs = [
        ("v1", "gemini-1.5-flash"),
        ("v1", "gemini-pro"),
        ("v1beta", "gemini-1.5-flash"),
        ("v1beta", "gemini-pro"),
    ]
    
    for version, model_id in configs:
        url = f"https://generativelanguage.googleapis.com/{version}/models/{model_id}:generateContent?key={key}"
        payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
        headers = {"Content-Type": "application/json"}

        print(f"Testing {version} {model_id}...")
        try:
            with httpx.Client() as client:
                response = client.post(url, json=payload, headers=headers, timeout=10.0)
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    print(f"SUCCESS ({version} {model_id})")
                    print(f"Response: {response.text[:200]}...")
                    return
                else:
                    print(f"FAIL: {response.text}")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    test_raw_http()
