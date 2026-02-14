import os
import httpx
import json

def brute_force():
    key = os.getenv('GEMINI_API_KEY')
    if not key:
        print("ERROR: No key")
        return

    versions = ["v1", "v1beta"]
    models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-pro",
        "gemini-1.0-pro"
    ]

    for v in versions:
        # First, try to list models for this version
        list_url = f"https://generativelanguage.googleapis.com/{v}/models?key={key}"
        try:
            r = httpx.get(list_url)
            print(f"LIST {v}: {r.status_code}")
            if r.status_code == 200:
                print(f"LIST {v} SUCCESS: {r.text[:500]}")
        except Exception as e:
            print(f"LIST {v} ERROR: {e}")

        # Then try generateContent for each model
        for m in models:
            url = f"https://generativelanguage.googleapis.com/{v}/models/{m}:generateContent?key={key}"
            payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
            try:
                r = httpx.post(url, json=payload, timeout=10.0)
                print(f"TEST {v}/{m}: {r.status_code}")
                if r.status_code == 200:
                    print(f"✅ WORKS: {v}/{m}!")
                    return
                else:
                    print(f"   BODY: {r.text}")
            except Exception as e:
                print(f"   ERROR: {e}")

if __name__ == "__main__":
    brute_force()
