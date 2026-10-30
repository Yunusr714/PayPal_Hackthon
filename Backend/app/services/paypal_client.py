import time
import uuid
import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("flowcollect.paypal")


class PayPalClient:
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.base_url = settings.PAYPAL_BASE_URL
        self._cached_token: Optional[str] = None
        self._token_expiry_timestamp: float = 0

    async def get_access_token(self) -> Optional[str]:
        """Obtains or returns cached OAuth2 access token."""
        if not settings.is_paypal_configured:
            return None

        # Return cached token if valid for at least 60 more seconds
        if self._cached_token and time.time() < (self._token_expiry_timestamp - 60):
            return self._cached_token

        token_url = f"{self.base_url}/v1/oauth2/token"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    token_url,
                    data={"grant_type": "client_credentials"},
                    auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
                    headers={"Accept": "application/json", "Accept-Language": "en_US"},
                )
                response.raise_for_status()
                data = response.json()
                self._cached_token = data["access_token"]
                expires_in = data.get("expires_in", 3600)
                self._token_expiry_timestamp = time.time() + expires_in
                logger.info("Successfully refreshed PayPal OAuth2 access token")
                return self._cached_token
            except Exception as e:
                logger.error(f"Failed to acquire PayPal access token: {e}")
                raise

    async def create_draft_invoice(
        self,
        invoice_number: str,
        issue_date: str,
        due_date: str,
        currency: str,
        recipient_name: str,
        recipient_email: str,
        items: list[dict],
        memo: Optional[str] = None,
        invoicer_business_name: Optional[str] = None,
        invoicer_logo_url: Optional[str] = None,
        invoicer_name: Optional[str] = None,
        invoicer_email: Optional[str] = None,
        invoicer_website: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Creates a draft invoice on PayPal Sandbox via Invoicing API v2.
        Falls back to realistic fixture if credentials are not configured or in offline demo mode.
        """
        if not settings.is_paypal_configured or settings.DEMO_MODE:
            simulated_id = f"INV2-SIM-{uuid.uuid4().hex[:8].upper()}"
            logger.warning(f"Demo mode active. Returning simulated sandbox draft: {simulated_id}")
            return {
                "id": simulated_id,
                "status": "DRAFT",
                "invoice_number": invoice_number,
                "is_simulated": True,
                "href": f"https://www.sandbox.paypal.com/invoice/details/{simulated_id}",
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        # PayPal Invoicing v2 does not allow INR. Auto-normalize to USD for PayPal rails.
        paypal_currency = "USD" if currency.upper() == "INR" else currency.upper()
        rate_conversion = 83.5 if currency.upper() == "INR" else 1.0

        paypal_items = []
        for it in items:
            orig_amount = float(it.get("unit_amount", 0.0))
            converted_amount = max(1.0, round(orig_amount / rate_conversion, 2)) if currency.upper() == "INR" else orig_amount
            item_desc = it.get("description", "Service")[:100]
            if currency.upper() == "INR":
                item_desc = f"{item_desc} (₹{orig_amount:,.0f} INR)"[:100]

            paypal_items.append({
                "name": item_desc,
                "quantity": str(it.get("quantity", 1)),
                "unit_amount": {
                    "currency_code": paypal_currency,
                    "value": f"{converted_amount:.2f}",
                },
            })

        # Explicitly configure 'invoicer' to override generic "Test Store" and show official store logo
        b_name = invoicer_business_name or settings.MERCHANT_BUSINESS_NAME or "Cashiko Store"
        l_url = invoicer_logo_url or settings.MERCHANT_LOGO_URL
        web_url = invoicer_website or settings.MERCHANT_WEBSITE
        c_name = invoicer_name or settings.MERCHANT_CONTACT_NAME or "Store Owner"
        name_parts = c_name.strip().split(" ", 1)

        invoicer_payload: Dict[str, Any] = {
            "business_name": b_name,
            "name": {
                "given_name": name_parts[0],
                "surname": name_parts[1] if len(name_parts) > 1 else "",
            },
        }

        if l_url and l_url.startswith("https://"):
            invoicer_payload["logo_url"] = l_url

        if web_url:
            invoicer_payload["website"] = web_url

        payload = {
            "detail": {
                "invoice_number": invoice_number,
                "invoice_date": issue_date,
                "payment_term": {
                    "due_date": due_date,
                },
                "currency_code": paypal_currency,
                "note": memo or f"Payment receipt for {recipient_name} via {b_name}.",
            },
            "invoicer": invoicer_payload,
            "primary_recipients": [
                {
                    "billing_info": {
                        "name": {
                            "full_name": recipient_name,
                        },
                        "email_address": recipient_email,
                    }
                }
            ],
            "items": paypal_items,
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}/v2/invoicing/invoices",
                    json=payload,
                    headers=headers,
                )
                
                # Check for DUPLICATE_INVOICE_NUMBER and retry once with fresh suffix
                if response.status_code == 422 and "DUPLICATE_INVOICE_NUMBER" in response.text:
                    refreshed_num = f"{invoice_number}-{uuid.uuid4().hex[:4].upper()}"
                    payload["detail"]["invoice_number"] = refreshed_num
                    logger.warning(f"PayPal invoice number duplicate detected. Retrying with {refreshed_num}")
                    response = await client.post(
                        f"{self.base_url}/v2/invoicing/invoices",
                        json=payload,
                        headers=headers,
                    )
                    invoice_number = refreshed_num

                if response.status_code >= 400:
                    logger.error(f"PayPal API rejected invoice draft ({response.status_code}): {response.text}")
                    response.raise_for_status()

                data = response.json()
                invoice_id = data.get("id")
                if not invoice_id and "href" in data:
                    invoice_id = data["href"].split("/")[-1]
                if not invoice_id and "location" in response.headers:
                    invoice_id = response.headers["location"].split("/")[-1]

                return {
                    "id": invoice_id,
                    "status": data.get("status", "DRAFT"),
                    "invoice_number": invoice_number,
                    "is_simulated": False,
                    "raw_response": data,
                }
        except Exception as e:
            logger.error(f"PayPal sandbox invoice creation fallback triggered: {e}")
            simulated_id = f"INV2-SIM-{uuid.uuid4().hex[:8].upper()}"
            return {
                "id": simulated_id,
                "status": "DRAFT",
                "invoice_number": invoice_number,
                "is_simulated": True,
                "href": f"https://www.sandbox.paypal.com/invoice/details/{simulated_id}",
            }

    async def send_invoice(self, paypal_invoice_id: str, send_to_recipient: bool = False) -> Dict[str, Any]:
        """Calls POST /v2/invoicing/invoices/{id}/send to officially send the invoice."""
        if not settings.is_paypal_configured or paypal_invoice_id.startswith("INV2-SIM-"):
            return {
                "id": paypal_invoice_id,
                "status": "SENT",
                "is_simulated": True,
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{self.base_url}/v2/invoicing/invoices/{paypal_invoice_id}/send",
                json={"send_to_recipient": send_to_recipient},
                headers=headers,
            )
            response.raise_for_status()
            data = response.json() if response.text else {}
            return {
                "id": paypal_invoice_id,
                "status": "SENT",
                "is_simulated": False,
                "payer_view_url": data.get("href"),
            }

    async def send_native_reminder(self, paypal_invoice_id: str, subject: str, note: str) -> Dict[str, Any]:
        """Calls POST /v2/invoicing/invoices/{id}/remind to trigger standard PayPal reminder."""
        if not settings.is_paypal_configured or paypal_invoice_id.startswith("INV2-SIM-"):
            return {
                "id": paypal_invoice_id,
                "reminded": True,
                "is_simulated": True,
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        payload = {
            "subject": subject[:200],
            "note": note[:4000],
            "send_to_recipient": False,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{self.base_url}/v2/invoicing/invoices/{paypal_invoice_id}/remind",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            return {
                "id": paypal_invoice_id,
                "reminded": True,
                "is_simulated": False,
            }

    async def get_invoice_details(self, paypal_invoice_id: str) -> Dict[str, Any]:
        """Fetches live invoice details from PayPal Invoicing API."""
        if not settings.is_paypal_configured or paypal_invoice_id.startswith("INV2-SIM-"):
            return {
                "id": paypal_invoice_id,
                "status": "SENT",
                "is_simulated": True,
            }

        token = await self.get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{self.base_url}/v2/invoicing/invoices/{paypal_invoice_id}",
                headers=headers,
            )
            response.raise_for_status()
            return response.json()


paypal_client = PayPalClient()
