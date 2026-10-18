from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ChatMessageRequest(BaseModel):
    message: str
    category_mode: str = "service"  # 'shop' or 'service'
    context: Optional[Dict[str, Any]] = None


class ChatMessageResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    action_card: Optional[Dict[str, Any]] = None
