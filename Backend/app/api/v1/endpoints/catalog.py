from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.db.models.catalog import CatalogItem
from app.schemas.catalog import CatalogItemCreate, CatalogItemRead, CatalogItemUpdate

router = APIRouter()


@router.get("", response_model=List[CatalogItemRead])
async def list_catalog(
    category_type: Optional[str] = Query(None),  # 'shop' or 'service'
    db: AsyncSession = Depends(get_db),
):
    query = select(CatalogItem)
    if category_type and category_type.lower() != "all":
        query = query.where(CatalogItem.category_type == category_type.lower())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=CatalogItemRead, status_code=status.HTTP_201_CREATED)
async def create_catalog_item(
    payload: CatalogItemCreate,
    db: AsyncSession = Depends(get_db),
):
    item = CatalogItem(
        name=payload.name,
        category_type=payload.category_type.lower(),
        sub_category=payload.sub_category,
        pricing_type=payload.pricing_type,
        price=payload.price,
        stock_quantity=payload.stock_quantity,
        duration=payload.duration,
        description=payload.description,
        is_available=payload.is_available,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=CatalogItemRead)
async def update_catalog_item(
    item_id: str,
    payload: CatalogItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CatalogItem).where(CatalogItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Catalog item not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "category_type" and value:
            setattr(item, key, value.lower())
        else:
            setattr(item, key, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_catalog_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CatalogItem).where(CatalogItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Catalog item not found")

    await db.delete(item)
    await db.commit()
    return None
