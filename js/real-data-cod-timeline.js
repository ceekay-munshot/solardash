/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Upcoming COD Timeline
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 4 → "Upcoming COD Timeline" block ONLY.

   METHODOLOGY
   ─────────────
   Projected COD = LoA date + standard SECI commissioning term:
     Solar (utility-scale):  18 months from LoA signing
     Solar + BESS / FDRE / RTC / Hybrid: 24 months from LoA signing
   SECI may grant extensions; dates shown are original LOA-term targets.

   SCOPE: Apr 2026 – Mar 2027 (12-month forward window from data cutoff).

   SOURCES: Confirmed SECI/GUVNL award records only. Developer splits sourced
   from official SECI result announcements corroborated by trade press citing
   official results. No unconfirmed splits included.

   NO BSE REG-30 CONFIRMED COMMISSIONING INTIMATIONS ARE USED HERE.
   When available, BSE/NSE Reg-30 "intimation of commissioning" filings by
   listed developers (Adani Green, ReNew Power) will provide actual COD dates
   that supersede these projections.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── COD Timeline Rows ────────────────────────────────────────────────────────
   Fields:
     date        string — displayed in the card timeline (quarter or "Mon YYYY")
     project     string — scheme label for display
     dev         string — developer name
     mw          number — developer's awarded capacity in MW
     type        string — Solar | Solar+BESS
     state       string — state or "ISTS" for inter-state projects (state TBD)
     awardDate   string — month + year when LoA was issued
     planCOD     string — LOA-term target commissioning date
     scheme      string — tender scheme identifier
     sourceNote  string — award provenance
   ─────────────────────────────────────────────────────────────────────────── */
const COD_TIMELINE_ROWS = [

  // ── SECI-ISTS-XVI · 500 MW Solar · LoA Aug 2024 · Plan COD Feb 2026 ────────
  //    As of Apr 2026, projects are ~2 months past the LOA-term deadline.
  //    BSE Reg-30 intimations (if filed) would confirm actual COD; absent those,
  //    projects are treated as Under Construction with a schedule slip.
  {
    date:       'Q4 FY26 – Q1 FY27',
    project:    'SECI-ISTS-XVI · 250 MW Solar',
    dev:        'SAEL',
    mw:         250,
    type:       'Solar',
    state:      'ISTS',
    awardDate:  'Aug 2024',
    planCOD:    'Feb 2026',
    scheme:     'SECI-ISTS-XVI',
    sourceNote: 'Mercom India Aug 2024: SAEL 250 MW @ ₹2.48/kWh. LOA 18 months from Aug 2024 → Feb 2026; 2 months past plan as of Apr 2026.',
  },
  {
    date:       'Q4 FY26 – Q1 FY27',
    project:    'SECI-ISTS-XVI · 200 MW Solar',
    dev:        'NTPC REL',
    mw:         200,
    type:       'Solar',
    state:      'ISTS',
    awardDate:  'Aug 2024',
    planCOD:    'Feb 2026',
    scheme:     'SECI-ISTS-XVI',
    sourceNote: 'Mercom India Aug 2024: NTPC REL 200 MW @ ₹2.49/kWh. LOA 18 months from Aug 2024 → Feb 2026.',
  },
  {
    date:       'Q1 FY27',
    project:    'SECI-ISTS-XVI · 50 MW Solar',
    dev:        'BluPine Energy',
    mw:         50,
    type:       'Solar',
    state:      'ISTS',
    awardDate:  'Aug 2024',
    planCOD:    'Feb 2026',
    scheme:     'SECI-ISTS-XVI',
    sourceNote: 'Mercom India Aug 2024: BluPine 50 MW @ ₹2.48/kWh. LOA 18 months from Aug 2024 → Feb 2026.',
  },

  // ── SECI-ISTS-XVIII · 600 MW Solar · LoA Dec 2024 · Plan COD Jun 2026 ───────
  {
    date:       'Jun 2026',
    project:    'SECI-ISTS-XVIII · 300 MW Solar',
    dev:        'ACME Solar',
    mw:         300,
    type:       'Solar',
    state:      'ISTS',
    awardDate:  'Dec 2024',
    planCOD:    'Jun 2026',
    scheme:     'SECI-ISTS-XVIII',
    sourceNote: 'Power Line Magazine Dec 27 2024: ACME 300 MW @ ₹3.05/kWh. LOA 18 months from Dec 2024 → Jun 2026.',
  },
  {
    date:       'Jun 2026',
    project:    'SECI-ISTS-XVIII · 250 MW Solar',
    dev:        'ReNew Power',
    mw:         250,
    type:       'Solar',
    state:      'ISTS',
    awardDate:  'Dec 2024',
    planCOD:    'Jun 2026',
    scheme:     'SECI-ISTS-XVIII',
    sourceNote: 'Power Line Magazine Dec 27 2024: ReNew 250 MW @ ₹3.04/kWh. LOA 18 months from Dec 2024 → Jun 2026.',
  },
  {
    date:       'Jun – Sep 2026',
    project:    'SECI-ISTS-XVIII · 50 MW Solar',
    dev:        'Adani Green',
    mw:         50,
    type:       'Solar',
    state:      'ISTS',
    awardDate:  'Dec 2024',
    planCOD:    'Jun 2026',
    scheme:     'SECI-ISTS-XVIII',
    sourceNote: 'Power Line Magazine Dec 27 2024: Adani Green 50 MW @ ₹3.10/kWh. LOA 18 months from Dec 2024 → Jun 2026.',
  },

  // ── GUVNL 250 MW Solar · Gujarat · LoA Mar 2025 · Plan COD Sep 2026 ─────────
  {
    date:       'Sep 2026',
    project:    'GUVNL 250 MW Solar · 50 MW',
    dev:        'Welspun',
    mw:         50,
    type:       'Solar',
    state:      'Gujarat',
    awardDate:  'Mar 2025',
    planCOD:    'Sep 2026',
    scheme:     'GUVNL-250-SOL',
    sourceNote: 'SE Mar 2025: Welspun 50 MW @ ₹2.60/kWh. GUVNL project; LOA 18 months from Mar 2025 → Sep 2026.',
  },
  {
    date:       'Sep 2026',
    project:    'GUVNL 250 MW Solar · 100 MW',
    dev:        'Avaada Energy',
    mw:         100,
    type:       'Solar',
    state:      'Gujarat',
    awardDate:  'Mar 2025',
    planCOD:    'Sep 2026',
    scheme:     'GUVNL-250-SOL',
    sourceNote: 'SE Mar 2025: Avaada 100 MW @ ₹2.60/kWh. GUVNL project; LOA 18 months from Mar 2025 → Sep 2026.',
  },
  {
    date:       'Sep 2026',
    project:    'GUVNL 250 MW Solar · 100 MW',
    dev:        'SAEL',
    mw:         100,
    type:       'Solar',
    state:      'Gujarat',
    awardDate:  'Mar 2025',
    planCOD:    'Sep 2026',
    scheme:     'GUVNL-250-SOL',
    sourceNote: 'SE Mar 2025: SAEL 100 MW @ ₹2.60/kWh. GUVNL project; LOA 18 months from Mar 2025 → Sep 2026.',
  },

  // ── SECI-ISTS-XV · 1200 MW Solar+BESS · LoA Mar 2025 · Plan COD Mar 2027 ────
  //    Three winners; per-developer MW split not disclosed — shown as indicative
  //    equal thirds (~400 MW each). Source does not confirm individual allocations.
  {
    date:       'Mar 2027',
    project:    'SECI-ISTS-XV Solar+BESS · ~400 MW',
    dev:        'Pace Digitech',
    mw:         400,
    type:       'Solar+BESS',
    state:      'ISTS',
    awardDate:  'Mar 2025',
    planCOD:    'Mar 2027',
    scheme:     'SECI-ISTS-XV',
    sourceNote: 'IESA India ESS Market Report Oct 2025: 1200 MW awarded to Pace Digitech, ACME, HFE at ₹3.41–3.42/kWh. Per-developer MW split is indicative (1200 ÷ 3). LOA 24 months from Mar 2025 → Mar 2027.',
  },
  {
    date:       'Mar 2027',
    project:    'SECI-ISTS-XV Solar+BESS · ~400 MW',
    dev:        'ACME Solar',
    mw:         400,
    type:       'Solar+BESS',
    state:      'ISTS',
    awardDate:  'Mar 2025',
    planCOD:    'Mar 2027',
    scheme:     'SECI-ISTS-XV',
    sourceNote: 'IESA India ESS Market Report Oct 2025: 1200 MW awarded to Pace Digitech, ACME, HFE at ₹3.41–3.42/kWh. Per-developer MW split is indicative (1200 ÷ 3). LOA 24 months from Mar 2025 → Mar 2027.',
  },
  {
    date:       'Mar 2027',
    project:    'SECI-ISTS-XV Solar+BESS · ~400 MW',
    dev:        'HFE',
    mw:         400,
    type:       'Solar+BESS',
    state:      'ISTS',
    awardDate:  'Mar 2025',
    planCOD:    'Mar 2027',
    scheme:     'SECI-ISTS-XV',
    sourceNote: 'IESA India ESS Market Report Oct 2025: 1200 MW awarded to Pace Digitech, ACME, HFE at ₹3.41–3.42/kWh. Per-developer MW split is indicative (1200 ÷ 3). LOA 24 months from Mar 2025 → Mar 2027.',
  },

];

const COD_TIMELINE_META = {
  cutoffDate:  '15 Apr 2026',
  window:      'Apr 2026 – Mar 2027',
  method:      'Projected COD = LoA date + standard SECI commissioning term (18 months for Solar; 24 months for Solar+BESS). Derived from confirmed SECI/GUVNL award announcements. Per-developer splits reflect official results where disclosed (SECI-XVI, SECI-XVIII, GUVNL-250) or are indicated as equal thirds where not disclosed (SECI-XV).',
  disclaimer:  'Dates are projections based on LOA terms, not confirmed BSE Reg-30 "intimation of commissioning" notices. SECI grants extensions on application. Actual COD may differ due to land, grid, finance, or regulatory delays.',
  sources:     [
    'Mercom India Aug 2024 (SECI-ISTS-XVI award)',
    'Power Line Magazine Dec 27 2024 (SECI-ISTS-XVIII award)',
    'SE Mar 2025 / saurenergy.com (GUVNL 250 MW award)',
    'IESA India ESS Market Report Oct 2025 (SECI-ISTS-XV award)',
  ],
  totalProjectedMW: null,  // computed below
};
COD_TIMELINE_META.totalProjectedMW = COD_TIMELINE_ROWS.reduce((a, r) => a + r.mw, 0);

/* ── Self-check ───────────────────────────────────────────────────────────── */
(function() {
  if (!Array.isArray(COD_TIMELINE_ROWS) || !COD_TIMELINE_ROWS.length)
    throw new Error('COD_TIMELINE_ROWS: empty');
  COD_TIMELINE_ROWS.forEach((r, i) => {
    if (!r.date || !r.project || !r.dev || typeof r.mw !== 'number' || r.mw <= 0)
      throw new Error('COD_TIMELINE_ROWS[' + i + ']: missing or invalid field for ' + (r.dev || 'unknown'));
  });
})();
