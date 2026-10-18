import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import init_db


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "Cashiko" in data["project"]


@pytest.mark.asyncio
async def test_invoice_lifecycle_and_webhooks():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create Invoice Draft locally
        payload = {
            "recipient_name": "Acme Global Corp",
            "recipient_email": "billing@acmeglobal.com",
            "currency": "USD",
            "issue_date": "2026-10-15",
            "due_date": "2026-10-22",
            "memo": "Full-stack development sprint 1 delivery.",
            "raw_work_brief": "Worked 40 hours on React frontend and FastAPI backend integration.",
            "items": [
                {
                    "description": "Sprint 1 Architecture & Engineering",
                    "quantity": 1,
                    "unit_amount": 2400.0,
                    "confidence": 0.95
                }
            ]
        }
        res = await client.post("/api/v1/invoices", json=payload)
        assert res.status_code == 201
        inv = res.json()
        assert inv["status"] == "DRAFT"
        assert inv["total"] == 2400.0
        invoice_id = inv["id"]

        # 2. Gate 1: Push Draft to PayPal Sandbox
        res = await client.post(f"/api/v1/invoices/{invoice_id}/create-paypal-draft")
        assert res.status_code == 200
        inv_draft = res.json()
        assert inv_draft["paypal_invoice_id"] is not None
        paypal_id = inv_draft["paypal_invoice_id"]

        # 3. Gate 2: Explicitly Send Invoice
        res = await client.post(f"/api/v1/invoices/{invoice_id}/send-paypal")
        assert res.status_code == 200
        inv_sent = res.json()
        assert inv_sent["status"] == "SENT"

        # 4. Trigger Webhook Event: INVOICING.INVOICE.PAID
        webhook_payload = {
            "id": f"WH-EVT-TEST-{invoice_id[:8]}",
            "event_type": "INVOICING.INVOICE.PAID",
            "is_fixture": True,
            "resource": {
                "id": paypal_id
            }
        }
        res = await client.post("/api/v1/webhooks/paypal", json=webhook_payload)
        assert res.status_code == 200
        assert res.json()["status"] == "accepted"

        # Verify status is now PAID in database
        res = await client.get(f"/api/v1/invoices/{invoice_id}")
        assert res.status_code == 200
        assert res.json()["status"] == "PAID"

        # 5. Idempotent Deduplication: Send identical webhook event again
        res = await client.post("/api/v1/webhooks/paypal", json=webhook_payload)
        assert res.status_code == 200
        assert res.json()["status"] == "ignored"
        assert res.json()["reason"] == "duplicate_event_id"

        # 6. Safety Gate: Attempting to send a reminder on a PAID invoice must be rejected
        res = await client.post(f"/api/v1/invoices/{invoice_id}/remind-paypal")
        assert res.status_code == 400
        assert "terminal state" in res.json()["detail"].lower()

        # 7. Verify Audit Log
        res = await client.get(f"/api/v1/audit?entity_id={invoice_id}")
        assert res.status_code == 200
        events = res.json()
        assert len(events) >= 3
