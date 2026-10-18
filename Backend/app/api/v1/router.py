from fastapi import APIRouter
from app.api.v1.endpoints import (
    invoices,
    webhooks,
    audit,
    settings,
    intake,
    triage,
    customers,
    catalog,
    sales,
    chat,
)

api_router = APIRouter()

api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoices"])
api_router.include_router(intake.router, prefix="/intake", tags=["Intake"])
api_router.include_router(triage.router, prefix="/triage", tags=["Reply Triage"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["Catalog"])
api_router.include_router(sales.router, prefix="/sales", tags=["Sales"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Copilot Chat"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
