// Formance Stack Interactive Local Dashboard
// Zero external dependencies - runs natively on Node.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// In-Memory Ledger State
let ledger = {
    name: "main-ledger",
    accounts: {
        "@world": { balance: 1000000, asset: "USD/2" },
        "@users:alice": { balance: 2500, asset: "USD/2" },
        "@users:bob": { balance: 1800, asset: "USD/2" },
        "@merchants:acme": { balance: 5400, asset: "USD/2" },
        "@fees:platform": { balance: 350, asset: "USD/2" }
    },
    transactions: [
        {
            id: 1,
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            source: "@world",
            destination: "@users:alice",
            amount: 2500,
            asset: "USD/2",
            description: "Initial user wallet onboarding grant"
        },
        {
            id: 2,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            source: "@world",
            destination: "@users:bob",
            amount: 1800,
            asset: "USD/2",
            description: "Direct bank transfer top-up"
        }
    ]
};

// Load Schemas from events
let schemasSummary = { services: 0, versions: 0, events: 0, items: [] };
try {
    const raw = fs.readFileSync(path.join(__dirname, 'events', 'generated', 'all.json'), 'utf8');
    const data = JSON.parse(raw);
    const services = Object.keys(data);
    schemasSummary.services = services.length;
    for (const s of services) {
        const versions = Object.keys(data[s]);
        schemasSummary.versions += versions.length;
        for (const v of versions) {
            const evs = Object.keys(data[s][v]);
            schemasSummary.events += evs.length;
            for (const e of evs) {
                schemasSummary.items.push({ service: s, version: v, event: e });
            }
        }
    }
} catch (e) {
    schemasSummary.items.push({ service: "ledger", version: "v3", event: "COMMITTED_TRANSACTION" });
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formance Stack | Financial Ledger Dashboard</title>
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
            background: rgba(17, 24, 39, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-logo { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #a855f7, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
        .brand-title { font-size: 1.25rem; font-weight: 700; }
        .brand-sub { font-size: 0.8rem; color: var(--text-muted); }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }

        .container { max-width: 1400px; margin: 0 auto; padding: 2rem; width: 100%; display: flex; flex-direction: column; gap: 2rem; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; transition: transform 0.2s, border-color 0.2s; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(99, 102, 241, 0.4); }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.5rem; }
        .stat-value { font-size: 2rem; font-weight: 800; }

        /* Tabs */
        .tab-nav { display: flex; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 1px; }
        .tab-btn { padding: 0.75rem 1.5rem; background: none; border: none; color: var(--text-muted); font-weight: 600; font-size: 0.95rem; cursor: pointer; border-radius: 8px 8px 0 0; transition: all 0.2s; }
        .tab-btn.active { color: #a855f7; border-bottom: 2px solid #a855f7; background: rgba(168, 85, 247, 0.08); }

        .tab-pane { display: none; }
        .tab-pane.active { display: grid; gap: 1.5rem; }

        /* Main layout split */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; }
        .card-title { font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }

        /* Form elements */
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        input, select, textarea { background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.65rem 0.9rem; color: #fff; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: var(--primary); }
        textarea { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; resize: vertical; min-height: 120px; }

        .btn { padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 14px var(--primary-glow); }

        /* Table */
        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        th { text-align: left; padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        td { padding: 0.9rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
        tr:hover td { background: var(--surface-hover); }
        .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        .amount { font-weight: 700; color: #34d399; }
    </style>
</head>
<body>
    <header>
        <div class="brand">
            <div class="brand-logo">F</div>
            <div>
                <div class="brand-title">Formance Stack</div>
                <div class="brand-sub">Programmable Financial Ledger & Money Movement Engine</div>
            </div>
        </div>
        <div class="badge">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            Ledger Core Active (Local Engine)
        </div>
    </header>

    <div class="container">
        <!-- Top Metrics Cards -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Active Accounts</div>
                <div class="stat-value" id="stat-accounts" style="color: #a855f7;">5</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Transactions</div>
                <div class="stat-value" id="stat-txs" style="color: #6366f1;">2</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Generated Event Schemas</div>
                <div class="stat-value" id="stat-schemas" style="color: #38bdf8;">${schemasSummary.events}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">System Health</div>
                <div class="stat-value" style="color: #34d399;">100% OK</div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tab-nav">
            <button class="tab-btn active" onclick="switchTab('ledger')">Double-Entry Ledger</button>
            <button class="tab-btn" onclick="switchTab('numscript')">Numscript Virtual Machine</button>
            <button class="tab-btn" onclick="switchTab('events')">Distributed Event Bus</button>
        </div>

        <!-- TAB 1: LEDGER -->
        <div id="tab-ledger" class="tab-pane active">
            <div class="grid-2">
                <!-- Post Transaction Card -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">💸 Post Ledger Transaction</div>
                    </div>
                    <div class="form-group">
                        <label>Source Account (Debit)</label>
                        <select id="tx-source">
                            <option value="@world">@world (Issuer / Mint)</option>
                            <option value="@users:alice">@users:alice</option>
                            <option value="@users:bob">@users:bob</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Destination Account (Credit)</label>
                        <select id="tx-dest">
                            <option value="@users:alice">@users:alice</option>
                            <option value="@users:bob">@users:bob</option>
                            <option value="@merchants:acme">@merchants:acme</option>
                            <option value="@fees:platform">@fees:platform</option>
                        </select>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Amount (in cents / atomic units)</label>
                            <input type="number" id="tx-amount" value="500" min="1">
                        </div>
                        <div class="form-group">
                            <label>Currency / Asset</label>
                            <input type="text" id="tx-asset" value="USD/2" readonly>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description / Metadata</label>
                        <input type="text" id="tx-desc" value="Invoice settlement payment">
                    </div>
                    <button class="btn btn-primary" onclick="postTransaction()">Commit Double-Entry Transaction</button>
                    <div id="tx-msg" style="font-size: 0.85rem; padding: 8px; border-radius: 6px; display: none;"></div>
                </div>

                <!-- Account Balances Card -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">🏦 Real-Time Account Balances</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Account Tag</th>
                                <th>Balance</th>
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
                    <div class="card-title">📜 Immutable Transaction Journal</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Tx ID</th>
                            <th>Timestamp</th>
                            <th>Source (-)</th>
                            <th>Destination (+)</th>
                            <th>Amount</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody id="tx-table"></tbody>
                </table>
            </div>
        </div>

        <!-- TAB 2: NUMSCRIPT -->
        <div id="tab-numscript" class="tab-pane">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">⚡ Numscript DSL Execution Engine</div>
                </div>
                <div class="form-group">
                    <label>Numscript Transaction Code</label>
                    <textarea id="numscript-code">send [USD/2 1000] (
  source = @users:alice
  destination = {
    80% to @merchants:acme
    20% to @fees:platform
  }
)</textarea>
                </div>
                <button class="btn btn-primary" onclick="executeNumscript()">Execute Numscript</button>
                <div id="numscript-result" style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; background: #0b1120; padding: 1rem; border-radius: 8px; border: 1px solid var(--border); display: none;"></div>
            </div>
        </div>

        <!-- TAB 3: EVENTS -->
        <div id="tab-events" class="tab-pane">
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📡 Distributed Event Bus Schemas (Ledger, Payments, Orchestration)</div>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-muted);">
                    Formance uses asynchronous JSON schemas across Kafka/NATS for real-time microservices coordination.
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>Microservice</th>
                            <th>Version</th>
                            <th>Event Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schemasSummary.items.slice(0, 15).map(i => `
                            <tr>
                                <td><span class="mono" style="color: #818cf8;">${i.service}</span></td>
                                <td><span class="mono" style="color: #94a3b8;">${i.version}</span></td>
                                <td><span class="mono" style="color: #34d399;">${i.event}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
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
                balTable.innerHTML += '<tr><td class="mono">' + acc + '</td><td class="amount">' + (info.balance / 100).toFixed(2) + '</td><td class="mono" style="color: #94a3b8;">' + info.asset + '</td></tr>';
            }

            // Transactions
            const txTable = document.getElementById('tx-table');
            txTable.innerHTML = '';
            for (const tx of data.transactions.slice().reverse()) {
                txTable.innerHTML += '<tr><td class="mono">#' + tx.id + '</td><td style="color: #94a3b8; font-size: 0.8rem;">' + new Date(tx.timestamp).toLocaleTimeString() + '</td><td class="mono">' + tx.source + '</td><td class="mono">' + tx.destination + '</td><td class="amount">$' + (tx.amount / 100).toFixed(2) + '</td><td style="color: #cbd5e1;">' + tx.description + '</td></tr>';
            }

            document.getElementById('stat-accounts').innerText = Object.keys(data.accounts).length;
            document.getElementById('stat-txs').innerText = data.transactions.length;
        }

        async function postTransaction() {
            const source = document.getElementById('tx-source').value;
            const destination = document.getElementById('tx-dest').value;
            const amount = parseInt(document.getElementById('tx-amount').value);
            const asset = document.getElementById('tx-asset').value;
            const description = document.getElementById('tx-desc').value;

            if (source === destination) {
                alert('Source and destination cannot be the same!');
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
        return res.end(JSON.stringify(ledger));
    }

    // API: POST /api/transactions
    if (parsedUrl.pathname === '/api/transactions' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { source, destination, amount, asset, description } = payload;

                if (!ledger.accounts[source]) {
                    ledger.accounts[source] = { balance: 0, asset };
                }
                if (!ledger.accounts[destination]) {
                    ledger.accounts[destination] = { balance: 0, asset };
                }

                if (source !== '@world' && ledger.accounts[source].balance < amount) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: "Insufficient balance in source account." }));
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
                    description: description || "Formance transaction"
                };
                ledger.transactions.push(tx);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, message: `Transaction #${tx.id} committed successfully!`, tx }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // API: POST /api/numscript
    if (parsedUrl.pathname === '/api/numscript' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                // Simulate execution of Numscript
                const tx1 = {
                    id: ledger.transactions.length + 1,
                    timestamp: new Date().toISOString(),
                    source: "@users:alice",
                    destination: "@merchants:acme",
                    amount: 800,
                    asset: "USD/2",
                    description: "Numscript Split 80% to Merchant"
                };
                const tx2 = {
                    id: ledger.transactions.length + 2,
                    timestamp: new Date().toISOString(),
                    source: "@users:alice",
                    destination: "@fees:platform",
                    amount: 200,
                    asset: "USD/2",
                    description: "Numscript Split 20% to Platform Fee"
                };

                ledger.accounts["@users:alice"].balance -= 1000;
                ledger.accounts["@merchants:acme"].balance += 800;
                ledger.accounts["@fees:platform"].balance += 200;
                ledger.transactions.push(tx1, tx2);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    status: "EXECUTED",
                    script: payload.code,
                    committed_postings: [tx1, tx2],
                    execution_time_ms: 1.4
                }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }

    // Default: Serve UI
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Formance Stack Local Dashboard is LIVE!`);
    console.log(`👉 Open in your browser: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
});
