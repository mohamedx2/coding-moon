import asyncio
from database import get_db, init_db
from models import User, UserRole
from auth import create_access_token, decode_token
from sqlalchemy import select
import urllib.request, urllib.error

async def test():
    await init_db()
    async for session in get_db():
        result = await session.execute(select(User).where(User.email == "admin@smartedu.ai"))
        user = result.scalar_one_or_none()
        if not user:
            print("NO USER FOUND", flush=True)
            return
        
        role_val = user.role.value if hasattr(user.role, "value") else user.role
        print(f"User role raw: {repr(user.role)}", flush=True)
        print(f"User role value: {role_val}", flush=True)
        
        token = create_access_token(user.id, user.role, user.tenant_id)
        decoded = decode_token(token)
        print(f"Token role: {repr(decoded['role'])}", flush=True)
        
        # Simulate what require_role does
        allowed = [r.value if hasattr(r, "value") else str(r) for r in (UserRole.admin, UserRole.super_admin)]
        print(f"Allowed list: {allowed}", flush=True)
        print(f"Token role in allowed: {decoded['role'] in allowed}", flush=True)
        
        # Also check what create_access_token stored
        print(f"str(user.role) passed to token: {repr(str(user.role))}", flush=True)
        
        req = urllib.request.Request("http://localhost:8000/api/admin/stats")
        req.add_header("Authorization", f"Bearer {token}")
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                print(f"HTTP {resp.getcode()} OK", flush=True)
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"HTTP {e.code}: {body[:200]}", flush=True)
        return

asyncio.run(test())
