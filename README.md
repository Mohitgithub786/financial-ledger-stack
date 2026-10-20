# 🏛️ Formance Stack | Finance Operations & Ledger Infrastructure

![Go](https://img.shields.io/badge/Language-Go-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square)
![Kafka](https://img.shields.io/badge/Messaging-Kafka%20%7C%20NATS-231F20?style=flat-square)
![Compliance](https://img.shields.io/badge/Standard-ACID%20Double--Entry-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

**Formance Stack** is an enterprise-grade financial infrastructure platform designed for **Finance Operations, Double-Entry General Ledgers, Multi-Rail Payment Processing, and Automated 3-Way Reconciliations**.

Developed and maintained by **[Mohit](https://github.com/Mohitgithub786)**.

---

## 🎯 Direct Alignment with Finance Operations (FinOps)

This architecture addresses the four core pillars of enterprise financial operations:

### 1. 💳 Payment Processing & Ingestion
- Multi-gateway ingestion supporting **UPI (GooglePay, PhonePe, Paytm), Credit/Debit Cards, and NetBanking**.
- Unified abstraction layer over payment service providers (Razorpay, Stripe, Cashfree, Banking APIs).
- Real-time payment event streaming (`SAVED_PAYMENT`, `PAYMENT_INITIATION_ADJUSTMENT`).

### 2. 🏦 Maintaining Financial Records (General Ledger)
- **Programmable Double-Entry Accounting**: Immutable source of truth ensuring total debits strictly equal total credits.
- Real-time balance calculations across operating accounts, creator royalty pools, and vendor liabilities.
- Complete audit trails with microsecond timestamping and transaction reference hashing.

### 3. ⚖️ Managing Reconciliations (3-Way Matching Engine)
- **Automated Settlement Reconciliation**: Continuously reconciles Payment Gateway settlements (T+1/T+2) against primary bank credit feeds and internal ledger entries.
- Automated variance detection to catch gateway fee discrepancies, unrecorded bank charges, and timing differences.
- Discrepancy resolution workflows with automated adjustment postings.

### 4. 📊 Compliance & Financial Reporting
- Statutory tax compliance provisions (18% GST allocation and Section 194J TDS deductions on professional disbursements).
- Automated trial balance generation with zero-variance validation.
- Exportable audit logs for statutory auditors, internal controllers, and management reviews.

---

## 🚀 Quick Start (Run Locally)

### 1. Launch the Interactive FinOps Dashboard
```bash
# Clone the repository
git clone https://github.com/Mohitgithub786/financial-ledger-stack.git
cd financial-ledger-stack

# Start the dashboard server (zero external dependencies)
node server.js
```
Open **`http://localhost:3000`** in your browser to interact with the live ledger, simulate payments, and run automated reconciliations.

---

## 📄 License
This project is licensed under the MIT License.
