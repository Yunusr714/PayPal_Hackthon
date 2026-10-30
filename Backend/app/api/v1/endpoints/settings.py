import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from app.core.config import settings
from app.db.session import get_db
from app.db.models.merchant import MerchantProfile
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


class MerchantProfileSchema(BaseModel):
    id: Optional[str] = None
    business_name: str
    owner_name: str
    phone: str
    email: Optional[str] = None
    category: Optional[str] = "shop"
    sub_category: Optional[str] = "Fashion & Apparel Retail"
    password: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str
    password: Optional[str] = None


@router.get("/merchant")
async def get_merchant_profile(
    identifier: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if identifier:
        clean = identifier.strip().lower()
        clean_num = "".join(filter(str.isdigit, clean))
        query = select(MerchantProfile).where(
            (func.lower(MerchantProfile.email) == clean) |
            (MerchantProfile.phone == clean) |
            (MerchantProfile.phone.endswith(clean_num) if clean_num else False)
        )
        res = await db.execute(query)
        profile = res.scalar_one_or_none()
        if profile:
            return {
                "id": profile.id,
                "business_name": profile.business_name,
                "owner_name": profile.owner_name,
                "phone": profile.phone,
                "email": profile.email,
                "category": profile.category,
                "sub_category": profile.sub_category,
                "logo_url": profile.logo_url,
                "address": profile.address,
            }

    # If no identifier or not found by identifier, get the most recent merchant
    res = await db.execute(select(MerchantProfile).order_by(desc(MerchantProfile.updated_at)).limit(1))
    profile = res.scalar_one_or_none()
    if profile:
        return {
            "id": profile.id,
            "business_name": profile.business_name,
            "owner_name": profile.owner_name,
            "phone": profile.phone,
            "email": profile.email,
            "category": profile.category,
            "sub_category": profile.sub_category,
            "logo_url": profile.logo_url,
            "address": profile.address,
        }
    return None


@router.get("/merchants")
async def list_all_merchants(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(MerchantProfile).order_by(desc(MerchantProfile.updated_at)))
    profiles = res.scalars().all()
    return [
        {
            "id": p.id,
            "business_name": p.business_name,
            "owner_name": p.owner_name,
            "phone": p.phone,
            "email": p.email,
            "category": p.category,
            "sub_category": p.sub_category,
            "logo_url": p.logo_url,
            "address": p.address,
        }
        for p in profiles
    ]


@router.post("/merchant")
async def update_or_create_merchant_profile(
    payload: MerchantProfileSchema,
    db: AsyncSession = Depends(get_db)
):
    clean_phone = payload.phone.strip() if payload.phone else ""
    clean_email = payload.email.strip().lower() if payload.email else ""

    # Look for existing merchant by id, phone, or email
    conditions = []
    if payload.id:
        conditions.append(MerchantProfile.id == payload.id)
    if clean_phone:
        conditions.append(MerchantProfile.phone == clean_phone)
    if clean_email:
        conditions.append(func.lower(MerchantProfile.email) == clean_email)

    profile = None
    if conditions:
        query = select(MerchantProfile).where(or_(*conditions))
        result = await db.execute(query)
        profile = result.scalar_one_or_none()

    # Fallback: if only one merchant exists in database, update that merchant
    if not profile:
        all_merchants = (await db.execute(select(MerchantProfile))).scalars().all()
        if len(all_merchants) == 1:
            profile = all_merchants[0]

    if not profile:
        profile = MerchantProfile(
            id=payload.id or f"merchant-{uuid.uuid4().hex[:8]}",
            business_name=payload.business_name.strip(),
            owner_name=payload.owner_name.strip(),
            phone=clean_phone,
            email=clean_email,
            category=(payload.category or "shop").lower(),
            sub_category=payload.sub_category or ("Tailoring & Boutique" if (payload.category or "").lower() == "service" else "Fashion & Apparel Retail"),
            password=payload.password,
            logo_url=payload.logo_url or "",
            address=payload.address or "",
        )
        db.add(profile)
    else:
        profile.business_name = payload.business_name.strip()
        profile.owner_name = payload.owner_name.strip()
        if clean_phone:
            profile.phone = clean_phone
        if clean_email:
            profile.email = clean_email
        if payload.category:
            profile.category = payload.category.lower()
        if payload.sub_category:
            profile.sub_category = payload.sub_category
        if payload.password:
            profile.password = payload.password
        profile.logo_url = payload.logo_url or profile.logo_url or ""
        if payload.address is not None:
            profile.address = payload.address

    await db.commit()
    await db.refresh(profile)
    return {
        "status": "success",
        "merchant": {
            "id": profile.id,
            "business_name": profile.business_name,
            "owner_name": profile.owner_name,
            "phone": profile.phone,
            "email": profile.email,
            "category": profile.category,
            "sub_category": profile.sub_category,
            "logo_url": profile.logo_url,
            "address": profile.address,
        }
    }


@router.post("/merchant/login")
async def merchant_login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    ident = payload.identifier.strip().lower()
    clean_num = "".join(filter(str.isdigit, ident))

    query = select(MerchantProfile).where(
        (func.lower(MerchantProfile.email) == ident) |
        (MerchantProfile.phone == ident) |
        (MerchantProfile.phone.endswith(clean_num) if clean_num else False)
    )
    result = await db.execute(query)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Merchant account not found. Please register first.")

    if profile.password and payload.password:
        if profile.password != payload.password.strip():
            raise HTTPException(status_code=401, detail="Invalid password. Please check your credentials.")

    return {
        "status": "success",
        "merchant": {
            "id": profile.id,
            "business_name": profile.business_name,
            "owner_name": profile.owner_name,
            "phone": profile.phone,
            "email": profile.email,
            "category": profile.category,
            "sub_category": profile.sub_category,
            "logo_url": profile.logo_url,
            "address": profile.address,
        }
    }
