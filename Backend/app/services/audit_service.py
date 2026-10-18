import json
from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.audit import AuditEvent


class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        actor_type: str,
        action: str,
        entity_type: str,
        entity_id: str,
        summary: str,
        details: Optional[Any] = None,
        workspace_id: str = "default-workspace",
    ) -> AuditEvent:
        details_str = None
        if details is not None:
            if isinstance(details, (dict, list)):
                details_str = json.dumps(details)
            else:
                details_str = str(details)

        event = AuditEvent(
            workspace_id=workspace_id,
            actor_type=actor_type,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            summary=summary,
            details_json=details_str,
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event
