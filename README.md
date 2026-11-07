# Cashiko: Autonomous PayPal Invoicing & Receivables Copilot

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PayPal](https://img.shields.io/badge/PayPal-Invoicing%20API%20v2-00457C?logo=paypal&logoColor=white)](https://developer.paypal.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)](https://render.com/)

🔗 **Live Application Demo:** [https://paypal-hackthon-frontend.onrender.com/](https://paypal-hackthon-frontend.onrender.com/)

> **Cashiko** is an agentic receivables copilot that turns messy work notes into live PayPal invoices, triages customer excuses with zero-hallucination AI, and autonomously negotiates partial payment recovery on PayPal rails.

---

## 🌟 Key Features

1. **Smart Intake & Extraction**:
   - Converts unstructured work notes or audio briefs into structured, itemized invoices.
   - Calculates tax, subtotal, and currency with field-level confidence scores.
   - Generates and synchronizes official invoices on the **PayPal Sandbox** with 1 click.

2. **AI Customer Context & Reply Triage**:
   - Classifies customer replies into a **7-intent receivables taxonomy** (*Promise to Pay*, *Dispute/Objection*, *Claims Already Paid*, *Request Extension*, *Payment Failed*, etc.).
   - Drafts polite, empathetic email responses strictly grounded on live invoice facts—eliminating hallucinations.

3. **Autonomous Partial Payment Negotiation & Settlement**:
   - Auto-detects customer installment requests (*"Can I pay half now and rest next Friday?"*).
   - Generates dedicated **PayPal Sandbox Checkout Links** for the exact agreed partial installment amount.
   - Updates the branded invoice statement with **Partial Amount Due Today** vs. **Remaining Balance Due Later**.

4. **Dual-Mode Micro-Merchant Workspace**:
   - **Fashion Retail Mode**: Product catalog, stock tracking, and reorder alerts.
   - **Service Specialist Mode**: Tailoring & repair rate cards, service work orders, and customer ledger.

5. **Live Ledger & Conversational Assistant**:
   - Grounded chatbot directly connected to SQLite database for instant ledger queries (*"Who owes me money?"*).
   - Produces WhatsApp reminders with embedded PayPal sandbox payment links.

---

## 🏗️ Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                      Cashiko Frontend                       │
│           (React 18, TypeScript, Tailwind CSS, Vite)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────────┐
│                      FastAPI Backend                        │
│            (Python 3.10, SQLAlchemy Async, SQLite)          │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│  ┌────────────────────────┐  │  ┌────────────────────────┐  │
│  │   Groq Cloud (Llama 3) │  │  │   PayPal Sandbox v2    │  │
│  │ - Strict JSON Extraction│  │  │ - Invoicing API v2     │  │
│  │ - 7-Intent Classifier  │  │  │ - OAuth2 Token Cache   │  │
│  │ - Grounded Fact Triage │  │  │ - Live Payer Links     │  │
│  └────────────────────────┘  │  └────────────────────────┘  │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**
- Free **PayPal Developer Account** ([developer.paypal.com](https://developer.paypal.com/))
- Free **Groq Cloud API Key** ([console.groq.com](https://console.groq.com/))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Yunusr714/PayPal_Hackthon.git
cd PayPal_Hackthon
```

---

### Step 2: Configure & Start Backend

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` with your **PayPal Sandbox credentials** and **Groq API key**.*

5. Run the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The API will be live at `http://127.0.0.1:8000`. You can inspect the interactive docs at `http://127.0.0.1:8000/docs`.*

---

### Step 3: Configure & Start Frontend

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 🌐 Live Cloud Deployment (Render)

Cashiko is fully deployed and accessible live in the cloud:

- **Live Frontend App**: [https://paypal-hackthon-frontend.onrender.com/](https://paypal-hackthon-frontend.onrender.com/) (Deployed on Render Static Sites with SPA rewrite handling)
- **Live Backend API**: [https://paypal-hackthon-backend.onrender.com/](https://paypal-hackthon-backend.onrender.com/) (FastAPI service with automatic CORS regex matching)
- **Interactive API Docs**: [https://paypal-hackthon-backend.onrender.com/docs](https://paypal-hackthon-backend.onrender.com/docs)

---

## 🧪 Testing with PayPal Sandbox

To test payments on the live PayPal sandbox without real currency:
1. Generate an invoice inside Cashiko using the **Smart Intake** or **Create Invoice** page.
2. Click **"Push to PayPal Sandbox"** to create a verified PayPal Invoicing v2 draft.
3. Open the generated **PayPal Checkout Link** (`https://www.sandbox.paypal.com/invoice/p/...`).
4. Log in with your **PayPal Sandbox Personal/Buyer Account** (generated in [developer.paypal.com](https://developer.paypal.com/dashboard/accounts)) or use test credit cards to complete payment.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

