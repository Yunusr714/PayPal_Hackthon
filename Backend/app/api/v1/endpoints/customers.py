from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.db.session import get_db
from app.db.models.customer import Customer
from app.db.models.sale import SaleRecord
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate

router = APIRouter()


@router.get("", response_model=List[CustomerRead])
async def list_customers(
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Customer).order_by(desc(Customer.outstanding), Customer.name)
    if category and category.lower() != "all":
        query = query.where(Customer.category.in_([category.lower(), "both"]))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check if a customer with the same phone or case-insensitive name already exists
    clean_name = payload.name.strip()
    clean_phone = payload.phone.strip()
    existing_res = await db.execute(
        select(Customer).where(
            (Customer.phone == clean_phone) | (func.lower(Customer.name) == clean_name.lower())
        )
    )
    existing_cust = existing_res.scalar_one_or_none()
    if existing_cust:
        # Update existing record if new info provided
        if payload.email and not existing_cust.email:
            existing_cust.email = payload.email
        if payload.category and payload.category != existing_cust.category:
            existing_cust.category = "both"
        await db.commit()
        await db.refresh(existing_cust)
        return existing_cust

    customer = Customer(
        name=clean_name,
        phone=clean_phone,
        email=payload.email,
        category=payload.category,
        total_purchases=payload.total_purchases,
        outstanding=payload.outstanding,
        credit_limit=payload.credit_limit,
        behaviour=payload.behaviour,
        risk_score=payload.risk_score,
        last_visit=payload.last_visit,
    )
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerRead)
async def get_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
):
    clean_id = customer_id.strip()
    result = await db.execute(
        select(Customer).where((Customer.id == clean_id) | (func.lower(Customer.name) == clean_id.lower()))
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.patch("/{customer_id}", response_model=CustomerRead)
async def update_customer(
    customer_id: str,
    payload: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
):
    clean_id = customer_id.strip()
    result = await db.execute(
        select(Customer).where((Customer.id == clean_id) | (func.lower(Customer.name) == clean_id.lower()))
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)

    await db.commit()
    await db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
):
    clean_id = customer_id.strip()
    result = await db.execute(
        select(Customer).where((Customer.id == clean_id) | (func.lower(Customer.name) == clean_id.lower()))
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    await db.delete(customer)
    await db.commit()
    return None


@router.get("/{customer_id}/ledger")
async def get_customer_ledger(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
):
    clean_id = customer_id.strip()
    result = await db.execute(
        select(Customer).where((Customer.id == clean_id) | (func.lower(Customer.name) == clean_id.lower()))
    )
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Fetch sales / dues associated with this customer
    sales_res = await db.execute(
        select(SaleRecord)
        .where(func.lower(SaleRecord.customer_name) == customer.name.lower())
        .order_by(desc(SaleRecord.created_at))
    )
    sales = sales_res.scalars().all()

    return {
        "customer": customer,
        "records": sales,
    }
