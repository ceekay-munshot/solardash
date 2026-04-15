/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Tender Type Mix (FY26 — Apr 2025 to Mar 2026)
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 3 → "Tender Type Mix (FY YTD)" donut chart ONLY
   ───────────────────────────────────────────────────────────────────────────

   PERIOD: FY26 — 01 Apr 2025 to 31 Mar 2026
   Rationale: As of 15 Apr 2026 (data cutoff) India is 15 days into FY27.
   FY27 YTD contains only two small tenders (SECI000241: 80 MW short-term,
   SECI000243: 4.4 MW rooftop). FY26 (just completed) provides meaningful
   data for investor context. Chart is labelled "FY26" not "FY27 YTD".

   DATE FIELD: Tender publication / notice date (consistent across all rows).

   CLASSIFICATION RULES (exactly one category per tender):
     Solar (Utility)  = standalone utility-scale solar without mandatory ESS
     Hybrid           = wind-solar hybrid development tenders
     FDRE             = Firm & Dispatchable RE (including peak-specific)
     BESS + Solar     = solar paired with mandatory co-located battery storage
     RTC              = Round-the-clock power (including Thermal Mimic variant)
     Others           = Wind-only, Pumped Storage, offshore, other RE types

   SCOPE: Utility-scale RE generation capacity tenders ≥ 100 MW.
   Excludes: EPC packages, module supply, standalone BESS-only,
   green hydrogen, rooftop/RESCO, short-term power procurement, sub-100 MW.

   SOURCE HIERARCHY:
     1. SECI official tenders page — seci.co.in/tenders (fetched 15 Apr 2026)
        and results page — seci.co.in/tenders/results (fetched 15 Apr 2026)
     2. SJVN official tender page — sjvn.nic.in
        corroborated: Mercom India Sep 2024; RenewableWatch Mar 2026
     3. GUVNL — corroborated via JMK May 2025 RE Update (issue date);
        RenewableWatch Mar 2026 (result/award confirmation)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Per-tender source records ──────────────────────────────────────────────
   Each entry = one tender notice issued in FY26 (Apr 2025 – Mar 2026)
   that qualifies under scope rules above.
   ─────────────────────────────────────────────────────────────────────────── */
const TYPE_MIX_RECORDS = [

  // ─── BESS + Solar ─────────────────────────────────────────────────────────

  {
    id: 'SECI000202', scheme: 'SECI-ISTS-XX',
    issuer: 'SECI', publishedDate: '12 Jun 2025',
    mw: 2000, category: 'BESS + Solar',
    source: 'SECI official results page (seci.co.in/tenders/results)',
    sourceUrl: 'https://seci.co.in/tender-details/YmJ1',
    note: '2000 MW Solar + 1000 MW/4000 MWh ESS. Mandatory co-located BESS.',
  },

  {
    id: 'SECI000204', scheme: 'SECI-ISTS-XXI',
    issuer: 'SECI', publishedDate: '19 Jun 2025',
    mw: 1200, category: 'BESS + Solar',
    source: 'SECI official results page (seci.co.in/tenders/results)',
    sourceUrl: 'https://seci.co.in/tender-details/YmJz',
    note: '1200 MW Solar + 600 MW/3600 MWh ESS. Mandatory co-located BESS.',
  },

  // ─── FDRE ─────────────────────────────────────────────────────────────────

  {
    id: 'SECI000221', scheme: 'SECI-FDRE-VII',
    issuer: 'SECI', publishedDate: '30 Sep 2025',
    mw: 1200, category: 'FDRE',
    source: 'SECI official results page (seci.co.in/tenders/results)',
    sourceUrl: 'https://seci.co.in/tender-details/YmB2',
    note: '1200 MW FDRE Peak-specific (4800 MWh). Assured peak supply 4 hrs/day.',
  },

  {
    id: 'SECI000229', scheme: 'SECI-FDRE-VIII',
    issuer: 'SECI', publishedDate: '26 Dec 2025',
    mw: 1000, category: 'FDRE',
    source: 'SECI official live tenders page (seci.co.in/tenders; fetched 15 Apr 2026)',
    sourceUrl: 'https://seci.co.in/tender-details/YmB-',
    note: '1000 MW Excess Power FDRE-VIII. Open at data cutoff (bid deadline 27 Apr 2026).',
  },

  // ─── Others (Wind) ────────────────────────────────────────────────────────

  {
    id: 'SECI000222', scheme: 'SECI-Wind-XIX',
    issuer: 'SECI', publishedDate: '15 Oct 2025',
    mw: 1200, category: 'Others',
    subtype: 'Wind',
    source: 'SECI official results page (seci.co.in/tenders/results)',
    sourceUrl: 'https://seci.co.in/tender-details/YmB1',
    note: '1200 MW ISTS-connected Wind. Awarded Feb 2026 at ₹3.25–3.46/kWh (combined w/ Hybrid VIII+IX).',
  },

  {
    id: 'SJVN-WIND-600-FY26', scheme: 'SJVN Wind 600 MW',
    issuer: 'SJVN', publishedDate: 'Sep 2025',
    mw: 600, category: 'Others',
    subtype: 'Wind',
    source: 'Mercom India Sep 9 2025: "SJVN has issued a request for selection to set up 600 MW ISTS-connected wind projects… bid deadline Oct 31, 2025"; RenewableWatch Mar 2 2026: "tender was floated in September 2025"',
    sourceUrl: 'https://sjvn.nic.in/',
    note: '600 MW ISTS Wind (BOO). Awarded Mar 2026 — KPI Green 300 MW + Urdhvaga 120 MW + Adyant 110 MW + Lambent 70 MW at ₹3.64–3.65/kWh.',
  },

  // ─── Others (Pumped Storage) ───────────────────────────────────────────────

  {
    id: 'SECI000230', scheme: 'SECI-PSP-I',
    issuer: 'SECI', publishedDate: '26 Dec 2025',
    mw: 1200, category: 'Others',
    subtype: 'Pumped Storage',
    source: 'SECI official live tenders page (seci.co.in/tenders; fetched 15 Apr 2026)',
    sourceUrl: 'https://seci.co.in/tender-details/YmF3',
    note: '1200 MW/9600 MWh Pumped Storage PSP-I. First SECI PSP tender. Open at data cutoff (bid deadline 24 Apr 2026).',
  },

  // ─── RTC ──────────────────────────────────────────────────────────────────

  {
    id: 'SECI000240', scheme: 'SECI-RTC-TM-V',
    issuer: 'SECI', publishedDate: '10 Mar 2026',
    mw: 1000, category: 'RTC',
    source: 'SECI official live tenders page (seci.co.in/tenders; fetched 15 Apr 2026)',
    sourceUrl: 'https://seci.co.in/tender-details/YmZ3',
    note: '1000 MW Round-the-Clock Thermal Mimic (RTC-TM). Open at data cutoff (bid deadline 04 May 2026).',
  },

  // ─── Solar (Utility) ──────────────────────────────────────────────────────

  {
    id: 'GUVNL-500-FY26', scheme: 'GUVNL Solar 500 MWp',
    issuer: 'GUVNL', publishedDate: 'May 2025',
    mw: 500, category: 'Solar (Utility)',
    source: 'JMK Research May 2025 RE Update: "GUVNL issued a 500 MW Solar tender with Green Shoe option of additional capacity up to 500 MW"',
    sourceUrl: 'https://jmkresearch.com/renewable-sector-published-reports/monthly-renewable-sector-update-utility-scale-solar-wind/monthly-re-update-may-2025/',
    note: '500 MW + 500 MW greenshoe. Plain utility-scale solar, no mandatory ESS.',
  },

  {
    id: 'GUVNL-625-FY26', scheme: 'GUVNL Solar 625 MWp',
    issuer: 'GUVNL', publishedDate: 'Oct 2025 (est)',
    mw: 625, category: 'Solar (Utility)',
    source: 'SaurEnergy Mar 2026: "awards come nearly five months after the tender was floated" → issue ~Oct 2025. Confirmed awarded Mar 2026 at ₹2.34/kWh (RenewableWatch Mar 23 2026).',
    sourceUrl: 'https://www.guvnl.com/',
    note: '625 MWp + 625 MWp greenshoe. Plain utility-scale solar. ALMM List-I + II compliant.',
  },

  // ─── Hybrid ── zero entries in FY26 ──────────────────────────────────────
  //
  // The last SECI Hybrid tenders in this dataset were:
  //   Hybrid-VIII (SECI000123): Published Feb 2024 (Q4 FY24)
  //   Hybrid-IX   (SECI000146): Published Jun 2024 (Q1 FY25)
  // No SECI or confirmed non-SECI Hybrid tender was published in FY26
  // (Apr 2025 – Mar 2026) within the scope tracked.
  // Hybrid = 0 MW is a real data point: pure solar-wind hybrid procurement
  // shifted toward FDRE and BESS+Solar structures in FY26.

];

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY DISPLAY CONFIG
   ─────────────────────────────────────────────────────────────────────────── */
const TYPE_MIX_CATEGORY_CONFIG = {
  'Solar (Utility)': { color: '#f59e0b', short: 'Solar' },
  'Hybrid':          { color: '#a855f7', short: 'Hybrid' },
  'FDRE':            { color: '#3b82f6', short: 'FDRE' },
  'BESS + Solar':    { color: '#22c55e', short: 'Solar+BESS' },
  'RTC':             { color: '#f97316', short: 'RTC' },
  'Others':          { color: '#14b8a6', short: 'Others' },
};

// Fixed order for consistent display (matches task category order)
const TYPE_MIX_DISPLAY_ORDER = [
  'Solar (Utility)', 'Hybrid', 'FDRE', 'BESS + Solar', 'RTC', 'Others',
];

/* ═══════════════════════════════════════════════════════════════════════════
   DERIVED AGGREGATES  — computed from records, do not edit directly
   ─────────────────────────────────────────────────────────────────────────── */
function deriveTypeMixAggregates() {
  const totals = {};
  TYPE_MIX_DISPLAY_ORDER.forEach(c => { totals[c] = 0; });

  TYPE_MIX_RECORDS.forEach(r => {
    if (totals[r.category] === undefined) {
      throw new Error('TYPE_MIX: unknown category "' + r.category + '" in record ' + r.id);
    }
    totals[r.category] += r.mw;
  });

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  if (grandTotal === 0) throw new Error('TYPE_MIX: grand total MW is 0');

  const categories = TYPE_MIX_DISPLAY_ORDER.map(cat => ({
    label:   cat,
    mw:      totals[cat],
    pct:     Math.round((totals[cat] / grandTotal) * 1000) / 10, // 1 decimal
    color:   TYPE_MIX_CATEGORY_CONFIG[cat].color,
    short:   TYPE_MIX_CATEGORY_CONFIG[cat].short,
  }));

  // Rounding correction: ensure percentages sum to exactly 100
  const pctSum = categories.reduce((s, c) => s + c.pct, 0);
  if (Math.abs(pctSum - 100) > 0.5) {
    // Adjust largest non-zero category
    const largest = [...categories].filter(c => c.mw > 0).sort((a,b) => b.mw - a.mw)[0];
    const idx = categories.indexOf(largest);
    categories[idx].pct = Math.round((categories[idx].pct + (100 - pctSum)) * 10) / 10;
  }

  return { categories, grandTotal, fy: 'FY26' };
}

const TYPE_MIX_DATA = deriveTypeMixAggregates();

/* ── Convenience arrays for chart ────────────────────────────────────────── */
const TYPE_MIX_LABELS  = TYPE_MIX_DATA.categories.map(c => c.label);
const TYPE_MIX_VALUES  = TYPE_MIX_DATA.categories.map(c => c.pct);
const TYPE_MIX_COLORS  = TYPE_MIX_DATA.categories.map(c => c.color);
const TYPE_MIX_MW      = TYPE_MIX_DATA.categories.map(c => c.mw);

const TYPE_MIX_META = {
  fy:          'FY26',
  period:      '01 Apr 2025 – 31 Mar 2026',
  totalMW:     TYPE_MIX_DATA.grandTotal,
  recordCount: TYPE_MIX_RECORDS.length,
  issuers:     [...new Set(TYPE_MIX_RECORDS.map(r => r.issuer))].join(', '),
  cutoffDate:  '15 Apr 2026',
  note:        'Tender publication date used consistently for all classification. Tenders classified by generation type, not storage type.',
};
