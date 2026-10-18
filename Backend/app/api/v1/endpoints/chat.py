from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.db.models.customer import Customer
from app.db.models.sale import SaleRecord
from app.db.models.catalog import CatalogItem
from app.db.models.invoice import Invoice
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("", response_model=ChatMessageResponse)
async def chat_with_copilot(
    payload: ChatMessageRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        # 1. Fetch live customers from SQLite
        cust_res = await db.execute(
            select(Customer).order_by(desc(Customer.outstanding), Customer.name)
        )
        customers = cust_res.scalars().all()
        customers_summary = [
            {
                "name": c.name,
                "phone": c.phone,
                "category": c.category,
                "outstanding": c.outstanding,
                "total_purchases": c.total_purchases,
                "risk_score": c.risk_score,
                "last_visit": c.last_visit,
            }
            for c in customers
        ]
        customers_with_dues = [c for c in customers_summary if c["outstanding"] > 0]
        total_outstanding_sum = sum(c["outstanding"] for c in customers_with_dues)

        # 2. Fetch live sales and work orders from SQLite
        sales_res = await db.execute(
            select(SaleRecord).order_by(desc(SaleRecord.created_at)).limit(30)
        )
        sales = sales_res.scalars().all()
        sales_summary = [
            {
                "customer_name": s.customer_name,
                "customer_phone": s.customer_phone,
                "category_type": s.category_type,
                "item_name": s.item_name,
                "quantity": s.quantity,
                "total_amount": s.total_amount,
                "payment_mode": s.payment_mode,
                "status": s.status,
                "due_date": s.due_date,
                "date": s.date,
                "notes": s.notes,
            }
            for s in sales
        ]

        # 3. Fetch active catalog items from SQLite
        cat_res = await db.execute(
            select(CatalogItem).where(CatalogItem.is_available == True)
        )
        catalog = cat_res.scalars().all()
        catalog_summary = [
            {
                "name": item.name,
                "category_type": item.category_type,
                "sub_category": item.sub_category,
                "price": item.price,
                "duration": item.duration,
                "stock_quantity": item.stock_quantity,
            }
            for item in catalog
        ]

        # 4. Fetch PayPal Invoices
        inv_res = await db.execute(
            select(Invoice).order_by(desc(Invoice.created_at)).limit(10)
        )
        invoices = inv_res.scalars().all()
        invoices_summary = [
            {
                "recipient_name": inv.recipient_name,
                "recipient_email": inv.recipient_email,
                "currency": inv.currency,
                "total": inv.total,
                "status": inv.status,
                "due_date": inv.due_date,
                "invoice_number": inv.paypal_invoice_number,
            }
            for inv in invoices
        ]

        # Build comprehensive real-time database context
        db_context = {
            "current_date": "18 Oct 2026",
            "active_mode": payload.category_mode,
            "total_customers_count": len(customers),
            "total_outstanding_amount": total_outstanding_sum,
            "customers_with_dues": customers_with_dues,
            "all_customers": customers_summary,
            "recent_sales_and_work_orders": sales_summary,
            "rate_card_and_products": catalog_summary,
            "paypal_invoices": invoices_summary,
            "frontend_context": payload.context or {},
        }

        res = await ai_service.chat_copilot(
            message=payload.message,
            category_mode=payload.category_mode,
            context=db_context,
        )

        return ChatMessageResponse(
            reply=res.get("reply", "I am connected to your live database."),
            suggested_actions=res.get("suggested_actions", []),
            action_card=res.get("action_card"),
        )
    except Exception as e:
        return ChatMessageResponse(
            reply=f"Cashiko Copilot is online. How can I assist with your dues or invoices today? (Note: {str(e)})",
            suggested_actions=["Check Overdue Khata Dues", "List Customers", "Refresh Live DB"],
            action_card=None,
        )
