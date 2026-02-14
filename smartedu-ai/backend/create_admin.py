
import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import engine, Base, get_db
from models import User, Tenant, UserRole
from auth import hash_password

async def create_super_admin():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        # await conn.run_sync(Base.metadata.create_all)
        pass

    async with AsyncSession(engine) as db:
        # 1. Create Default Tenant
        tenant_stmt = select(Tenant).where(Tenant.slug == "global")
        result = await db.execute(tenant_stmt)
        tenant = result.scalar_one_or_none()

        if not tenant:
            tenant = Tenant(
                id=uuid.uuid4(),
                name="SmartEdu Global",
                slug="global",
                domain="smartedu.ai",
                plan="enterprise",
                is_active=True
            )
            db.add(tenant)
            await db.flush()
            print(f"✅ Created default tenant: {tenant.name}")
        else:
            print(f"ℹ️ Default tenant already exists: {tenant.name}")

        # 2. Create Super Admin User
        admin_email = "admin@smartedu.ai"
        user_stmt = select(User).where(User.email == admin_email)
        result = await db.execute(user_stmt)
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                email=admin_email,
                name="System Administrator",
                hashed_password=hash_password("admin123"),  # In production, this should be prompted or secure
                role=UserRole.super_admin,
                is_active=True,
                is_verified=True
            )
            db.add(user)
            print(f"✅ Created super admin user: {admin_email}")
        else:
            print(f"ℹ️ Super admin user already exists: {admin_email}")

        await db.commit()
        print("🚀 Platform provisioning complete.")

if __name__ == "__main__":
    asyncio.run(create_super_admin())
