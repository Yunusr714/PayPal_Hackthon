import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id: Mapped[str] = mapped_column(String(50), default="default-workspace", index=True)
    
    actor_type: Mapped[str] = mapped_column(String(30))  # HUMAN, AI, PAYPAL_API, WEBHOOK, FIXTURE
    action: Mapped[str] = mapped_column(String(100))      # INVOICE_CREATED, INVOICE_SENT, REMINDER_TRIGGERED, PAYMENT_CONFIRMED, etc.
    
    entity_type: Mapped[str] = mapped_column(String(50)) # INVOICE, WEBHOOK, CLIENT_REPLY, ACTION_RECOMMENDATION
    entity_id: Mapped[str] = mapped_column(String(100), index=True)
    
    summary: Mapped[str] = mapped_column(String(255))
    details_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
