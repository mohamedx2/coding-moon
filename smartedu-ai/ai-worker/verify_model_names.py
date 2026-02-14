import os
from google import genai
import sys

def verify_names():
    key = "AIzaSyA6r-HgX5wdeW_28EUoAVuE4knSs9reJmI" 
    client = genai.Client(api_key=key)
    
    # Try common variants that are often supported when the base name 404s
    variants = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-latest",
        "gemini-pro-vision",
        "chat-bison-001"
    ]

    for v in variants:
        print(f"Testing {v}...")
        try:
            response = client.models.generate_content(
                model=v,
                contents="Hi"
            )
            print(f"✅ SUCCESS ({v}): {response.text}")
            return
        except Exception as e:
            print(f"FAIL ({v}): {e}")

if __name__ == "__main__":
    verify_names()
