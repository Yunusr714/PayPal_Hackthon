from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.db.session import get_db
from app.db.models.sale import SaleRecord
from app.db.models.customer import Customer
from app.schemas.sale import SaleRecordCreate, SaleRecordRead, SaleRecordUpdate

router = APIRouter()


@router.get("", response_model=List[SaleRecordRead])
async def list_sales(
    category_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(SaleRecord).order_by(desc(SaleRecord.created_at))
    if category_type and category_type.lower() != "all":
        query = query.where(SaleRecord.category_type == category_type.lower())
    if status_filter and status_filter.upper() != "ALL":
        query = query.where(SaleRecord.status == status_filter.upper())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=SaleRecordRead, status_code=status.HTTP_201_CREATED)
async def create_sale(
    payload: SaleRecordCreate,
    db: AsyncSession = Depends(get_db),
):
    total = payload.total_amount if payload.total_amount > 0 else payload.quantity * payload.unit_price

    sale = SaleRecord(
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        category_type=payload.category_type.lower(),
        item_name=payload.item_name,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        total_amount=total,
        payment_mode=payload.payment_mode.upper(),
        status=payload.status.upper(),
        due_date=payload.due_date,
        date=payload.date,
        notes=payload.notes,
        paypal_invoice_id=payload.paypal_invoice_id,
    )
    db.add(sale)

    # Look up or auto-create customer record
    clean_cust_name = payload.customer_name.strip()
    is_walkin = clean_cust_name.lower() in ["counter sale", "client walk-in", "walk-in", "walkin customer"]
    
    if not is_walkin and clean_cust_name:
        res = await db.execute(select(Customer).where(func.lower(Customer.name) == clean_cust_name.lower()))
        cust = res.scalar_one_or_none()
        is_credit = payload.payment_mode.upper() == "CREDIT" or payload.status.upper() in ["PENDING", "OVERDUE", "SCHEDULED", "IN_PROGRESS"]
        
        if not cust:
            cust = Customer(
                name=clean_cust_name,
                phone=payload.customer_phone or "+91 98100 00000",
                category=payload.category_type.lower(),
                total_purchases=total,
                outstanding=total if is_credit else 0.0,
                credit_limit=5000.0,
                behaviour="Good",
                risk_score=25,
                last_visit="Today",
            )
            db.add(cust)
        else:
            cust.total_purchases += total
            if is_credit:
                cust.outstanding += total
            cust.last_visit = "Today"

    await db.commit()
    await db.refresh(sale)
    return sale


@router.patch("/{sale_id}", response_model=SaleRecordRead)
async def update_sale(
    sale_id: str,
    payload: SaleRecordUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SaleRecord).where(SaleRecord.id == sale_id))
    sale = result.scalar_one_or_none()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale record not found")

    old_status = sale.status
    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        if key in ["status", "payment_mode"]:
            setattr(sale, key, value.upper())
        else:
            setattr(sale, key, value)

    # Reconcile customer outstanding if status changed to PAID or COMPLETED
    new_status = sale.status
    if old_status in ["PENDING", "OVERDUE", "SCHEDULED", "IN_PROGRESS"] and new_status in ["PAID", "COMPLETED", "DELIVERED"]:
        res = await db.execute(select(Customer).where(func.lower(Customer.name) == sale.customer_name.lower()))
        cust = res.scalar_one_or_none()
        if cust:
            cust.outstanding = max(0.0, cust.outstanding - sale.total_amount)

    await db.commit()
    await db.refresh(sale)
    return sale


@router.delete("/{sale_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sale(
    sale_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SaleRecord).where(SaleRecord.id == sale_id))
    sale = result.scalar_one_or_none()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale record not found")

    # If pending credit sale is deleted, decrement customer outstanding
    if sale.status in ["PENDING", "OVERDUE"] and sale.payment_mode == "CREDIT":
        res = await db.execute(select(Customer).where(Customer.name == sale.customer_name))
        cust = res.scalar_one_or_none()
        if cust:
            cust.outstanding = max(0.0, cust.outstanding - sale.total_amount)

    await db.delete(sale)
    await db.commit()
    return None
