import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Text, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id: Mapped[str] = mapped_column(String(50), ForeignKey("workspaces.id"), default="default-workspace")
    
    # PayPal Invoicing API identifiers
    paypal_invoice_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    paypal_invoice_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Recipient / Buyer information
    recipient_name: Mapped[str] = mapped_column(String(150))
    recipient_email: Mapped[str] = mapped_column(String(150), index=True)
    
    # Financial details
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Lifecycle & status (authoritative state confirmed by PayPal)
    # DRAFT, SENT, PAID, CANCELLED, REFUNDED, NEEDS_SYNC
    status: Mapped[str] = mapped_column(String(30), default="DRAFT", index=True)
    is_simulated: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Dates
    issue_date: Mapped[str] = mapped_column(String(20))  # ISO or YYYY-MM-DD
    due_date: Mapped[str] = mapped_column(String(20))    # ISO or YYYY-MM-DD
    
    # Context & Provenance
    source_type: Mapped[str] = mapped_column(String(50), default="AI_EXTRACTED")  # AI_EXTRACTED, MANUAL
    raw_work_brief: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    memo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamps
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    items: Mapped[List["InvoiceLineItem"]] = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id: Mapped[str] = mapped_column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"))
    
    description: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[float] = mapped_column(Float, default=1.0)
    unit_amount: Mapped[float] = mapped_column(Float, default=0.0)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    
    # AI provenance
    source_text: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    confirmed_by_user: Mapped[bool] = mapped_column(Boolean, default=True)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")
