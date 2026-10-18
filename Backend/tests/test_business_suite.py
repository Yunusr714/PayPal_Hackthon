import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import init_db


@pytest.mark.asyncio
async def test_customers_crud():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # List customers
        res = await client.get("/api/v1/customers")
        assert res.status_code == 200
        customers = res.json()
        assert isinstance(customers, list)
        assert len(customers) >= 1

        # Create new customer
        new_cust_payload = {
            "name": "Karan Malhotra",
            "phone": "+91 99887 76655",
            "email": "karan.malhotra@test.com",
            "category": "service",
            "total_purchases": 1500.0,
            "outstanding": 500.0,
            "credit_limit": 4000.0,
            "behaviour": "Good",
            "risk_score": 20,
        }
        res_create = await client.post("/api/v1/customers", json=new_cust_payload)
        assert res_create.status_code == 201
        created = res_create.json()
        assert created["name"] == "Karan Malhotra"
        assert created["outstanding"] == 500.0


@pytest.mark.asyncio
async def test_catalog_and_sales():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # List catalog items
        res_cat = await client.get("/api/v1/catalog")
        assert res_cat.status_code == 200
        items = res_cat.json()
        assert isinstance(items, list)
        assert len(items) >= 1

        # Create new sale
        sale_payload = {
            "customer_name": "Sharma Uncle",
            "customer_phone": "+91 98100 12345",
            "category_type": "shop",
            "item_name": "Fortune Sunflower Oil (2L)",
            "quantity": 2.0,
            "unit_price": 280.0,
            "total_amount": 560.0,
            "payment_mode": "CREDIT",
            "status": "PENDING",
            "date": "17 Oct 2026",
            "due_date": "24 Oct 2026",
            "notes": "Added to weekly khata",
        }
        res_sale = await client.post("/api/v1/sales", json=sale_payload)
        assert res_sale.status_code == 201
        sale = res_sale.json()
        assert sale["total_amount"] == 560.0
        assert sale["payment_mode"] == "CREDIT"


@pytest.mark.asyncio
async def test_chat_copilot():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        chat_payload = {
            "message": "Which customer has the highest outstanding khata dues?",
            "category_mode": "service",
            "context": {"total_outstanding": 14200},
        }
        res = await client.post("/api/v1/chat", json=chat_payload)
        assert res.status_code == 200
        data = res.json()
        assert "reply" in data
        assert isinstance(data.get("suggested_actions", []), list)
