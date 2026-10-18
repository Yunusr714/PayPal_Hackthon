import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class SaleRecord(Base):
    __tablename__ = "sales_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    customer_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    category_type: Mapped[str] = mapped_column(String(20), default="service")  # 'shop' or 'service'
    item_name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, default=1.0)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    payment_mode: Mapped[str] = mapped_column(String(30), default="CASH")  # CASH, UPI, PAYPAL, CREDIT
    status: Mapped[str] = mapped_column(String(30), default="COMPLETED")  # COMPLETED, PENDING, SCHEDULED, IN_PROGRESS, DELIVERED
    due_date: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    date: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    paypal_invoice_id: Mapped[Optional[str]] = mapped_column(String(80), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
