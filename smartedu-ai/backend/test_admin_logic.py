import sys
import os
import asyncio
from unittest.mock import AsyncMock, MagicMock

# Add current directory to path
sys.path.append(os.getcwd())

async def test_admin_stats():
    # Mock database
    db = AsyncMock()
    db.scalar = AsyncMock(side_effect=[100, 20, 5, 50]) # user_count, course_count, tenant_count, ai_requests
    
    # Mock current_user
    current_user = {"user_id": "admin_1", "role": "admin", "tenant_id": "tenant_1"}
    
    # Import the router function
    from routes.admin import get_platform_stats
    
    # Call the function
    stats = await get_platform_stats(current_user=current_user, db=db)
    
    print("Admin Stats Result:")
    print(stats)
    
    assert stats["total_users"] == 100
    assert stats["total_courses"] == 20
    assert stats["active_tenants"] == 5
    assert stats["ai_requests_today"] == 50
    print("✅ Admin Stats logic verified!")

if __name__ == "__main__":
    try:
        asyncio.run(test_admin_stats())
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
