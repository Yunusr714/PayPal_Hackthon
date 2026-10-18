from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.db.models.invoice import Invoice, InvoiceLineItem
from app.schemas.invoice import InvoiceCreate, InvoiceRead, InvoiceUpdate
from app.services.paypal_client import paypal_client
from app.services.audit_service import AuditService

router = APIRouter()


@router.get("", response_model=List[InvoiceRead])
async def list_invoices(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Invoice).options(selectinload(Invoice.items)).order_by(desc(Invoice.created_at))
    if status_filter and status_filter.upper() != "ALL":
        query = query.where(Invoice.status == status_filter.upper())
    
    result = await db.execute(query)
    invoices = result.scalars().all()
    return invoices


@router.post("", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
):
    # Compute totals deterministically
    subtotal = sum(item.quantity * item.unit_amount for item in payload.items)
    total = subtotal

    new_invoice = Invoice(
        recipient_name=payload.recipient_name,
        recipient_email=payload.recipient_email,
        currency=payload.currency.upper(),
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        memo=payload.memo,
        raw_work_brief=payload.raw_work_brief,
        subtotal=subtotal,
        total=total,
        status="DRAFT",
        is_simulated=False,
    )
    db.add(new_invoice)
    await db.flush()

    for it in payload.items:
        line = InvoiceLineItem(
            invoice_id=new_invoice.id,
            description=it.description,
            quantity=it.quantity,
            unit_amount=it.unit_amount,
            total_amount=it.quantity * it.unit_amount,
            source_text=it.source_text,
            confidence=it.confidence,
            confirmed_by_user=it.confirmed_by_user,
        )
        db.add(line)

    await db.commit()
    
    # Reload invoice with items
    query = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == new_invoice.id)
    result = await db.execute(query)
    saved_invoice = result.scalar_one()

    await AuditService.log_event(
        db=db,
        actor_type="HUMAN",
        action="INVOICE_CREATED",
        entity_type="INVOICE",
        entity_id=saved_invoice.id,
        summary=f"Created invoice draft for {saved_invoice.recipient_name} ({saved_invoice.currency} {saved_invoice.total:.2f})",
    )

    return saved_invoice


@router.get("/{invoice_id}", response_model=InvoiceRead)
async def get_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id)
    result = await db.execute(query)
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


@router.post("/{invoice_id}/create-paypal-draft", response_model=InvoiceRead)
async def create_paypal_draft(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Gate 1: Explicit user confirmation to push invoice to PayPal Sandbox as Draft."""
    query = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id)
    result = await db.execute(query)
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    items_data = [
        {"description": it.description, "quantity": it.quantity, "unit_amount": it.unit_amount}
        for it in inv.items
    ]
    invoice_number = f"CSK-{inv.id[:8].upper()}"

    pp_res = await paypal_client.create_draft_invoice(
        invoice_number=invoice_number,
        issue_date=inv.issue_date,
        due_date=inv.due_date,
        currency=inv.currency,
        recipient_name=inv.recipient_name,
        recipient_email=inv.recipient_email,
        items=items_data,
        memo=inv.memo,
    )

    inv.paypal_invoice_id = pp_res.get("id")
    inv.paypal_invoice_number = invoice_number
    inv.is_simulated = pp_res.get("is_simulated", False)
    inv.last_synced_at = datetime.now(timezone.utc)
    await db.commit()

    actor = "FIXTURE" if inv.is_simulated else "PAYPAL_API"
    await AuditService.log_event(
        db=db,
        actor_type=actor,
        action="PAYPAL_DRAFT_CREATED",
        entity_type="INVOICE",
        entity_id=inv.id,
        summary=f"Created PayPal draft {inv.paypal_invoice_id} ({'Simulated' if inv.is_simulated else 'Live Sandbox'})",
        details=pp_res,
    )

    return inv


@router.post("/{invoice_id}/send-paypal", response_model=InvoiceRead)
async def send_paypal_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Gate 2: Explicit user confirmation to send invoice through PayPal Invoicing API."""
    query = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id)
    result = await db.execute(query)
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if not inv.paypal_invoice_id:
        raise HTTPException(status_code=400, detail="Cannot send: PayPal draft has not been created yet")

    pp_res = await paypal_client.send_invoice(inv.paypal_invoice_id)
    inv.status = "SENT"
    inv.last_synced_at = datetime.now(timezone.utc)
    await db.commit()

    actor = "FIXTURE" if inv.is_simulated else "PAYPAL_API"
    await AuditService.log_event(
        db=db,
        actor_type=actor,
        action="PAYPAL_INVOICE_SENT",
        entity_type="INVOICE",
        entity_id=inv.id,
        summary=f"Sent invoice {inv.paypal_invoice_id} to {inv.recipient_email}",
        details=pp_res,
    )

    return inv


@router.post("/{invoice_id}/remind-paypal", response_model=InvoiceRead)
async def send_paypal_reminder(
    invoice_id: str,
    subject: Optional[str] = Query("Payment Reminder for Invoice"),
    note: Optional[str] = Query("Friendly reminder regarding your outstanding invoice."),
    db: AsyncSession = Depends(get_db),
):
    """Trigger native PayPal reminder endpoint (rate-limited by PayPal to 2 per day)."""
    query = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id)
    result = await db.execute(query)
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if not inv.paypal_invoice_id or inv.status == "DRAFT":
        raise HTTPException(status_code=400, detail="Only sent/unpaid PayPal invoices can be reminded")

    if inv.status in ("PAID", "CANCELLED", "REFUNDED"):
        raise HTTPException(status_code=400, detail=f"Cannot remind: invoice is already in terminal state {inv.status}")

    pp_res = await paypal_client.send_native_reminder(
        paypal_invoice_id=inv.paypal_invoice_id,
        subject=subject or "Payment Reminder",
        note=note or "Please review and settle your invoice.",
    )
    inv.last_synced_at = datetime.now(timezone.utc)
    await db.commit()

    actor = "FIXTURE" if inv.is_simulated else "PAYPAL_API"
    await AuditService.log_event(
        db=db,
        actor_type=actor,
        action="PAYPAL_REMINDER_SENT",
        entity_type="INVOICE",
        entity_id=inv.id,
        summary=f"Triggered native PayPal reminder for {inv.paypal_invoice_id}",
        details=pp_res,
    )

    return inv


@router.post("/{invoice_id}/refresh", response_model=InvoiceRead)
async def refresh_invoice_status(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Manual reconciliation: fetches latest authoritative status from PayPal API."""
    query = select(Invoice).options(selectinload(Invoice.items)).where(Invoice.id == invoice_id)
    result = await db.execute(query)
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if not inv.paypal_invoice_id or inv.is_simulated:
        inv.last_synced_at = datetime.now(timezone.utc)
        await db.commit()
        return inv

    details = await paypal_client.get_invoice_details(inv.paypal_invoice_id)
    remote_status = details.get("status")
    if remote_status:
        inv.status = remote_status.upper()
    inv.last_synced_at = datetime.now(timezone.utc)
    await db.commit()

    await AuditService.log_event(
        db=db,
        actor_type="PAYPAL_API",
        action="STATUS_RECONCILED",
        entity_type="INVOICE",
        entity_id=inv.id,
        summary=f"Reconciled invoice {inv.paypal_invoice_id} status from PayPal: {inv.status}",
        details=details,
    )

    return inv
