from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    category: str = "service"
    total_purchases: float = 0.0
    outstanding: float = 0.0
    credit_limit: float = 5000.0
    behaviour: str = "Good"
    risk_score: int = 25
    last_visit: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    category: Optional[str] = None
    total_purchases: Optional[float] = None
    outstanding: Optional[float] = None
    credit_limit: Optional[float] = None
    behaviour: Optional[str] = None
    risk_score: Optional[int] = None
    last_visit: Optional[str] = None


class CustomerRead(CustomerBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
