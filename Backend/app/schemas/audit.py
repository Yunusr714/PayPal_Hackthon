from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditEventRead(BaseModel):
    id: str
    workspace_id: str
    actor_type: str
    action: str
    entity_type: str
    entity_id: str
    summary: str
    details_json: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
