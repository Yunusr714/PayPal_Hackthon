from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="default-workspace")
    display_name: Mapped[str] = mapped_column(String(100), default="FlowCollect Studio")
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    demo_mode: Mapped[bool] = mapped_column(Boolean, default=True)
    currency_default: Mapped[str] = mapped_column(String(3), default="USD")
    policy_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
