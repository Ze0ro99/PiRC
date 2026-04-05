import { ALGORITHM_BASE_MICROS } from './constants.js';
import { normalizeMicrosToMacro, calculateWcfParity } from './calculations.js';
import { fetchBalances } from './wallet-balance.js';

// ================= CONFIG =================
const REFRESH_INTERVAL_MS = 5000;

// ================= WALLET STATE =================
let connectedWallet = null;

// ================= TRANSLATIONS =================
const translations = {
    en: {
        telemetry_status: "Live Technical Telemetry",
        cex_price: "External Market (Speculative IOU)",
        wcf_parity: "Vanguard Justice Parity (WCF)",
        pioneer_equity: "Pioneer Equity (Ref)",
        bridge_cap: "Bridge Liquidity Cap",
        ledger_title: "Vanguard Bridge Real-Time Ledger"
    },
    id: {
        telemetry_status: "Telemetri Teknis Langsung",
        cex_price: "Pasar Eksternal (IOU Spekulatif)",
        wcf_parity: "Paritas Keadilan (WCF)",
        pioneer_equity: "Ekuitas Pionir (Ref)",
        bridge_cap: "Batas Likuiditas Jembatan",
        ledger_title: "Buku Besar Telemetri Keadilan"
    }
};

let currentLang = 'en';
let selectedCurrency = 'USD';

// ================= WALLET BRIDGE =================
export async function setWallet(address) {
    connectedWallet = address;
    console.log("Wallet connected:", address);

    await syncBalances();
}

// ================= BALANCE SYNC =================
async function syncBalances() {
    if (!connectedWallet) return;

    try {
        const balances = await fetchBalances(connectedWallet);

        balances.forEach(item => {
            const row = document.querySelector(`tr[data-layer="${item.layer}"]`);
            if (!row) return;

            const balEl = row.querySelector(".balance");
            const statusEl = row.querySelector(".status");

            if (balEl) balEl.innerText = item.balance;
            if (statusEl) statusEl.innerText = item.status;
        });

    } catch (e) {
        console.error("Balance sync error:", e);
    }
}

// ================= LANGUAGE =================
export function changeLanguage(lang) {
    currentLang = lang;

    document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

// ================= CURRENCY =================
export function updateCurrency() {
    selectedCurrency = document.getElementById('currency-select')?.value || 'USD';
    syncTelemetry();
}

// ================= CHART INIT =================
const cexChart = LightweightCharts.createChart(document.getElementById('cex-chart'), {
    layout: { background: { color: 'transparent' }, textColor: '#c9d1d9' },
    grid: { vertLines: { color: '#30363d' }, horzLines: { color: '#30363d' } },
    height: 280
});
const cexLineSeries = cexChart.addLineSeries({ color: '#f85149', lineWidth: 2 });

const pircChart = LightweightCharts.createChart(document.getElementById('pirc-chart'), {
    layout: { background: { color: 'transparent' }, textColor: '#c9d1d9' },
    grid: { vertLines: { color: '#30363d' }, horzLines: { color: '#30363d' } },
    height: 280
});
const pircLineSeries = pircChart.addLineSeries({ color: '#ffa500', lineWidth: 2 });

// ================= TELEMETRY =================
async function syncTelemetry() {
    try {
        const priceRes = await fetch('/.netlify/functions/prices');
        const priceData = await priceRes.json();

        const tradeRes = await fetch('/.netlify/functions/trades');
        const tradeData = await tradeRes.json();

        const basePrice = priceData.aggregated?.price ?? 0;

        document.getElementById('cex-price-display').innerText = `$${basePrice.toFixed(4)}`;

        const wcfParity = basePrice * ALGORITHM_BASE_MICROS;
        document.getElementById('pirc-price-display').innerText = `$${wcfParity.toLocaleString()}`;
        document.getElementById('t-pi-price').innerText = `$${wcfParity.toLocaleString()}`;

        const now = Math.floor(Date.now() / 1000);

        cexLineSeries.update({ time: now, value: basePrice });
        pircLineSeries.update({ time: now, value: wcfParity });

        // ================= LEDGER =================
        const ledgerBody = document.getElementById('ledger-body');
        ledgerBody.innerHTML = '';

        const trades = tradeData.trades || [];

        trades.slice(0, 10).forEach(t => {
            const micro = Math.round(t.amount * ALGORITHM_BASE_MICROS);
            const macro = normalizeMicrosToMacro(micro);
            const wcfVal = calculateWcfParity(parseFloat(macro), t.price);

            const row = `
            <tr class="tx-row">
                <td class="tx-cell">${String(t.tradeId).slice(0,6)}...</td>
                <td class="tx-cell">${t.side}</td>
                <td class="tx-cell">${micro}</td>
                <td class="tx-cell">${macro}</td>
                <td class="tx-cell">$${wcfVal.toFixed(2)}</td>
            </tr>
            `;
            ledgerBody.insertAdjacentHTML('beforeend', row);
        });

    } catch (e) {
        console.error("Telemetry error:", e);
    }
}

// ================= GLOBAL BIND =================
window.changeLanguage = changeLanguage;
window.updateCurrency = updateCurrency;

// ================= LOOP =================
setInterval(() => {
    syncTelemetry();
    syncBalances(); // 🔥 tambahan penting
}, REFRESH_INTERVAL_MS);

// ================= INIT =================
syncTelemetry();
changeLanguage('en');
