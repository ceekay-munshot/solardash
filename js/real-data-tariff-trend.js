/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Quarterly Average L1 Discovered Tariff — Utility-Scale Solar
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 3 → "Tariff Discovery Trend" chart ONLY
   ───────────────────────────────────────────────────────────────────────────

   STRICT SCOPE (v1)
     Utility-scale Solar ONLY.  Explicitly excludes: Solar + BESS, FDRE, RTC,
     Hybrid (Wind-Solar), Wind, Pumped Storage, standalone BESS, EPC packages,
     module supply, rooftop/RESCO, sub-100 MW. Mixing storage-linked or
     firm-power tariffs would distort the "solar L1" series because BESS /
     FDRE / RTC tariffs carry storage premiums.

   TARIFF DEFINITION
     L1 = lowest explicit tariff awarded in the auction result announcement,
     in ₹/kWh. Only populated when the number appears verbatim in a SECI
     result page, a SECI press release, or an official issuer result
     announcement (GUVNL, RUMSL) published as a public document.

   QUARTER ASSIGNMENT
     Uses the RESULT / LoA announcement-date quarter (India FY, Apr–Mar),
     NOT the tender issue quarter. Same quarter keys as TENDER_FLOW_DATA
     so this chart aligns visually with the Tender Flow chart.

   AGGREGATION
     Arithmetic mean of per-tender L1 values within each quarter.
     Quarters with no pure-solar utility award return null (chart gap).

   SOURCES (priority order)
     1. SECI tenders/results page — https://www.seci.co.in/tenders
     2. Official issuer result announcement (GUVNL, RUMSL) where L1 is
        explicitly published as a public document.
     3. Corroborating trade-press citation of the official issuer result
        (Mercom, RenewableWatch, SaurEnergy, JMK monthly RE update) —
        used ONLY as a cross-reference to the official number, never as
        the sole source.

   CUTOFF: 15 Apr 2026 (same as TENDER_META.fetchedOn).
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const SOLAR_TARIFF_META = {
  cutoffDate:     '15 Apr 2026',
  scope:          'Utility-scale Solar only (≥100 MW). Storage-linked, firm-power, hybrid and wind tenders excluded.',
  tariffBasis:    'L1 (lowest explicit awarded tariff) per tender result, ₹/kWh.',
  quarterBasis:   'Result / LoA announcement date quarter (India FY, Apr-Mar).',
  aggregation:    'Arithmetic mean of per-tender L1 values per quarter. Quarters with no pure-solar award render as null (gap).',
  primarySource:  'https://www.seci.co.in/tenders',
  note:           'Post Q3 FY25 SECI-ISTS pipeline shifted to Solar+BESS structures; pure-solar award points in this series come mainly from GUVNL and RUMSL for FY26.',
};

/* ═══════════════════════════════════════════════════════════════════════════
   SOLAR-ONLY AWARD RECORDS WITH EXPLICIT L1 TARIFF
   ───────────────────────────────────────────────────────────────────────────
   Each record = one utility-scale solar tender with an officially published
   L1 tariff. id / scheme / issuer reference the same identifiers as
   TENDER_ROWS and TENDER_FLOW_RECORDS so the chart stays linked to the main
   register.
   ═══════════════════════════════════════════════════════════════════════════ */
const SOLAR_TARIFF_RECORDS = [

  {
    id:            'SECI000139',
    scheme:        'SECI-ISTS-XVI',
    issuer:        'SECI',
    type:          'Solar',
    tenderedMW:    1200,
    awardedMW:     500,   // partial award — 500 MW of 1200 MW tendered
    awardedQ:      'Q2 FY25',
    awardDate:     'Aug 2024',
    l1Tariff:      2.48,
    l1Bidder:      'SAEL (250 MW)',
    tariffNote:    'L1 ₹2.48/kWh: SAEL 250 MW. Next ₹2.49: NTPC REL 200 MW, BluPine 50 MW.',
    sourceUrl:     'https://www.seci.co.in/tenders',
    sourceNote:    'SECI official result; cross-ref Mercom India Aug 2024.',
  },

  {
    id:            'SECI000171',
    scheme:        'SECI-ISTS-XVIII',
    issuer:        'SECI',
    type:          'Solar',
    tenderedMW:    1000,
    awardedMW:     600,   // partial award — 600 MW of 1000 MW tendered
    awardedQ:      'Q3 FY25',
    awardDate:     'Dec 2024',
    l1Tariff:      3.04,
    l1Bidder:      'ReNew (250 MW)',
    tariffNote:    'L1 ₹3.04/kWh: ReNew 250 MW. ACME 300 MW @ ₹3.05. Adani Green 50 MW @ ₹3.10.',
    sourceUrl:     'https://www.seci.co.in/tenders',
    sourceNote:    'SECI official result (e-Reverse Auction 24 Dec 2024); cross-ref Power Line Magazine 27 Dec 2024.',
  },

  {
    id:            'RUMSL-170-SOL',
    scheme:        'RUMSL Solar 170 MW',
    issuer:        'RUMSL',
    type:          'Solar',
    tenderedMW:    170,
    awardedMW:     170,
    awardedQ:      'Q3 FY25',
    awardDate:     'Dec 2024',
    l1Tariff:      2.15,
    l1Bidder:      'Waaree (170 MW)',
    tariffNote:    'Waaree bagged 170 MW at ₹2.15/kWh.',
    sourceUrl:     'https://www.rumsl.co.in/',
    sourceNote:    'RUMSL (Rewa Ultra Mega Solar Ltd, MP) official result; cross-ref JMK Dec 2024 RE Update.',
  },

  {
    id:            'GUVNL-250-SOL',
    scheme:        'GUVNL Solar 250 MW',
    issuer:        'GUVNL',
    type:          'Solar',
    tenderedMW:    250,
    awardedMW:     250,
    awardedQ:      'Q4 FY25',
    awardDate:     'Mar 2025',
    l1Tariff:      2.60,
    l1Bidder:      'Welspun 50 MW + Avaada 100 MW + SAEL 100 MW (tied)',
    tariffNote:    'All awarded capacity priced at ₹2.60/kWh: Welspun 50 MW, Avaada 100 MW, SAEL 100 MW. 250 MW + 250 MW greenshoe option.',
    sourceUrl:     'https://www.guvnl.com/',
    sourceNote:    'GUVNL official result announcement; cross-ref SaurEnergy Mar 2025.',
  },

  {
    id:            'GUVNL-625-SOL',
    scheme:        'GUVNL Solar 625 MWp',
    issuer:        'GUVNL',
    type:          'Solar',
    tenderedMW:    625,
    awardedMW:     625,
    awardedQ:      'Q4 FY26',
    awardDate:     'Mar 2026',
    l1Tariff:      2.34,
    l1Bidder:      'Welspun 300 MW + NLC India 300 MW (tied)',
    tariffNote:    'All awarded capacity priced at ₹2.34/kWh: Welspun 300 MW, NLC India 300 MW. Record-low GUVNL solar tariff.',
    sourceUrl:     'https://www.guvnl.com/',
    sourceNote:    'GUVNL official result announcement ~23 Mar 2026; cross-ref RenewableWatch 23 Mar 2026.',
  },

];

/* ═══════════════════════════════════════════════════════════════════════════
   QUARTER WINDOW — matches TENDER_FLOW_DATA (Q4 FY24 → Q4 FY26)
   ═══════════════════════════════════════════════════════════════════════════ */
const SOLAR_TARIFF_QUARTERS = [
  'Q4 FY24', 'Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25',
  'Q1 FY26', 'Q2 FY26', 'Q3 FY26', 'Q4 FY26',
];

function deriveSolarTariffTrend() {
  const bins = {};
  SOLAR_TARIFF_QUARTERS.forEach(q => { bins[q] = []; });
  SOLAR_TARIFF_RECORDS.forEach(r => {
    if (r.type !== 'Solar') return;                         // strict scope guard
    if (r.l1Tariff === null || r.l1Tariff === undefined) return;
    if (!bins[r.awardedQ]) return;
    bins[r.awardedQ].push({ l1: r.l1Tariff, id: r.id, scheme: r.scheme, issuer: r.issuer });
  });

  const avgL1 = SOLAR_TARIFF_QUARTERS.map(q => {
    if (bins[q].length === 0) return null;
    const s = bins[q].reduce((acc, r) => acc + r.l1, 0);
    return +(s / bins[q].length).toFixed(2);
  });

  return {
    labels:      SOLAR_TARIFF_QUARTERS,
    avgL1,
    tenderCount: SOLAR_TARIFF_QUARTERS.map(q => bins[q].length),
    quarterBins: bins,
  };
}

const SOLAR_TARIFF_DATA = deriveSolarTariffTrend();

/* ── Self-check ─────────────────────────────────────────────────────────── */
(function selfCheck() {
  const nonNull = SOLAR_TARIFF_DATA.avgL1.filter(v => v !== null);
  if (nonNull.length === 0) {
    throw new Error('SOLAR_TARIFF_DATA: no non-null quarters — all records were filtered out');
  }
  SOLAR_TARIFF_RECORDS.forEach(r => {
    if (r.type !== 'Solar') {
      throw new Error(`SOLAR_TARIFF_RECORDS: ${r.id} has type "${r.type}" — only pure Solar allowed in this dataset`);
    }
    if (r.l1Tariff !== null && (r.l1Tariff < 1.0 || r.l1Tariff > 10.0)) {
      throw new Error(`SOLAR_TARIFF_RECORDS: ${r.id} l1Tariff ${r.l1Tariff} outside plausible ₹1-10/kWh range`);
    }
  });
})();
