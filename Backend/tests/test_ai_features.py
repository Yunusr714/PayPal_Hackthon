import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import init_db


@pytest.mark.asyncio
async def test_ai_work_brief_extraction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        brief = (
            "Hi, please invoice Acme Studios for website design and front-end development. "
            "We agreed on 15 hours of Figma UI/UX design at $90/hr, and 25 hours of React coding at $110/hr. "
            "Client contact is Sarah Jenkins, email sarah@acmestudios.com. Due next Friday."
        )
        res = await client.post("/api/v1/intake/extract", json={"work_brief": brief})
        assert res.status_code == 200
        data = res.json()
        assert "recipient_name" in data
        assert "Acme" in data["recipient_name"] or "Sarah" in data["recipient_name"]
        assert "acmestudios.com" in data["recipient_email"]
        assert len(data["items"]) >= 2
        assert data["currency"] == "USD"


@pytest.mark.asyncio
async def test_ai_reply_triage_and_drafting():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create an invoice
        payload = {
            "recipient_name": "Nexus Tech Corp",
            "recipient_email": "finance@nexustech.com",
            "currency": "USD",
            "issue_date": "2026-10-10",
            "due_date": "2026-10-17",
            "items": [
                {"description": "Backend API development", "quantity": 1, "unit_amount": 1500.0}
            ]
        }
        res = await client.post("/api/v1/invoices", json=payload)
        assert res.status_code == 201
        inv_id = res.json()["id"]

        # Client reply with promise to pay
        client_msg = "Hey! Thanks for following up. We reviewed the invoice and our accounts team will process the $1500 payment on 24 October."
        res = await client.post("/api/v1/triage/classify", json={
            "invoice_id": inv_id,
            "customer_reply": client_msg
        })
        assert res.status_code == 200
        triage = res.json()["classification"]
        assert triage["intent"] in ["PROMISE_TO_PAY", "REQUEST_EXTENSION"]
        assert triage["explicit_promised_date"] is not None

        # Draft grounded response
        res = await client.post("/api/v1/triage/draft", json={
            "invoice_id": inv_id,
            "customer_reply": client_msg,
            "intent": triage["intent"]
        })
        assert res.status_code == 200
        draft = res.json()
        assert "subject" in draft
        assert "draft_message" in draft
        assert len(draft["draft_message"]) > 20
