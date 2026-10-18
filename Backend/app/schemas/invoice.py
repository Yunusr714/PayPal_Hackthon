from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class InvoiceLineItemBase(BaseModel):
    description: str = Field(..., min_length=1)
    quantity: float = Field(default=1.0, gt=0)
    unit_amount: float = Field(default=0.0, ge=0)
    source_text: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    confirmed_by_user: bool = True


class InvoiceLineItemCreate(InvoiceLineItemBase):
    pass


class InvoiceLineItemRead(InvoiceLineItemBase):
    id: str
    total_amount: float

    model_config = ConfigDict(from_attributes=True)


class InvoiceBase(BaseModel):
    recipient_name: str = Field(..., min_length=1)
    recipient_email: EmailStr
    currency: str = Field(default="USD", min_length=3, max_length=3)
    issue_date: str = Field(..., description="Issue date in YYYY-MM-DD")
    due_date: str = Field(..., description="Due date in YYYY-MM-DD")
    memo: Optional[str] = None
    raw_work_brief: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    items: List[InvoiceLineItemCreate] = Field(..., min_length=1)


class InvoiceUpdate(BaseModel):
    recipient_name: Optional[str] = None
    recipient_email: Optional[EmailStr] = None
    currency: Optional[str] = None
    due_date: Optional[str] = None
    memo: Optional[str] = None
    items: Optional[List[InvoiceLineItemCreate]] = None


class InvoiceRead(InvoiceBase):
    id: str
    workspace_id: str
    paypal_invoice_id: Optional[str] = None
    paypal_invoice_number: Optional[str] = None
    subtotal: float
    total: float
    status: str
    is_simulated: bool
    source_type: str
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[InvoiceLineItemRead]

    model_config = ConfigDict(from_attributes=True)
