from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.ai_service import ai_service
from app.services.audit_service import AuditService

router = APIRouter()


class IntakeRequest(BaseModel):
    work_brief: str = Field(..., min_length=5, description="Natural language work notes or project summary")


@router.post("/extract")
async def extract_invoice_from_brief(
    payload: IntakeRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Extracts structured invoice details, line items, and missing field alerts from work notes (FR-02, FR-03).
    """
    try:
        extracted = await ai_service.extract_invoice_from_notes(payload.work_brief)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")

    await AuditService.log_event(
        db=db,
        actor_type="AI",
        action="INVOICE_EXTRACTED",
        entity_type="INVOICE_INTAKE",
        entity_id="draft",
        summary=f"Extracted invoice for {extracted.get('recipient_name', 'Unknown')} with {len(extracted.get('items', []))} items",
        details=extracted,
    )

    return extracted
