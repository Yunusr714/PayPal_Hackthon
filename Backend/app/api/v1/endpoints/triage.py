from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.invoice import Invoice
from app.services.ai_service import ai_service
from app.services.audit_service import AuditService

router = APIRouter()


class ReplyTriageRequest(BaseModel):
    invoice_id: str
    customer_reply: str = Field(..., min_length=3)


class DraftResponseRequest(BaseModel):
    invoice_id: str
    customer_reply: str
    intent: str


@router.post("/classify")
async def classify_customer_reply(
    payload: ReplyTriageRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Classifies a customer reply against an invoice into the 7-intent taxonomy (FR-11).
    """
    query = select(Invoice).where(Invoice.id == payload.invoice_id)
    result = await db.execute(query)
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice_summary = {
        "id": inv.id,
        "paypal_invoice_number": inv.paypal_invoice_number or inv.id[:8],
        "recipient_name": inv.recipient_name,
        "total": inv.total,
        "currency": inv.currency,
        "due_date": inv.due_date,
        "status": inv.status,
    }

    try:
        triage_result = await ai_service.classify_customer_reply(
            customer_reply=payload.customer_reply,
            invoice_summary=invoice_summary,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Triage classification failed: {str(e)}")

    await AuditService.log_event(
        db=db,
        actor_type="AI",
        action="REPLY_CLASSIFIED",
        entity_type="CLIENT_REPLY",
        entity_id=inv.id,
        summary=f"Classified customer reply as {triage_result.get('intent')} for {inv.recipient_name}",
        details=triage_result,
    )

    return {
        "invoice_id": inv.id,
        "invoice_status": inv.status,
        "classification": triage_result,
    }


@router.post("/draft")
async def draft_response(
    payload: DraftResponseRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Drafts an evidence-grounded response to a customer's message (FR-12, FR-14).
    """
    query = select(Invoice).where(Invoice.id == payload.invoice_id)
    result = await db.execute(query)
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice_summary = {
        "id": inv.id,
        "paypal_invoice_number": inv.paypal_invoice_number or inv.id[:8],
        "recipient_name": inv.recipient_name,
        "total": inv.total,
        "currency": inv.currency,
        "due_date": inv.due_date,
    }

    try:
        draft = await ai_service.draft_grounded_response(
            customer_reply=payload.customer_reply,
            intent=payload.intent,
            invoice_summary=invoice_summary,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drafting response failed: {str(e)}")

    await AuditService.log_event(
        db=db,
        actor_type="AI",
        action="RESPONSE_DRAFTED",
        entity_type="CLIENT_REPLY",
        entity_id=inv.id,
        summary=f"Drafted grounded response for {inv.recipient_name} ({payload.intent})",
        details=draft,
    )

    return draft
