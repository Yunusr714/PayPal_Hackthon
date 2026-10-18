import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # provider_event_id is unique to guarantee deduplication / idempotency
    provider_event_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    event_type: Mapped[str] = mapped_column(String(100), index=True)
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    event_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    signature_valid: Mapped[bool] = mapped_column(Boolean, default=False)
    is_fixture: Mapped[bool] = mapped_column(Boolean, default=False)
    
    raw_payload: Mapped[str] = mapped_column(Text)
    processing_result: Mapped[str] = mapped_column(String(50), default="PROCESSED")  # PROCESSED, DUPLICATE_IGNORED, FAILED, INVALID_SIGNATURE
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
