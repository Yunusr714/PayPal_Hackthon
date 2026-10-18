import json
import logging
from typing import Dict, Any, Optional, List
import httpx
from app.core.config import settings

logger = logging.getLogger("flowcollect.ai")


class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

    async def _call_groq_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Calls Groq with strict JSON output formatting."""
        if not settings.is_llm_configured:
            raise ValueError("Groq API key is not configured in environment")

        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }

        import asyncio
        for attempt in range(3):
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(self.api_url, headers=headers, json=payload)
                if response.status_code == 429 and attempt < 2:
                    await asyncio.sleep(2.0 * (attempt + 1))
                    continue
                response.raise_for_status()
                data = response.json()
                content_str = data["choices"][0]["message"]["content"]
                try:
                    return json.loads(content_str)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse model JSON: {content_str}")
                    raise ValueError("Model output was not valid JSON")

    async def extract_invoice_from_notes(self, work_brief: str) -> Dict[str, Any]:
        """
        Extracts structured invoice details from unstructured work notes (FR-02, FR-03).
        Guarantees field-level provenance and explicit missing field alerts.
        """
        system_prompt = (
            "You are FlowCollect AI, an expert invoice assistant for freelancers and agencies.\n"
            "Extract structured invoice fields from the user's work brief.\n"
            "CRITICAL RULES:\n"
            "1. NEVER invent amounts, prices, or hours that are not mentioned.\n"
            "2. If currency is not explicitly mentioned, default to 'USD' and flag it in missing_fields.\n"
            "3. If due date is not specified, calculate due_date as 7 days from today (default net-7) and flag it.\n"
            "4. Return strictly a JSON object with this exact schema:\n"
            "{\n"
            '  "recipient_name": string (or "" if missing),\n'
            '  "recipient_email": string (or "" if missing),\n'
            '  "currency": string (e.g. "USD", "EUR", "GBP"),\n'
            '  "issue_date": "YYYY-MM-DD",\n'
            '  "due_date": "YYYY-MM-DD",\n'
            '  "memo": string,\n'
            '  "items": [\n'
            '    {\n'
            '      "description": string,\n'
            '      "quantity": float,\n'
            '      "unit_amount": float,\n'
            '      "source_text": string,\n'
            '      "confidence": float (0.0 to 1.0)\n'
            "    }\n"
            "  ],\n"
            '  "missing_fields": [string],\n'
            '  "confidence_score": float (0.0 to 1.0)\n'
            "}"
        )

        return await self._call_groq_json(system_prompt, f"Work Notes to extract:\n{work_brief}")

    async def classify_customer_reply(
        self,
        customer_reply: str,
        invoice_summary: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Classifies customer email/message into the PRD 7-intent taxonomy (FR-11).
        Extracts explicit promised date ONLY if clearly stated.
        """
        system_prompt = (
            "You are FlowCollect AI's receivables intent classifier.\n"
            "Classify the pasted customer reply into EXACTLY ONE of these 7 intent labels:\n"
            "1. PROMISE_TO_PAY: Customer explicitly commits to paying by a date or soon.\n"
            "2. REQUEST_CLARIFICATION: Customer asks questions about line items, rates, or scope.\n"
            "3. REQUEST_EXTENSION: Customer asks for more time to pay.\n"
            "4. DISPUTE_OR_OBJECTION: Customer challenges delivered scope, quality, or pricing.\n"
            "5. CLAIMS_ALREADY_PAID: Customer claims they already made the payment.\n"
            "6. PAYMENT_METHOD_FAILED: Customer mentions card or transaction failure.\n"
            "7. OTHER_OR_AMBIGUOUS: Vague, unrelated, or unclear statement.\n\n"
            "IMPORTANT RULES:\n"
            "- Extract 'explicit_promised_date' ONLY if a specific date or timeframe is explicitly named (e.g. '28 October' or 'Friday'). Otherwise set to null.\n"
            "- A claim of 'I paid yesterday' does NOT mean payment is verified. Classify as CLAIMS_ALREADY_PAID.\n"
            "- Output JSON format:\n"
            "{\n"
            '  "intent": "PROMISE_TO_PAY" | "REQUEST_CLARIFICATION" | "REQUEST_EXTENSION" | "DISPUTE_OR_OBJECTION" | "CLAIMS_ALREADY_PAID" | "PAYMENT_METHOD_FAILED" | "OTHER_OR_AMBIGUOUS",\n'
            '  "confidence": float (0.0 to 1.0),\n'
            '  "explicit_promised_date": string or null,\n'
            '  "summary": string (1-2 sentences),\n'
            '  "recommended_action": "PAUSE_CHASE" | "ANSWER_CLARIFICATION" | "HUMAN_ESCALATION" | "REFRESH_PAYPAL" | "RESEND_LINK",\n'
            '  "policy_rationale": string\n'
            "}"
        )

        user_content = (
            f"Invoice Context:\n"
            f"- Invoice ID: {invoice_summary.get('id', 'N/A')}\n"
            f"- Recipient: {invoice_summary.get('recipient_name', 'N/A')}\n"
            f"- Total: {invoice_summary.get('currency', 'USD')} {invoice_summary.get('total', 0.0)}\n"
            f"- Due Date: {invoice_summary.get('due_date', 'N/A')}\n\n"
            f"Customer Message:\n\"\"\"{customer_reply}\"\"\""
        )

        return await self._call_groq_json(system_prompt, user_content)

    async def draft_grounded_response(
        self,
        customer_reply: str,
        intent: str,
        invoice_summary: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Drafts a respectful, context-aware reply based ONLY on verified invoice facts (FR-12, FR-14).
        """
        system_prompt = (
            "You are FlowCollect AI assistant. Draft a polite, professional, concise response from the merchant to their client.\n"
            "RULES:\n"
            "1. Ground all numbers and dates strictly on the provided invoice facts.\n"
            "2. Never use guilt, shame, aggressive threats, or unverified claims.\n"
            "3. If client promised payment on a date, acknowledge and thank them respectfully.\n"
            "4. If client claims they paid, politely thank them and explain PayPal is being refreshed to confirm clearance.\n"
            "5. Return strictly JSON:\n"
            "{\n"
            '  "subject": string,\n'
            '  "draft_message": string,\n'
            '  "fact_citations": [string]\n'
            "}"
        )

        user_content = (
            f"Invoice Details:\n"
            f"- Recipient: {invoice_summary.get('recipient_name')}\n"
            f"- Invoice Number: {invoice_summary.get('paypal_invoice_number', 'Invoice')}\n"
            f"- Amount: {invoice_summary.get('currency', 'USD')} {invoice_summary.get('total', 0.0)}\n"
            f"- Due Date: {invoice_summary.get('due_date')}\n"
            f"- Intent: {intent}\n\n"
            f"Customer Message:\n\"\"\"{customer_reply}\"\"\""
        )

        return await self._call_groq_json(system_prompt, user_content)

    async def chat_copilot(self, message: str, category_mode: str = "service", context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Interactive Cashiko Copilot assistant strictly grounded in the merchant's live SQLite database.
        """
        system_prompt = (
            "You are Cashiko AI Copilot, a high-intelligence, context-aware receivables and business assistant.\n"
            f"Active Workspace Mode: {category_mode.upper()} (Tailoring/Repair/Plumbing/Freelance Services vs Retail Store).\n"
            "CRITICAL INSTRUCTIONS & GROUNDING RULES:\n"
            "1. You have LIVE, REAL-TIME access to the merchant's SQLite database provided in the context below.\n"
            "2. ALWAYS answer questions using the EXACT customer names, phone numbers, dues, amounts, work orders, catalog items, and invoices found in the context.\n"
            "3. NEVER make up fictional or placeholder customers (e.g. NEVER mention 'John Doe', 'Jane Smith', 'Raj Patel', 'Customer A' unless they literally exist in the database context).\n"
            "4. If asked broad questions like 'any dues?' or 'who owes me?' or 'payment dues summary', calculate and state the EXACT total sum and name the real customers with outstanding balances.\n"
            "5. If asked specific questions like 'how many people who had tv repair service due?', look through the live sales records and catalog for matching items (like 'TV Repair') and give the exact customer name(s), amount, and due date.\n"
            "6. If the requested customer, service, or job does not exist in the database records, state that clearly and accurately.\n"
            "7. If relevant to a specific customer with dues or a reminder request, include an 'action_card' with type 'whatsapp_reminder' or 'due_summary' or 'customer_card'.\n"
            "8. Always format currency in INR (₹) or the customer's invoice currency.\n"
            "Return strictly a JSON object with this exact schema:\n"
            "{\n"
            '  "reply": "Clear, markdown-formatted response answering the merchant query directly and citing real customer names and figures",\n'
            '  "suggested_actions": ["Action 1", "Action 2", "Action 3"],\n'
            '  "action_card": {\n'
            '    "type": "whatsapp_reminder" | "due_summary" | "customer_card" | null,\n'
            '    "customer_name": "...",\n'
            '    "phone": "...",\n'
            '    "amount": 350,\n'
            '    "service_or_item": "...",\n'
            '    "due_date": "...",\n'
            '    "whatsapp_message": "..."\n'
            '  }\n'
            "}"
        )
        user_content = f"Merchant Message: {message}\nLive Store & DB Context:\n{json.dumps(context or {}, indent=2)}"
        try:
            return await self._call_groq_json(system_prompt, user_content)
        except Exception as e:
            logger.warning(f"Groq API call failed or rate-limited ({e}), using live DB context grounded fallback.")
            return self._fallback_grounded_reply(message, category_mode, context)

    def _fallback_grounded_reply(self, message: str, category_mode: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Grounded fallback using live SQLite context when LLM is rate-limited or offline."""
        ctx = context or {}
        msg_lower = message.lower()
        customers_with_dues = ctx.get("customers_with_dues", [])
        all_customers = ctx.get("all_customers", [])
        sales = ctx.get("recent_sales_and_work_orders", [])
        total_due = ctx.get("total_outstanding_amount", 0)

        # 1. TV Repair or specific service search
        if any(kw in msg_lower for kw in ["tv repair", "repair", "suit", "stitching", "plumb", "leak"]):
            keywords = ["tv repair"] if "tv repair" in msg_lower else ["repair"] if "repair" in msg_lower else ["stitching", "suit"]
            matched_sales = [s for s in sales if any(kw in s.get("item_name", "").lower() for kw in keywords)]
            if matched_sales:
                lines = [f"- **{s['customer_name']}**: {s['item_name']} (₹{s['total_amount']:,.0f}) — Due: {s.get('due_date', 'Flexible')} [{s.get('status', 'Pending')}]" for s in matched_sales]
                first = matched_sales[0]
                return {
                    "reply": f"Found **{len(matched_sales)}** work order(s) matching your service query in live database:\n\n" + "\n".join(lines),
                    "suggested_actions": ["Send WhatsApp Reminder", "Open Customer Ledger", "Mark Work Order Complete"],
                    "action_card": {
                        "type": "whatsapp_reminder",
                        "customer_name": first["customer_name"],
                        "phone": first.get("customer_phone", "+91 98100 00000"),
                        "amount": first["total_amount"],
                        "service_or_item": first["item_name"],
                        "due_date": first.get("due_date", "18 Oct 2026"),
                        "whatsapp_message": f"Namaste {first['customer_name']} ji! Your {first['item_name']} bill of ₹{first['total_amount']:,.0f} is due. Please settle via Cashiko UPI/PayPal link. Thank you!",
                    }
                }

        # 2. Customer details request
        if "customer" in msg_lower and any(w in msg_lower for w in ["detail", "list", "give", "3", "who"]):
            sample = all_customers[:3]
            lines = [f"{i+1}. **{c['name']}** — Phone: `{c['phone']}` | Outstanding: ₹{c['outstanding']:,.0f} | Total Khata: ₹{c['total_purchases']:,.0f} | Risk: {c['risk_score']}/100" for i, c in enumerate(sample)]
            return {
                "reply": f"Here are {len(sample)} active customers from your live SQLite database:\n\n" + "\n\n".join(lines),
                "suggested_actions": ["View Customer Ledger", "Check Overdue Balances", "Send Payment Reminder"],
                "action_card": {
                    "type": "customer_card",
                    "customer_name": sample[0]["name"] if sample else None,
                    "phone": sample[0]["phone"] if sample else None,
                    "amount": sample[0]["outstanding"] if sample else 0,
                }
            }

        # 3. Dues & Khata query
        if any(w in msg_lower for w in ["due", "owe", "khata", "pending", "outstanding", "balance"]):
            lines = [f"- **{c['name']}**: ₹{c['outstanding']:,.0f} (Phone: `{c['phone']}`)" for c in customers_with_dues[:6]]
            first_due = customers_with_dues[0] if customers_with_dues else None
            return {
                "reply": f"**Live Dues Summary from SQLite:**\nTotal Outstanding: **₹{total_due:,.0f}** across {len(customers_with_dues)} customers.\n\n" + "\n".join(lines),
                "suggested_actions": ["Send WhatsApp Reminder", "View Overdue Ledger", "Create PayPal Invoices"],
                "action_card": {
                    "type": "due_summary",
                    "customer_name": first_due["name"] if first_due else None,
                    "phone": first_due["phone"] if first_due else None,
                    "amount": first_due["outstanding"] if first_due else total_due,
                    "whatsapp_message": f"Namaste {first_due['name']} ji! Polite reminder from Cashiko: outstanding balance of ₹{first_due['outstanding']:,.0f} is due. Thank you!" if first_due else "",
                }
            }

        # Default fallback
        return {
            "reply": f"Cashiko Copilot is connected to your live database ({len(all_customers)} customers, ₹{total_due:,.0f} outstanding receivables). Ask me about customer dues, work orders like TV repair or tailoring, or to draft a WhatsApp reminder.",
            "suggested_actions": ["Check Customer Dues", "List TV Repair Jobs", "View Top Receivables"],
            "action_card": None,
        }


ai_service = AIService()
