from typing import Optional
from pydantic import BaseModel


class ConnectionStatusResponse(BaseModel):
    environment: str
    demo_mode: bool
    paypal_configured: bool
    paypal_mode: str
    paypal_base_url: str
    database_connected: bool
    llm_provider: str
    llm_configured: bool
