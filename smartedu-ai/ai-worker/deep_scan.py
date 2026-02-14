import os
import httpx
import json

def deep_scan():
    key = os.getenv('GEMINI_API_KEY')
    if not key: return

    for v in ["v1", "v1beta"]:
        print(f"=== SCANNING {v} ===")
        try:
            r = httpx.get(f"https://generativelanguage.googleapis.com/{v}/models?key={key}")
            if r.status_code == 200:
                models = r.json().get('models', [])
                for m in models:
                    name = m['name'] # models/xxx
                    print(f"Found: {name}")
                    # Try generateContent
                    url = f"https://generativelanguage.googleapis.com/{v}/{name}:generateContent?key={key}"
                    payload = {"contents": [{"parts": [{"text": "Say OK"}]}]}
                    try:
                        res = httpx.post(url, json=payload, timeout=5.0)
                        print(f"   {v}/{name} -> {res.status_code}")
                        if res.status_code == 200:
                            print(f"   ✅ SUCCESS: {res.text[:100]}")
                    except Exception as e:
                        print(f"   ERROR {name}: {e}")
            else:
                print(f"List {v} failed: {r.status_code}")
        except Exception as e:
            print(f"Global error {v}: {e}")

if __name__ == "__main__":
    deep_scan()
