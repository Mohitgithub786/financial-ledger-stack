# 🚀 How to Run Formance Stack

This guide shows you how to run and demonstrate the Formance Stack platform.

---

## Method 1: Run the Event Schema & Specification Engine (Locally)

The monorepo contains the distributed event bus models and OpenAPI specifications for Formance services (Ledger, Payments, Orchestration, Reconciliation).

### Requirements:
- **Node.js 18+** (installed)

### Steps:
```bash
# 1. Navigate to events directory
cd events

# 2. Install dependencies
npm install

# 3. Generate distributed event schemas
node index.js
```
This builds and validates the real-time event schemas generated for Ledger, Payments, and Orchestration.

---

## Method 2: Launch the Live Formance Stack & Web Dashboard (Live Demo)

Formance provides an instant cloud-native sandbox and web dashboard via the Formance CLI (`fctl`).

### 1. Install Formance CLI
Download the latest Windows binary:
- **[Formance CLI (fctl) for Windows](https://github.com/formancehq/fctl/releases/latest)**
- Extract `fctl.exe` and place it in your PATH or in the project folder.

### 2. Initialize and Launch
```bash
# Login to Formance
fctl login

# Create a live test ledger stack
fctl stack create demo

# Commit a financial ledger transaction (100 USD from world to customer)
fctl ledger send world user:001 100 USD/2 --ledger=demo

# Launch the visual Control Dashboard in your browser
fctl ui
```

---

## Method 3: Run via Docker (Full Local Microservices)

To run all backend microservices locally with PostgreSQL:

```bash
docker compose up -d
```
All APIs will be available on `http://localhost:8080`.
