from fastapi import APIRouter
from app.core.config import settings
from app.schemas.settings import ConnectionStatusResponse

router = APIRouter()


@router.get("/connection", response_model=ConnectionStatusResponse)
async def get_connection_status():
    return ConnectionStatusResponse(
        environment=settings.ENVIRONMENT,
        demo_mode=settings.DEMO_MODE,
        paypal_configured=settings.is_paypal_configured,
        paypal_mode=settings.PAYPAL_MODE,
        paypal_base_url=settings.PAYPAL_BASE_URL,
        database_connected=True,
        llm_provider=settings.LLM_PROVIDER,
        llm_configured=settings.is_llm_configured,
    )
