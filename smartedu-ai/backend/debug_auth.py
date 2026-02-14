
import asyncio
import sys
import json
from sqlalchemy import select
from database import get_db, init_db
from models import User, UserRole
from auth import create_access_token, decode_token
from uuid import uuid4
import urllib.request
import urllib.error

async def debug_admin_user():
    print("🔍 Starting Debug Auth Script...")
    try:
        # Initialize DB connection
        await init_db()
        
        async for session in get_db():
            stmt = select(User).where(User.email == "admin@smartedu.ai")
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ User admin@smartedu.ai NOT FOUND in database!")
                return
            
            print(f"✅ User Found: {user.email}")
            print(f"   ID: {user.id}")
            print(f"   Role: {user.role} (Type: {type(user.role)})")
            print(f"   Is Active: {user.is_active}")
            print(f"   Tenant ID: {user.tenant_id}")
            
            # Test Role Comparison
            print(f"   UserRole.admin: {UserRole.admin}")
            print(f"   Equality Check ('admin' == UserRole.admin): {'admin' == UserRole.admin}")
            
            # Generate Token
            # Note: create_access_token returns a string
            token = create_access_token(user.id, user.role, user.tenant_id)
            print(f"\n🔑 Generated Token: {token[:20]}...")
            
            decoded = decode_token(token)
            print(f"   Decoded Role: {decoded['role']}")
            
            # Requests check
            url = "http://localhost:8000/api/admin/stats"
            req = urllib.request.Request(url)
            req.add_header("Authorization", f"Bearer {token}")
            
            print(f"\n📡 Attempting request to {url}...")
            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    print(f"   ✅ Response Code: {response.getcode()}")
                    body = response.read().decode('utf-8')
                    print(f"   ✅ Response Body: {body[:100]}...")
            except urllib.error.HTTPError as e:
                print(f"   ❌ HTTP Error: {e.code} {e.reason}")
                print(f"   ❌ Body: {e.read().decode('utf-8')[:200]}")
            except Exception as e:
                print(f"   ❌ Network Error: {e}")
            
            return

    except Exception as e:
        print(f"❌ Script Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_admin_user())
