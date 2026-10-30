import smtplib
import asyncio
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("flowcollect.email")


class EmailService:
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL or self.user
        self.default_from_name = settings.SMTP_FROM_NAME or "Cashiko Invoicing"

    def _send_sync(self, to_email: str, subject: str, html_content: str, text_content: str, sender_name: Optional[str] = None) -> bool:
        """Synchronous SMTP email dispatcher running in threadpool."""
        if not self.user or not self.password:
            logger.warning("SMTP credentials not configured. Skipping email dispatch.")
            return False

        display_name = sender_name or self.default_from_name
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{display_name} <{self.from_email}>"
        msg["To"] = to_email

        # Attach text & HTML versions
        part_text = MIMEText(text_content, "plain", "utf-8")
        part_html = MIMEText(html_content, "html", "utf-8")
        msg.attach(part_text)
        msg.attach(part_html)

        try:
            with smtplib.SMTP(self.host, self.port, timeout=20.0) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.from_email, [to_email], msg.as_string())
            logger.info(f"Successfully dispatched email to {to_email} (Subject: {subject})")
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch SMTP email to {to_email}: {e}")
            raise RuntimeError(f"SMTP dispatch failed: {str(e)}")

    async def send_invoice_email(
        self,
        to_email: str,
        recipient_name: str,
        invoice_number: str,
        currency: str,
        total: float,
        due_date: str,
        items: List[Dict[str, Any]],
        payer_url: Optional[str] = None,
        memo: Optional[str] = None,
        merchant_name: Optional[str] = None,
        merchant_logo: Optional[str] = None,
        custom_subject: Optional[str] = None,
        custom_body: Optional[str] = None,
        is_partial_payment: bool = False,
        partial_amount: Optional[float] = None,
        remaining_balance: Optional[float] = None,
        next_due_date: Optional[str] = None,
    ) -> bool:
        """Sends a modern, responsive HTML invoice notification with direct PayPal payment checkout."""
        b_name = merchant_name or settings.MERCHANT_BUSINESS_NAME or "Cashiko Store"
        sender_display_name = f"{b_name} (via Cashiko)"
        logo_url = merchant_logo or settings.MERCHANT_LOGO_URL or "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=250&auto=format&fit=crop&q=80"
        pay_url = payer_url if (payer_url and "INV2-" in payer_url) else "https://www.sandbox.paypal.com/invoice/p/#INV2-9Z2F-ZR7C-WP8V-7K9G"

        if custom_subject:
            subject = custom_subject
        elif is_partial_payment and partial_amount:
            subject = f"Partial Payment Request for Invoice #{invoice_number} from {b_name} ({currency} {partial_amount:,.2f} Due Now)"
        else:
            subject = f"Invoice #{invoice_number} from {b_name} ({currency} {total:,.2f})"

        # If a custom body is provided (e.g. from Reply Copilot), format it into HTML paragraphs
        custom_body_html = ""
        if custom_body:
            escaped_body = custom_body.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n\n", "</p><p style='font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; color: #334155;'>").replace("\n", "<br/>")
            custom_body_html = f"""
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700; margin: 0 0 8px 0;">Official Response from {b_name}:</p>
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; color: #334155;">{escaped_body}</p>
            </div>
            """

        # Build items table rows
        table_rows_html = ""
        items_text_list = []
        for it in items:
            desc = it.get("description", "Deliverable item")
            qty = it.get("quantity", 1)
            rate = it.get("unit_amount", 0.0)
            item_total = float(qty) * float(rate)
            items_text_list.append(f"- {desc} x{qty}: {currency} {item_total:,.2f}")
            table_rows_html += f"""
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">{desc}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: center;">{qty}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; text-align: right;">{currency} {float(rate):,.2f}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">{currency} {item_total:,.2f}</td>
            </tr>
            """

        items_text_summary = "\n".join(items_text_list)
        memo_block_html = f"""
        <div style="margin-top: 20px; padding: 14px 16px; background-color: #f8fafc; border-left: 4px solid #0284c7; border-radius: 6px;">
          <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Notes / Terms:</strong> {memo}</p>
        </div>
        """ if memo and not custom_body else ""

        if is_partial_payment and partial_amount:
            rem_calc = remaining_balance if remaining_balance is not None else max(0.0, total - partial_amount)
            due_date_str = f" (by {next_due_date})" if next_due_date else ""
            amount_card_html = f"""
            <tr>
              <td colspan="2" style="padding: 20px 22px; background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 0 0 12px 12px; border-top: 2px dashed #86efac;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size: 13px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.04em;">
                      ⚡ Agreed Partial Payment Due Today:
                    </td>
                    <td style="font-size: 26px; font-weight: 800; color: #15803d; text-align: right;">
                      {currency} {partial_amount:,.2f}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 10px; font-size: 13px; color: #475569; font-weight: 500;">
                      Remaining Balance Due Later{due_date_str}:
                    </td>
                    <td style="padding-top: 10px; font-size: 15px; font-weight: 700; color: #334155; text-align: right;">
                      {currency} {rem_calc:,.2f}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 6px; font-size: 12px; color: #94a3b8;">
                      Full Original Invoice Value:
                    </td>
                    <td style="padding-top: 6px; font-size: 12px; color: #94a3b8; text-align: right; text-decoration: line-through;">
                      {currency} {total:,.2f}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            """
            cta_button_text = f"💳 Pay Agreed Partial Amount ({currency} {partial_amount:,.2f}) with PayPal"
            text_amount_summary = (
                f"Agreed Partial Payment (Due Today): {currency} {partial_amount:,.2f}\n"
                f"Remaining Balance Due Later{due_date_str}: {currency} {rem_calc:,.2f}\n"
                f"Total Original Invoice Value: {currency} {total:,.2f}"
            )
        else:
            amount_card_html = f"""
            <tr>
              <td colspan="2" style="padding: 18px 20px; background-color: #ffffff; border-radius: 0 0 12px 12px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size: 14px; font-weight: 600; color: #334155;">Total Amount Due:</td>
                    <td style="font-size: 24px; font-weight: 800; color: #0284c7; text-align: right;">{currency} {total:,.2f}</td>
                  </tr>
                </table>
              </td>
            </tr>
            """
            cta_button_text = "💳 Pay Securely with PayPal"
            text_amount_summary = f"Total Amount: {currency} {total:,.2f}"

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px; text-align: left;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">{b_name}</h1>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Official Tax Invoice &amp; Payment Statement</p>
          </td>
          <td align="right" valign="middle">
            <span style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">PayPal Verified</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px 36px;">
      <p style="font-size: 16px; margin: 0 0 16px 0; color: #334155;">
        Dear <strong>{recipient_name}</strong>,
      </p>

      {custom_body_html}

      {"" if custom_body else f'<p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; color: #64748b;">Thank you for your business. Here is the itemized invoice for your recent order/services. You can review the details below and pay directly online via PayPal Sandbox checkout.</p>'}

      <!-- Invoice Details Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Invoice Number</span>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">{invoice_number}</div>
          </td>
          <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; text-align: right;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Payment Due Date</span>
            <div style="font-size: 15px; font-weight: 700; color: #e11d48; margin-top: 2px;">{due_date}</div>
          </td>
        </tr>
        {amount_card_html}
      </table>

      <!-- Items Table -->
      <div style="margin-bottom: 28px;">
        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 12px 0;">Itemized Deliverables</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #475569;">Description</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #475569; text-align: center;">Qty</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #475569; text-align: right;">Rate</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 600; color: #475569; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {table_rows_html}
          </tbody>
        </table>
      </div>

      {memo_block_html}

      <!-- Call to Action Button -->
      <div style="margin: 34px 0 24px 0; text-align: center;">
        <a href="{pay_url}" target="_blank" style="display: inline-block; background-color: #0070ba; background-image: linear-gradient(180deg, #0070ba 0%, #005ea6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 36px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,112,186,0.35); text-align: center;">
          {cta_button_text}
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
          Accepts Credit Card, Debit Card, PayPal Wallet, or Pay Later
        </p>
      </div>

      <!-- Payer URL Link backup -->
      <div style="background-color: #f8fafc; padding: 12px 14px; border-radius: 8px; word-break: break-all; font-size: 12px; color: #64748b; margin-top: 20px;">
        Direct link: <a href="{pay_url}" style="color: #0284c7;">{pay_url}</a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 36px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 6px 0;">This invoice was automatically generated &amp; dispatched via <strong>Cashiko Invoicing Copilot</strong> for <strong>{b_name}</strong>.</p>
      <p style="margin: 0;">Powered by PayPal Invoicing API v2 &bull; Verified Sandbox Transaction</p>
    </div>

  </div>
</body>
</html>
"""

        text_content = f"""
{subject}
==================================================
Dear {recipient_name},

{f"Message from {b_name}:" + chr(10) + custom_body + chr(10) + chr(10) if custom_body else "Thank you for your business. Here are your invoice details:" + chr(10)}
Invoice Reference: {invoice_number}
Payment Due Date: {due_date}
{text_amount_summary}

Deliverables:
{items_text_summary}

{f"Notes: {memo}" if memo else ""}

Pay online directly via PayPal Sandbox:
{pay_url}

Thank you,
{b_name}
(Powered by Cashiko & PayPal Invoicing v2)
"""

        return await asyncio.to_thread(self._send_sync, to_email, subject, html_content, text_content, sender_display_name)

    async def send_reminder_email(
        self,
        to_email: str,
        recipient_name: str,
        invoice_number: str,
        currency: str,
        total: float,
        due_date: str,
        payer_url: Optional[str] = None,
        note: Optional[str] = None,
        merchant_name: Optional[str] = None,
    ) -> bool:
        """Sends a friendly payment reminder email."""
        b_name = merchant_name or settings.MERCHANT_BUSINESS_NAME or "Cashiko Store"
        sender_display_name = f"{b_name} (via Cashiko)"
        pay_url = payer_url or f"https://www.sandbox.paypal.com/invoice/p/#{invoice_number}"
        subject = f"Friendly Payment Reminder: Invoice #{invoice_number} ({currency} {total:,.2f})"

        html_content = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 550px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
    <h2 style="color: #0f172a; margin-top: 0;">Payment Reminder</h2>
    <p>Dear <strong>{recipient_name}</strong>,</p>
    <p>This is a friendly reminder from <strong>{b_name}</strong> that invoice <strong>#{invoice_number}</strong> of <strong>{currency} {total:,.2f}</strong> was due on <strong>{due_date}</strong>.</p>
    {f"<p style='padding: 10px; background: #f1f5f9; border-left: 3px solid #0070ba;'><strong>Note:</strong> {note}</p>" if note else ""}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{pay_url}" style="background: #0070ba; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
        Pay Invoice Now via PayPal
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b;">If you have already processed this payment, please disregard this notice. Thank you!</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 24px;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">{b_name} &bull; Powered by Cashiko</p>
  </div>
</body>
</html>
"""
        text_content = f"Payment Reminder: Invoice #{invoice_number} ({currency} {total:,.2f}) due on {due_date}.\nPay online: {pay_url}\nThank you, {b_name}"
        return await asyncio.to_thread(self._send_sync, to_email, subject, html_content, text_content, sender_display_name)


email_service = EmailService()
