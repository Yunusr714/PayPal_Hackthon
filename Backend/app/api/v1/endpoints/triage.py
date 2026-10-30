from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.session import get_db
from app.db.models.invoice import Invoice
from app.db.models.merchant import MerchantProfile
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

    merch_res = await db.execute(select(MerchantProfile).order_by(desc(MerchantProfile.updated_at)).limit(1))
    merchant = merch_res.scalar_one_or_none()
    merchant_name = (merchant.business_name if merchant else None) or "Our Store"

    invoice_summary = {
        "id": inv.id,
        "paypal_invoice_number": inv.paypal_invoice_number or inv.id[:8],
        "recipient_name": inv.recipient_name,
        "total": inv.total,
        "currency": inv.currency,
        "due_date": inv.due_date,
        "merchant_name": merchant_name,
    }

    try:
        raw_draft = await ai_service.draft_grounded_response(
            customer_reply=payload.customer_reply,
            intent=payload.intent,
            invoice_summary=invoice_summary,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drafting response failed: {str(e)}")

    payer_url = f"https://www.sandbox.paypal.com/invoice/p/#{inv.paypal_invoice_id}" if inv.paypal_invoice_id else "https://www.sandbox.paypal.com/invoice/p/#INV2-9Z2F-ZR7C-WP8V-7K9G"

    is_partial = bool(raw_draft.get("is_partial_payment"))
    partial_amt = float(raw_draft.get("partial_amount")) if raw_draft.get("partial_amount") is not None else None
    rem_bal = float(raw_draft.get("remaining_balance")) if raw_draft.get("remaining_balance") is not None else None
    next_due = raw_draft.get("next_due_date")
    display_balance = partial_amt if (is_partial and partial_amt is not None) else float(inv.total or 0.0)

    citations = raw_draft.get("fact_citations") or []
    if is_partial and partial_amt is not None:
        citations = [
            f"Agreed Partial Payment: {inv.currency} {partial_amt:,.2f} Due Now",
            f"Remaining Balance: {inv.currency} {(rem_bal if rem_bal is not None else inv.total - partial_amt):,.2f}{f' (by {next_due})' if next_due else ''}",
            f"Full Invoice Total: {inv.currency} {inv.total:,.2f}",
            f"Customer: {inv.recipient_name}"
        ]
    elif not citations:
        citations = [
            f"Customer: {inv.recipient_name}",
            f"Total Due: {inv.currency} {inv.total:,.2f}",
            f"Due Date: {inv.due_date}",
            f"Invoice Status: {inv.status}"
        ]

    # Normalize draft payload to satisfy both UI schemas
    draft = {
        "subject": raw_draft.get("subject") or f"Regarding Invoice {inv.paypal_invoice_number or inv.id[:8]}",
        "draft_reply": raw_draft.get("draft_message") or raw_draft.get("draft_reply") or "",
        "draft_message": raw_draft.get("draft_message") or raw_draft.get("draft_reply") or "",
        "tone": raw_draft.get("tone") or "Empathetic & Professional",
        "rationale": raw_draft.get("rationale") or f"Grounded on live invoice facts ({inv.currency} {inv.total:,.2f}) and payment terms.",
        "fact_citations": citations,
        "payment_link_included": True,
        "payment_link": payer_url,
        "balance_due": display_balance,
        "total_invoice_amount": float(inv.total or 0.0),
        "is_partial_payment": is_partial,
        "partial_amount": partial_amt,
        "remaining_balance": rem_bal if rem_bal is not None else (inv.total - partial_amt if is_partial and partial_amt else None),
        "next_due_date": next_due,
        "currency": inv.currency or "USD",
        "recipient_name": inv.recipient_name,
        "recipient_email": inv.recipient_email,
        "invoice_id": inv.id,
        "paypal_invoice_id": inv.paypal_invoice_id,
        "merchant_name": merchant_name,
    }

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
