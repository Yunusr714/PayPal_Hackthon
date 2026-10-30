from sqlalchemy.ext.asyncio import AsyncSession

async def seed_initial_data(db: AsyncSession) -> None:
    """Zero dummy seeding: Users start completely fresh and add their own services and catalog items."""
    pass
