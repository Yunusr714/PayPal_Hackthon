from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SaleRecordBase(BaseModel):
    customer_name: str
    customer_phone: Optional[str] = None
    category_type: str = "service"
    item_name: str
    quantity: float = 1.0
    unit_price: float = 0.0
    total_amount: float = 0.0
    payment_mode: str = "CASH"
    status: str = "COMPLETED"
    due_date: Optional[str] = None
    date: str
    notes: Optional[str] = None
    paypal_invoice_id: Optional[str] = None


class SaleRecordCreate(SaleRecordBase):
    pass


class SaleRecordUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    category_type: Optional[str] = None
    item_name: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_amount: Optional[float] = None
    payment_mode: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = None
    paypal_invoice_id: Optional[str] = None


class SaleRecordRead(SaleRecordBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
