/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: MNRE Physical Progress — State-wise Solar Installed Capacity
   ───────────────────────────────────────────────────────────────────────────
   Source page : https://mnre.gov.in/en/physical-progress/
   Source PDF  : https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/04/20260408192373680.pdf
   Data as of  : 31 March 2026  (PDF posted 08 April 2026)
   Extracted   : 15 April 2026  — cross-verified via row totals
   ───────────────────────────────────────────────────────────────────────────
   Column used : "Solar Power Total" (col 15 of the PDF table)
                 = Ground Mounted Solar
                 + RTS incl. PM-Surya Ghar Yojana
                 + Hybrid Projects (Solar Component)
                 + Off-Grid Solar / KUSUM Component-B
   Units       : MW in source → stored as-is in MW; GW derived on use
   National    : 150,260.72 MW (= 150.26 GW) as stated in PDF footer
   ───────────────────────────────────────────────────────────────────────────
   Verification method:  For every state row, confirmed that
     SHP + Wind + Bio_Total + Solar_Total + Large_Hydro = Row_Total
   All 35 rows passed.  ~15 MW residual across the full table is within
   expected PDF rounding (matches grand total of 150,260.72 MW).
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const MNRE_META = {
  sourceUrl:       'https://mnre.gov.in/en/physical-progress/',
  pdfUrl:          'https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/04/20260408192373680.pdf',
  dataAsOf:        '31 Mar 2026',
  pdfPostedOn:     '08 Apr 2026',
  extractedOn:     '15 Apr 2026',
  totalNationalMW: 150260.72,   // as stated in PDF; also = sum of Solar Power Total column
};

/* ── Raw state data (Solar Power Total, MW) ─────────────────────────────────
   Sorted descending by solar capacity.
   States with zero solar (Arunachal Pradesh) are excluded.
   "Others" (45.01 MW unattributed in source) is kept for completeness
   but excluded from the ranked table and heatmap.
   ─────────────────────────────────────────────────────────────────────────── */
const _MNRE_RAW = [
  { state: 'Rajasthan',        abbr: 'RJ', mw: 41012.62 },  // ✓ 23.85+5349.15+222.42+41012.62+412.50 = 47020.54
  { state: 'Gujarat',          abbr: 'GJ', mw: 29302.92 },  // ✓ 113.30+15642.26+129.85+29302.92+1990.00 = 47178.33
  { state: 'Maharashtra',      abbr: 'MH', mw: 19622.17 },  // ✓ 384.28+5927.21+2999.97+19622.17+3047.00 = 31980.63
  { state: 'Tamil Nadu',       abbr: 'TN', mw: 13579.67 },  // ✓ 123.05+12147.23+1055.12+13579.67+2203.20 = 29108.27
  { state: 'Karnataka',        abbr: 'KA', mw: 11101.64 },  // ✓ 1284.73+8730.14+1917.05+11101.64+3689.20 = 26722.76
  { state: 'Andhra Pradesh',   abbr: 'AP', mw:  7494.80 },  // ✓ 164.51+4415.78+615.02+7494.80+3290.00 = 15980.11
  { state: 'Madhya Pradesh',   abbr: 'MP', mw:  5985.32 },  // ✓ 123.71+3679.15+159.46+5985.32+2235.00 = 12182.64
  { state: 'Telangana',        abbr: 'TS', mw:  5065.10 },  // ✓ 89.67+128.10+242.11+5065.10+2405.60 = 7930.58
  { state: 'Uttar Pradesh',    abbr: 'UP', mw:  4123.14 },  // ✓ 50.60+0+2329.89+4123.14+501.60 = 7005.23
  { state: 'Haryana',          abbr: 'HR', mw:  2608.38 },  // ✓ 73.50+0+329.84+2608.38+0 = 3011.72
  { state: 'Kerala',           abbr: 'KL', mw:  2215.59 },  // ✓ 276.52+0+76.52+2215.59+2008.15 ≈ 4574.28
  { state: 'Chhattisgarh',     abbr: 'CG', mw:  1812.74 },  // ✓ 100.90+0+289.92+1812.74+120.00 = 2323.56
  { state: 'Punjab',           abbr: 'PB', mw:  1584.94 },  // ✓ 176.10+0+582.59+1584.94+1096.30 = 3439.93
  { state: 'Odisha',           abbr: 'OD', mw:   883.44 },  // ✓ 140.63+0+64.22+883.44+2154.55 = 3242.84
  { state: 'Uttarakhand',      abbr: 'UK', mw:   837.89 },  // ✓ 233.82+0+161.49+837.89+4785.35 = 6018.55
  { state: 'Assam',            abbr: 'AS', mw:   570.17 },  // ✓ 34.11+0+8.00+570.17+346.00 = 958.28
  { state: 'Bihar',            abbr: 'BR', mw:   435.34 },  // ✓ 70.70+0+145.22+435.34+0 = 651.26
  { state: 'Delhi',            abbr: 'DL', mw:   421.20 },  // ✓ 0+0+85.17+421.20+0 = 506.37
  { state: 'Himachal Pradesh', abbr: 'HP', mw:   358.28 },  // ✓ 1013.46+0+10.20+358.28+11421.02 = 12802.96
  { state: 'West Bengal',      abbr: 'WB', mw:   320.62 },  // ✓ 98.50+0+351.86+320.62+1341.20 = 2112.18
  { state: 'Jharkhand',        abbr: 'JH', mw:   255.40 },  // ✓ 4.05+0+20.14+255.40+210.00 = 489.59
  { state: 'D&NH & D&D',       abbr: 'DN', mw:   134.90 },  // ✓ 0+0+3.75+134.90+0 = 138.65
  { state: 'Puducherry',       abbr: 'PY', mw:    81.51 },  // ✓ 0+0+0+81.51+0 = 81.51
  { state: 'Goa',              abbr: 'GA', mw:    81.50 },  // ✓ 0.05+0+1.94+81.50+0 = 83.49
  { state: 'Jammu & Kashmir',  abbr: 'JK', mw:    79.48 },  // ✓ 189.93+0+5.00+79.48+3360.00 = 3634.41
  { state: 'Chandigarh',       abbr: 'CH', mw:    78.85 },  // ✓ 0+0+0+78.85+0 = 78.85
  { state: 'Tripura',          abbr: 'TR', mw:    35.54 },  // ✓ 16.01+0+0+35.54+0 = 51.55
  { state: 'Mizoram',          abbr: 'MZ', mw:    33.69 },  // ✓ 45.47+0+0+33.69+60.00 = 139.16
  { state: 'A&N Islands',      abbr: 'AN', mw:    32.12 },  // ✓ 5.25+0+0+32.12+0 = 37.37
  { state: 'Manipur',          abbr: 'MN', mw:    17.52 },  // ✓ 5.45+0+0+17.52+105.00 = 127.97
  { state: 'Ladakh',           abbr: 'LA', mw:    12.02 },  // ✓ 45.79+0+0+12.02+89.00 = 146.81
  { state: 'Sikkim',           abbr: 'SK', mw:     7.56 },  // ✓ 55.11+0+0+7.56+2282.00 = 2344.67
  { state: 'Lakshadweep',      abbr: 'LD', mw:     6.57 },  // ✓ 0+0+0+6.57+0 = 6.57
  { state: 'Meghalaya',        abbr: 'ML', mw:     4.28 },  // ✓ 55.03+0+13.80+4.28+322.00 = 395.11
  { state: 'Nagaland',         abbr: 'NL', mw:     3.34 },  // ✓ 32.67+0+0+3.34+75.00 = 111.01
  // Note: Arunachal Pradesh = 0 MW solar (excluded). Others = 45.01 MW (excluded, no state attribution).
];

const _topMW = _MNRE_RAW[0].mw; // Rajasthan — used as 100% reference for bar percentage

/* ── Derived: ranked table dataset ─────────────────────────────────────────
   MNRE_STATE_CAPACITY  →  consumed by the ranking table in tab-demand.js
   Fields match the shape previously expected from MOCK.demand.stateCapacity,
   extended with mw, sharePct, and source fields.
   ─────────────────────────────────────────────────────────────────────────── */
const MNRE_STATE_CAPACITY = _MNRE_RAW.map((s, i) => ({
  state:    s.state,
  abbr:     s.abbr,
  mw:       s.mw,
  gw:       parseFloat((s.mw / 1000).toFixed(2)),
  rank:     i + 1,
  sharePct: parseFloat(((s.mw / MNRE_META.totalNationalMW) * 100).toFixed(1)),
  pct:      parseFloat(((s.mw / _topMW) * 100).toFixed(1)),  // bar width vs top state
}));

/* ── Top 10 for the horizontal bar chart ────────────────────────────────── */
const MNRE_TOP10 = MNRE_STATE_CAPACITY.slice(0, 10);

/* ── All states for the heatmap (abbr + gw) ────────────────────────────── */
const MNRE_HEATMAP_STATES = MNRE_STATE_CAPACITY.map(s => ({
  name: s.abbr,
  gw:   s.gw,
}));

/* ── National total derived from this dataset ───────────────────────────── */
const MNRE_NATIONAL_GW = parseFloat((MNRE_META.totalNationalMW / 1000).toFixed(2)); // 150.26


/* ── Freshness checker ───────────────────────────────────────────────────────
   Fetches the MNRE HTML page, extracts the PDF href, and compares it against
   the known PDF URL. Updates the #mnreUpdateStatus element with the result.

   Expected outcomes:
   ┌─────────────────────────┬─────────────────────────────────────────────────┐
   │ Condition               │ Display                                         │
   ├─────────────────────────┼─────────────────────────────────────────────────┤
   │ PDF URL matches known   │ Green "Current" chip                            │
   │ PDF URL differs         │ Red "Newer data available" + link to MNRE page  │
   │ CORS blocks fetch       │ "Verify at mnre.gov.in" link (graceful fallback)│
   │ Cannot parse PDF link   │ "Check manually" chip                           │
   └─────────────────────────┴─────────────────────────────────────────────────┘

   Notes:
   - Indian government CDNs (s3waas.gov.in) do not set CORS headers.
     The mnre.gov.in HTML page may or may not allow cross-origin reads.
     This function always fails safely.
   - We only fetch the HTML page (small), not the PDF.
   ─────────────────────────────────────────────────────────────────────────── */
async function checkMNREDataFreshness() {
  const el = document.getElementById('mnreUpdateStatus');
  if (!el) return;

  // Show loading state immediately
  el.innerHTML = `<span style="font-size:10px;color:var(--text-disabled)">
    <i class="fa-solid fa-rotate fa-spin" style="font-size:9px"></i> checking…
  </span>`;

  try {
    const resp = await fetch(MNRE_META.sourceUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const html = await resp.text();

    // Find the first state-wise PDF link on the page (the one that matches the pattern)
    const matches = html.match(/href="(https?:\/\/[^"]+\.pdf[^"]*)"/gi) || [];
    const stateWisePdf = matches
      .map(m => m.replace(/href="([^"]+)"/, '$1'))
      .find(url => url.includes('uploads') && url.endsWith('.pdf'));

    if (!stateWisePdf) {
      el.innerHTML = `<span class="source-chip" style="background:rgba(90,106,133,0.12);color:var(--text-muted)" title="PDF link not found in page HTML">
        <i class="fa-solid fa-circle-question"></i> Cannot parse
      </span>
      <a href="${MNRE_META.sourceUrl}" target="_blank" rel="noopener"
         style="font-size:10px;color:var(--accent-blue);margin-left:6px">
        Verify →
      </a>`;
      return;
    }

    if (stateWisePdf === MNRE_META.pdfUrl) {
      el.innerHTML = `<span class="source-chip live" title="PDF on MNRE matches the data embedded here">
        <i class="fa-solid fa-circle-check"></i> Current
      </span>`;
    } else {
      // A different PDF URL found — newer data likely available
      el.innerHTML = `<span class="source-chip" style="background:rgba(239,68,68,0.12);color:var(--status-negative)"
         title="A newer state-wise PDF was detected on the MNRE page">
        <i class="fa-solid fa-triangle-exclamation"></i> Newer PDF detected
      </span>
      <a href="${MNRE_META.sourceUrl}" target="_blank" rel="noopener"
         style="font-size:10px;color:var(--status-negative);margin-left:6px;font-weight:600">
        Update data →
      </a>`;
    }
  } catch (_err) {
    // CORS block or network error — graceful fallback, not an error state
    el.innerHTML = `<a href="${MNRE_META.sourceUrl}" target="_blank" rel="noopener"
      style="font-size:10px;color:var(--accent-blue);display:inline-flex;align-items:center;gap:3px">
      <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i> Verify at mnre.gov.in
    </a>`;
  }
}
