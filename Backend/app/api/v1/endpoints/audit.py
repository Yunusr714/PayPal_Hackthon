from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.session import get_db
from app.db.models.audit import AuditEvent
from app.schemas.audit import AuditEventRead

router = APIRouter()


@router.get("", response_model=List[AuditEventRead])
async def list_audit_events(
    limit: int = Query(50, ge=1, le=200),
    entity_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Returns chronological audit events ledger."""
    query = select(AuditEvent).order_by(desc(AuditEvent.created_at)).limit(limit)
    if entity_id:
        query = query.where(AuditEvent.entity_id == entity_id)

    result = await db.execute(query)
    events = result.scalars().all()
    return events
