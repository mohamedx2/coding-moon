import asyncio
from database import engine
from sqlalchemy import inspect

async def check_db():
    print("Checking database...")
    async with engine.connect() as conn:
        def get_tables(sync_conn):
            inspector = inspect(sync_conn)
            return inspector.get_table_names()
        
        tables = await conn.run_sync(get_tables)
        print(f"Tables found: {tables}")
        
        if "users" in tables:
            def get_columns(sync_conn):
                inspector = inspect(sync_conn)
                return [c["name"] for c in inspector.get_columns("users")]
            columns = await conn.run_sync(get_columns)
            print(f"Columns in 'users': {columns}")

if __name__ == "__main__":
    asyncio.run(check_db())
