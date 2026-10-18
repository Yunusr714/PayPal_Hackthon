from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CatalogItemBase(BaseModel):
    name: str
    category_type: str = "service"
    sub_category: Optional[str] = None
    pricing_type: str = "Fixed"
    price: float = 0.0
    stock_quantity: int = 0
    duration: Optional[str] = None
    description: Optional[str] = None
    is_available: bool = True


class CatalogItemCreate(CatalogItemBase):
    pass


class CatalogItemUpdate(BaseModel):
    name: Optional[str] = None
    category_type: Optional[str] = None
    sub_category: Optional[str] = None
    pricing_type: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    is_available: Optional[bool] = None


class CatalogItemRead(CatalogItemBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
