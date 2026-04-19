/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Quarterly Average L1 Discovered Tariff — Utility-Scale Solar
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 3 → "Tariff Discovery Trend" chart ONLY
   ───────────────────────────────────────────────────────────────────────────

   SCOPE (v1 — STRICT)
   ─────────────────────
     • Utility-scale SOLAR ONLY (pure solar PV, ISTS or intra-state)
     • Excludes: Hybrid (Wind-Solar), FDRE, RTC, Solar + BESS, Pumped Storage,
                 Wind, standalone BESS, rooftop / RESCO, module-supply EPCs
     • Primary source: SECI official result / award documents
       (https://www.seci.co.in/tenders, /tenders/results)
     • Only tenders with an OFFICIALLY CONFIRMED public L1 tariff are included.
       Tariff value is the explicitly stated L1 (lowest) bid as announced in
       the official SECI result / press release (or in trade-press coverage
       that directly quotes the SECI result announcement).

   METHODOLOGY
   ─────────────
     Quarter system:  India FY (Apr–Mar) — Q1=Apr–Jun, Q2=Jul–Sep,
                                           Q3=Oct–Dec, Q4=Jan–Mar
     Quarter bucket:  AWARD / RESULT date quarter (NOT tender-issue quarter)
     Series value:    Arithmetic mean of all L1 tariffs (₹/kWh) for records
                      whose award quarter equals the bucket
     Missing quarter: No pure utility-scale SOLAR award in that quarter
                      (null → rendered as a gap in the line, not zero).
                      This is a real signal: SECI procurement has shifted to
                      Solar+BESS, FDRE, RTC and Hybrid in FY26, leaving pure
                      utility-scale solar awards sparse.

   NON-NEGOTIABLE RULES (mirrors user spec)
   ─────────────────────────────────────────
     • Award/result date quarter — never tender-issue quarter
     • Utility-scale solar only — no Hybrid / FDRE / RTC / BESS-linked tariffs
     • Only explicitly stated L1 discovered tariff — no invented values,
       no estimates, no averaging across non-solar categories

   CHART WINDOW
   ─────────────
     Q4 FY24 (Jan–Mar 2024) → Q4 FY26 (Jan–Mar 2026) — 9 quarters, aligned
     with the sibling "Tender Announcement vs Award Flow" chart for visual
     consistency.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Award-level records ────────────────────────────────────────────────────
   Each record is ONE utility-scale pure-solar award event with an explicitly
   stated L1 discovered tariff. tariffL1 = lowest winning bid in ₹/kWh.
   ─────────────────────────────────────────────────────────────────────────── */
const TARIFF_TREND_RECORDS = [

  {
    id:          'SECI000139',
    scheme:      'SECI-ISTS-XVI',
    issuer:      'SECI',
    type:        'Solar (Utility, ISTS)',
    awardedQ:    'Q2 FY25',               // Awarded Aug 2024
    awardedOn:   'Aug 2024',
    awardedMW:   500,                     // 500 MW awarded of 1200 MW tendered
    tariffL1:    2.48,                    // ₹/kWh — SAEL 250 MW (lowest)
    tariffRange: '₹2.48 (SAEL 250 MW) · ₹2.49 (NTPC REL 200 MW, BluPine 50 MW)',
    source:      'Mercom India, Aug 2024 — citing SECI auction result for ISTS-XVI',
    sourceUrl:   'https://seci.co.in/tenders/results',
    tenderUrl:   'https://seci.co.in/tenders/results',
  },

  {
    id:          'SECI000171',
    scheme:      'SECI-ISTS-XVIII',
    issuer:      'SECI',
    type:        'Solar (Utility, ISTS)',
    awardedQ:    'Q3 FY25',               // e-RA 24 Dec 2024; result 27 Dec 2024
    awardedOn:   'Dec 2024',
    awardedMW:   600,                     // 600 MW awarded of 1000 MW tendered
    tariffL1:    3.04,                    // ₹/kWh — ReNew 250 MW (lowest)
    tariffRange: '₹3.04 (ReNew 250 MW) · ₹3.05 (ACME 300 MW) · ₹3.10 (Adani Green 50 MW)',
    source:      'Power Line Magazine, 27 Dec 2024 — citing SECI ISTS-XVIII result',
    sourceUrl:   'https://seci.co.in/tenders/results',
    tenderUrl:   'https://seci.co.in/tenders/results',
  },

];

/* ═══════════════════════════════════════════════════════════════════════════
   DERIVED QUARTERLY AVERAGE L1 TARIFF
   Computed from TARIFF_TREND_RECORDS above — do not edit independently.
   ─────────────────────────────────────────────────────────────────────────── */

const TARIFF_TREND_QUARTER_ORDER = [
  'Q4 FY24', 'Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25',
  'Q1 FY26', 'Q2 FY26', 'Q3 FY26', 'Q4 FY26',
];

function deriveTariffTrend() {
  const buckets = {};
  TARIFF_TREND_QUARTER_ORDER.forEach(q => { buckets[q] = []; });

  TARIFF_TREND_RECORDS.forEach(r => {
    if (r.awardedQ && r.tariffL1 !== null && buckets[r.awardedQ] !== undefined) {
      buckets[r.awardedQ].push(r.tariffL1);
    }
  });

  const tariff = TARIFF_TREND_QUARTER_ORDER.map(q => {
    const arr = buckets[q];
    if (!arr.length) return null;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.round(mean * 100) / 100;
  });

  const counts = TARIFF_TREND_QUARTER_ORDER.map(q => buckets[q].length);

  return { labels: TARIFF_TREND_QUARTER_ORDER, tariff, counts };
}

const TARIFF_TREND_DATA = deriveTariffTrend();

/* ── Self-check ─────────────────────────────────────────────────────────── */
(function selfCheck() {
  const nonNull = TARIFF_TREND_DATA.tariff.filter(v => v !== null);
  if (nonNull.length === 0) {
    throw new Error('TARIFF_TREND_DATA: no L1 tariffs present');
  }
  nonNull.forEach(v => {
    if (typeof v !== 'number' || v <= 0 || v > 20) {
      throw new Error('TARIFF_TREND_DATA: implausible tariff ' + v);
    }
  });
})();

const TARIFF_TREND_META = {
  cutoffDate:   '15 Apr 2026',
  scope:        'Utility-scale SOLAR (pure PV) awards only — excludes Hybrid, FDRE, RTC, Solar+BESS, Wind, PSP, BESS-only, rooftop/RESCO, module supply',
  quarterLogic: 'India FY (Apr-Mar); bucketed by AWARD / RESULT announcement date',
  tariffRule:   'Explicitly stated L1 discovered tariff from official SECI result announcement only',
  sources:      'SECI results (seci.co.in/tenders/results); trade-press entries included only when they directly quote the SECI result announcement',
  primaryUrl:   'https://www.seci.co.in/tenders',
  resultsUrl:   'https://seci.co.in/tenders/results',
  recordCount:  TARIFF_TREND_RECORDS.length,
  quartersWithData: TARIFF_TREND_DATA.tariff.filter(v => v !== null).length,
  note:         'Gaps in the series = no pure utility-scale solar award in that quarter. Post Q3 FY25, SECI procurement has shifted to Solar+BESS, FDRE, RTC and Hybrid; pure utility-scale solar awards have been sparse by design, not by missing data.',
};
