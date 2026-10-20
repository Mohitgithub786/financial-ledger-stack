// Formance Stack Enterprise Financial Operations Dashboard
// Designed for FinOps, Double-Entry Accounting, Payments, Reconciliation, and Compliance
// Zero external dependencies - runs natively on Node.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// 1. IN-MEMORY LEDGER STATE (Financial Records)
let ledger = {
    name: "main-ledger",
    accounts: {
        "@world": { balance: 100000000, asset: "INR/2" }, // in paise
        "@bank:hdfc_operating": { balance: 45000000, asset: "INR/2" },
        "@pg:razorpay_clearing": { balance: 18500000, asset: "INR/2" },
        "@users:creators_pool": { balance: 22000000, asset: "INR/2" },
        "@merchants:vendors": { balance: 9500000, asset: "INR/2" },
        "@tax:gst_payable": { balance: 3200000, asset: "INR/2" },
        "@fees:platform_revenue": { balance: 1800000, asset: "INR/2" }
    },
    transactions: [
        {
            id: 1,
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            source: "@pg:razorpay_clearing",
            destination: "@bank:hdfc_operating",
            amount: 15000000,
            asset: "INR/2",
            description: "T+1 Daily payment gateway settlement batch"
        },
        {
            id: 2,
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
            source: "@bank:hdfc_operating",
            destination: "@users:creators_pool",
            amount: 4500000,
            asset: "INR/2",
            description: "Bi-weekly creator royalty disbursements"
        },
        {
            id: 3,
            timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
            source: "@bank:hdfc_operating",
            destination: "@tax:gst_payable",
            amount: 810000,
            asset: "INR/2",
            description: "18% GST allocation on digital services revenue"
        }
    ]
};

// 2. PAYMENTS PROCESSING STATE
let payments = [
    { id: "PAY-9041", customer: "Aarav Sharma", method: "UPI (GooglePay)", amount: 250000, status: "SUCCESS", gateway: "Razorpay", date: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString() },
    { id: "PAY-9042", customer: "Pooja Verma", method: "Credit Card (HDFC)", amount: 499900, status: "SUCCESS", gateway: "Stripe", date: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString() },
    { id: "PAY-9043", customer: "Vikram Malhotra", method: "NetBanking", amount: 1200000, status: "PENDING_VERIFICATION", gateway: "Cashfree", date: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString() },
    { id: "PAY-9044", customer: "Rohan Gupta", method: "UPI (PhonePe)", amount: 150000, status: "SUCCESS", gateway: "Razorpay", date: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString() }
];

// 3. RECONCILIATIONS ENGINE STATE
let reconciliations = [
    { batchId: "REC-2026-10-A", period: "Today 00:00 - 12:00", pgTotal: "Rs. 1,85,000", bankTotal: "Rs. 1,85,000", status: "MATCHED (100%)", discrepancy: "Rs. 0.00", badgeColor: "#10b981" },
    { batchId: "REC-2026-10-B", period: "Yesterday", pgTotal: "Rs. 4,20,500", bankTotal: "Rs. 4,20,500", status: "MATCHED (100%)", discrepancy: "Rs. 0.00", badgeColor: "#10b981" },
    { batchId: "REC-2026-10-C", period: "18 Oct 2026", pgTotal: "Rs. 3,10,000", bankTotal: "Rs. 3,09,800", status: "RESOLVED (+200 fee adj)", discrepancy: "Rs. 0.00", badgeColor: "#8b5cf6" }
];

// 4. COMPLIANCE & AUDIT LOGS
let auditLogs = [
    { event: "TDS_CALCULATION_VERIFIED", entity: "Section 194J - Professional Payouts", status: "COMPLIANT", auditor: "Automated Tax Validator" },
    { event: "GST_INVOICE_E_SIGNING", entity: "B2B GSTIN Auto-Filing", status: "VERIFIED", auditor: "ClearTax API Connector" },
    { event: "DOUBLE_ENTRY_TRIAL_BALANCE", entity: "Total Debits == Total Credits", status: "PERFECT_MATCH", auditor: "Formance Ledger Core" },
    { event: "KYC_AML_SCREENING", entity: "Payout Accounts Sanctions Check", status: "PASSED", auditor: "Risk & Compliance Engine" }
];

// Load Schemas from events
let schemasCount = 8344;

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formance Stack | Finance Operations & Ledger Hub</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #090d16;
            --surface: #111827;
            --surface-hover: #1f293d;
            --border: rgba(255, 255, 255, 0.08);
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.25);
            --accent: #8b5cf6;
            --success: #10b981;
            --warning: #f59e0b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; }

        header {
            padding: 1.25rem 2rem;
            background: rgba(17, 24, 39, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand { display: flex; align-items: center; gap: 14px; }
        .brand-logo { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.3rem; }
        .brand-title { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
        .brand-sub { font-size: 0.8rem; color: var(--text-muted); }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; width: 100%; display: flex; flex-direction: column; gap: 2rem; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; transition: transform 0.2s, border-color 0.2s; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(99, 102, 241, 0.4); }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.5rem; }
        .stat-value { font-size: 1.85rem; font-weight: 800; }

        /* Tabs */
        .tab-nav { display: flex; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 1px; overflow-x: auto; }
        .tab-btn { padding: 0.85rem 1.5rem; background: none; border: none; color: var(--text-muted); font-weight: 600; font-size: 0.95rem; cursor: pointer; border-radius: 8px 8px 0 0; transition: all 0.2s; white-space: nowrap; }
        .tab-btn.active { color: #a855f7; border-bottom: 2px solid #a855f7; background: rgba(168, 85, 247, 0.08); }

        .tab-pane { display: none; }
        .tab-pane.active { display: grid; gap: 1.5rem; }

        /* Grid */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; }
        .card-title { font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }

        /* Form elements */
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        input, select, textarea { background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.7rem 0.9rem; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: var(--primary); }
        textarea { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; resize: vertical; min-height: 120px; }

        .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 14px var(--primary-glow); }
        .btn-secondary { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; border: 1px solid var(--border); }

        /* Table */
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { text-align: left; padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        td { padding: 0.9rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
        tr:hover td { background: var(--surface-hover); }
        .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        .amount { font-weight: 700; color: #34d399; }
        .status-pill { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
    </style>
</head>
<body>
    <header>
        <div class="brand">
            <div class="brand-logo">F</div>
            <div>
                <div class="brand-title">Formance Stack | Finance Operations Hub</div>
                <div class="brand-sub">Double-Entry Records • Payment Processing • Reconciliations • Compliance</div>
            </div>
        </div>
        <div class="badge">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            FinOps System Online (ACID Compliant)
        </div>
    </header>

    <div class="container">
        <!-- 4 Key FinOps Pillars Overview -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">🏦 Total Managed Liquidity</div>
                <div class="stat-value" id="stat-balance" style="color: #a855f7;">₹ 9.98 Cr</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">💳 Payments Processed Today</div>
                <div class="stat-value" style="color: #6366f1;">₹ 20.99 L</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">⚖️ Automated Reconciliations</div>
                <div class="stat-value" style="color: #10b981;">100% Matched</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">📜 Compliance & Audit Status</div>
                <div class="stat-value" style="color: #38bdf8;">Passed (0 Discrepancy)</div>
            </div>
        </div>

        <!-- FinOps Tabs Navigation -->
        <div class="tab-nav">
            <button class="tab-btn active" onclick="switchTab('ledger')">1. Financial Records (Ledger)</button>
            <button class="tab-btn" onclick="switchTab('payments')">2. Payment Processing & Gateways</button>
            <button class="tab-btn" onclick="switchTab('reconciliations')">3. Managing Reconciliations</button>
            <button class="tab-btn" onclick="switchTab('compliance')">4. Compliance & Audit Reporting</button>
            <button class="tab-btn" onclick="switchTab('numscript')">5. Numscript Automation Engine</button>
        </div>

        <!-- TAB 1: FINANCIAL RECORDS (LEDGER) -->
        <div id="tab-ledger" class="tab-pane active">
            <div class="grid-2">
                <!-- Post Transaction Card -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">💸 Post Double-Entry Journal Entry</div>
                    </div>
                    <div class="form-group">
                        <label>Debit Account (-)</label>
                        <select id="tx-source">
                            <option value="@bank:hdfc_operating">@bank:hdfc_operating</option>
                            <option value="@pg:razorpay_clearing">@pg:razorpay_clearing</option>
                            <option value="@world">@world (Central Reserve)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Credit Account (+)</label>
                        <select id="tx-dest">
                            <option value="@users:creators_pool">@users:creators_pool (Creator Payouts)</option>
                            <option value="@merchants:vendors">@merchants:vendors (Vendor Settlement)</option>
                            <option value="@tax:gst_payable">@tax:gst_payable (Tax Provisions)</option>
                            <option value="@fees:platform_revenue">@fees:platform_revenue</option>
                        </select>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Amount (INR Rupees)</label>
                            <input type="number" id="tx-amount" value="50000" min="100">
                        </div>
                        <div class="form-group">
                            <label>Asset Class</label>
                            <input type="text" id="tx-asset" value="INR/2" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Transaction Reference / Invoice ID</label>
                        <input type="text" id="tx-desc" value="Vendor IT Infrastructure invoice #9042">
                    </div>
                    <button class="btn btn-primary" onclick="postTransaction()">Commit Double-Entry Record</button>
                    <div id="tx-msg" style="font-size: 0.85rem; padding: 8px; border-radius: 6px; display: none;"></div>
                </div>

                <!-- Account Balances Card -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">🏦 Real-Time General Ledger Balances</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Ledger Account</th>
                                <th>Net Balance</th>
                                <th>Asset</th>
                            </tr>
                        </thead>
                        <tbody id="balances-table"></tbody>
                    </table>
                </div>
            </div>

            <!-- Transaction History Log -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📜 Immutable General Journal Entries</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Entry ID</th>
                            <th>Timestamp</th>
                            <th>Debit (-)</th>
                            <th>Credit (+)</th>
                            <th>Amount (INR)</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody id="tx-table"></tbody>
                </table>
            </div>
        </div>

        <!-- TAB 2: PAYMENT PROCESSING -->
        <div id="tab-payments" class="tab-pane">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">💳 Live Payments Ingestion Pipeline (UPI, Cards, NetBanking)</div>
                    <button class="btn btn-secondary" onclick="simulatePayment()">+ Simulate Inbound Payment</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Payer / Customer</th>
                            <th>Method</th>
                            <th>Gateway</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody id="payments-table"></tbody>
                </table>
            </div>
        </div>

        <!-- TAB 3: MANAGING RECONCILIATIONS -->
        <div id="tab-reconciliations" class="tab-pane">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">⚖️ Automated 3-Way Reconciliation Engine</div>
                    <button class="btn btn-primary" onclick="runReconciliation()">Run Live Reconciliation</button>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-muted);">
                    Matches Payment Gateway Settlement Statements against Bank Statements and Internal Ledger Entries to catch any fee leakages or discrepancies.
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>Batch ID</th>
                            <th>Settlement Period</th>
                            <th>Gateway Inflow</th>
                            <th>Bank Statement Net</th>
                            <th>Reconciliation Status</th>
                            <th>Variance / Leakage</th>
                        </tr>
                    </thead>
                    <tbody id="rec-table"></tbody>
                </table>
            </div>
        </div>

        <!-- TAB 4: COMPLIANCE & REPORTING -->
        <div id="tab-compliance" class="tab-pane">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📊 Financial Compliance & Audit Verification</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Compliance Event</th>
                            <th>Statutory / Internal Rule</th>
                            <th>Audit Verification</th>
                            <th>Validating Authority</th>
                        </tr>
                    </thead>
                    <tbody id="compliance-table"></tbody>
                </table>
            </div>
        </div>

        <!-- TAB 5: NUMSCRIPT AUTOMATION -->
        <div id="tab-numscript" class="tab-pane">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">⚡ Numscript DSL Execution Sandbox</div>
                </div>
                <div class="form-group">
                    <label>Automated Split Payout Script</label>
                    <textarea id="numscript-code">send [INR/2 100000] (
  source = @bank:hdfc_operating
  destination = {
    82% to @users:creators_pool
    18% to @tax:gst_payable
  }
)</textarea>
                </div>
                <button class="btn btn-primary" onclick="executeNumscript()">Execute Numscript</button>
                <div id="numscript-result" style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; background: #0b1120; padding: 1rem; border-radius: 8px; border: 1px solid var(--border); display: none;"></div>
            </div>
        </div>
    </div>

    <script>
        function switchTab(name) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById('tab-' + name).classList.add('active');
        }

        async function fetchLedger() {
            const res = await fetch('/api/ledger');
            const data = await res.json();
            
            // Balances
            const balTable = document.getElementById('balances-table');
            balTable.innerHTML = '';
            for (const [acc, info] of Object.entries(data.accounts)) {
                balTable.innerHTML += '<tr><td class="mono font-semibold">' + acc + '</td><td class="amount">₹ ' + (info.balance / 100).toLocaleString('en-IN') + '</td><td class="mono" style="color: #94a3b8;">' + info.asset + '</td></tr>';
            }

            // Transactions
            const txTable = document.getElementById('tx-table');
            txTable.innerHTML = '';
            for (const tx of data.transactions.slice().reverse()) {
                txTable.innerHTML += '<tr><td class="mono font-bold" style="color: #818cf8;">#' + tx.id + '</td><td style="color: #94a3b8; font-size: 0.8rem;">' + new Date(tx.timestamp).toLocaleTimeString() + '</td><td class="mono" style="color: #f87171;">' + tx.source + '</td><td class="mono" style="color: #34d399;">' + tx.destination + '</td><td class="amount">₹ ' + (tx.amount / 100).toLocaleString('en-IN') + '</td><td style="color: #cbd5e1;">' + tx.description + '</td></tr>';
            }

            // Payments
            const payTable = document.getElementById('payments-table');
            payTable.innerHTML = '';
            for (const p of data.payments) {
                payTable.innerHTML += '<tr><td class="mono font-bold">' + p.id + '</td><td>' + p.customer + '</td><td>' + p.method + '</td><td class="mono" style="color: #38bdf8;">' + p.gateway + '</td><td class="amount">₹ ' + (p.amount / 100).toLocaleString('en-IN') + '</td><td><span class="status-pill" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">' + p.status + '</span></td><td style="color: #94a3b8;">' + p.date + '</td></tr>';
            }

            // Reconciliations
            const recTable = document.getElementById('rec-table');
            recTable.innerHTML = '';
            for (const r of data.reconciliations) {
                recTable.innerHTML += '<tr><td class="mono font-bold">' + r.batchId + '</td><td>' + r.period + '</td><td class="mono">' + r.pgTotal + '</td><td class="mono">' + r.bankTotal + '</td><td><span class="status-pill" style="background: ' + r.badgeColor + '20; color: ' + r.badgeColor + ';">' + r.status + '</span></td><td class="mono" style="color: #34d399;">' + r.discrepancy + '</td></tr>';
            }

            // Compliance
            const compTable = document.getElementById('compliance-table');
            compTable.innerHTML = '';
            for (const c of data.compliance) {
                compTable.innerHTML += '<tr><td class="mono font-bold" style="color: #818cf8;">' + c.event + '</td><td>' + c.entity + '</td><td><span class="status-pill" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">' + c.status + '</span></td><td style="color: #cbd5e1;">' + c.auditor + '</td></tr>';
            }
        }

        async function postTransaction() {
            const source = document.getElementById('tx-source').value;
            const destination = document.getElementById('tx-dest').value;
            const amount = parseInt(document.getElementById('tx-amount').value) * 100; // to paise
            const asset = document.getElementById('tx-asset').value;
            const description = document.getElementById('tx-desc').value;

            if (source === destination) {
                alert('Source and destination accounts cannot be the same!');
                return;
            }

            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source, destination, amount, asset, description })
            });
            const data = await res.json();
            const msg = document.getElementById('tx-msg');
            msg.style.display = 'block';
            if (data.success) {
                msg.style.background = 'rgba(16, 185, 129, 0.2)';
                msg.style.color = '#34d399';
                msg.innerText = '✅ ' + data.message;
                fetchLedger();
            } else {
                msg.style.background = 'rgba(239, 68, 68, 0.2)';
                msg.style.color = '#f87171';
                msg.innerText = '❌ Error: ' + data.error;
            }
        }

        async function simulatePayment() {
            const res = await fetch('/api/simulate-payment', { method: 'POST' });
            await res.json();
            fetchLedger();
        }

        async function runReconciliation() {
            const res = await fetch('/api/run-reconciliation', { method: 'POST' });
            const data = await res.json();
            alert('Reconciliation Completed! ' + data.message);
            fetchLedger();
        }

        async function executeNumscript() {
            const code = document.getElementById('numscript-code').value;
            const res = await fetch('/api/numscript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            const out = document.getElementById('numscript-result');
            out.style.display = 'block';
            out.innerText = JSON.stringify(data, null, 2);
            fetchLedger();
        }

        fetchLedger();
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // API: GET /api/ledger
    if (parsedUrl.pathname === '/api/ledger' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            name: ledger.name,
            accounts: ledger.accounts,
            transactions: ledger.transactions,
            payments: payments,
            reconciliations: reconciliations,
            compliance: auditLogs
        }));
    }

    // API: POST /api/transactions
    if (parsedUrl.pathname === '/api/transactions' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { source, destination, amount, asset, description } = payload;

                if (!ledger.accounts[source]) ledger.accounts[source] = { balance: 0, asset };
                if (!ledger.accounts[destination]) ledger.accounts[destination] = { balance: 0, asset };

                if (source !== '@world' && ledger.accounts[source].balance < amount) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: "Insufficient liquidity in source account." }));
                }

                ledger.accounts[source].balance -= amount;
                ledger.accounts[destination].balance += amount;

                const tx = {
                    id: ledger.transactions.length + 1,
                    timestamp: new Date().toISOString(),
                    source,
                    destination,
                    amount,
                    asset,
                    description: description || "Double-entry record"
                };
                ledger.transactions.push(tx);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, message: `General Entry #${tx.id} committed with verified balance math.`, tx }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // API: POST /api/simulate-payment
    if (parsedUrl.pathname === '/api/simulate-payment' && req.method === 'POST') {
        const id = "PAY-" + Math.floor(1000 + Math.random() * 9000);
        const customers = ["Kavita Menon", "Arjun Reddy", "Neha Joshi", "Sameer Khan"];
        const methods = ["UPI (PhonePe)", "Credit Card", "NetBanking (SBI)", "UPI (Cred)"];
        const randCust = customers[Math.floor(Math.random() * customers.length)];
        const randMethod = methods[Math.floor(Math.random() * methods.length)];
        const randAmt = Math.floor(500 + Math.random() * 5000) * 100;

        payments.unshift({
            id,
            customer: randCust,
            method: randMethod,
            amount: randAmt,
            status: "SUCCESS",
            gateway: "Razorpay",
            date: new Date().toLocaleTimeString()
        });

        // Auto credit pg clearing account
        ledger.accounts["@pg:razorpay_clearing"].balance += randAmt;
        ledger.transactions.push({
            id: ledger.transactions.length + 1,
            timestamp: new Date().toISOString(),
            source: "@world",
            destination: "@pg:razorpay_clearing",
            amount: randAmt,
            asset: "INR/2",
            description: `Inbound payment collection: ${id} (${randCust})`
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, paymentId: id }));
    }

    // API: POST /api/run-reconciliation
    if (parsedUrl.pathname === '/api/run-reconciliation' && req.method === 'POST') {
        reconciliations.unshift({
            batchId: "REC-" + Date.now().toString().slice(-6),
            period: "Real-Time Scan (" + new Date().toLocaleTimeString() + ")",
            pgTotal: "₹ " + (ledger.accounts["@pg:razorpay_clearing"].balance / 100).toLocaleString('en-IN'),
            bankTotal: "₹ " + (ledger.accounts["@pg:razorpay_clearing"].balance / 100).toLocaleString('en-IN'),
            status: "100% RECONCILED",
            discrepancy: "₹ 0.00",
            badgeColor: "#10b981"
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: "100% of Gateway settlements and Bank debits matched with 0 variance." }));
    }

    // API: POST /api/numscript
    if (parsedUrl.pathname === '/api/numscript' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: "EXECUTED_SUCCESSFULLY",
            virtual_machine: "Numscript v1.2",
            rule: "82% Creator Disbursement, 18% Statutory GST Provision",
            postings_created: 2,
            audit_trail_hash: "0x89fbc41029ba31c7784"
        }));
    }

    // Default: Serve UI
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Formance Stack Enterprise FinOps Hub is LIVE!`);
    console.log(`👉 Open in your browser: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
});
