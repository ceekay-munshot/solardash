/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Project Execution Detail Table
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 4 → "Project Execution Detail Table" block ONLY.

   METHODOLOGY
   ─────────────
   Projects are derived from confirmed SECI/GUVNL award records in
   real-data-tenders-flow.js. For each award with known per-developer MW,
   one row is created per developer.

   FIELDS:
     project    — scheme label + developer
     state      — "ISTS" for SECI ISTS-connected projects (exact state not
                  confirmed; CEA plant-wise is robots-blocked); state name for
                  issuer-state projects (e.g., "Gujarat" for GUVNL)
     dev        — developer name
     mw         — awarded MW (indicative if split not disclosed)
     status     — Under Construction | Partial COD | Commissioned | Delayed
     awardDate  — Month YYYY string (LoA issuance month)
     planCOD    — Month YYYY string (LoA term target)
     lag        — months from LoA to projected/actual COD (award-to-COD duration)
                  For on-schedule: lag = LOA term (18 or 24)
                  For delayed: lag = LOA term + slippage months
     issue      — "None" | delay category string

   STATUS IS INDICATIVE. Sourced from tender award data and standard LOA timelines,
   not from BSE Reg-30 commissioning intimations (which would be authoritative
   for listed developers). For NTPC REL, SJVN, NLC: check MoP / official IR pages.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const PROJECT_TABLE_ROWS = [

  // ── SECI-ISTS-XVI · 500 MW Solar · LoA Aug 2024 ─────────────────────────────
  //    Plan COD: Feb 2026 (18 months). As of Apr 2026: 2 months behind plan.
  {
    project:    'SECI-XVI · SAEL 250 MW',
    state:      'ISTS',
    dev:        'SAEL',
    mw:         250,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Aug 2024',
    planCOD:    'Feb 2026',
    lag:        20,
    issue:      'Schedule slip',
    scheme:     'SECI-ISTS-XVI',
    sourceNote: 'Mercom India Aug 2024 (SAEL 250 MW @ ₹2.48/kWh). LOA 18 months → Feb 2026; 2 months past plan as of Apr 2026.',
  },
  {
    project:    'SECI-XVI · NTPC REL 200 MW',
    state:      'ISTS',
    dev:        'NTPC REL',
    mw:         200,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Aug 2024',
    planCOD:    'Feb 2026',
    lag:        20,
    issue:      'Schedule slip',
    scheme:     'SECI-ISTS-XVI',
    sourceNote: 'Mercom India Aug 2024 (NTPC REL 200 MW @ ₹2.49/kWh). LOA 18 months → Feb 2026; 2 months past plan as of Apr 2026.',
  },
  {
    project:    'SECI-XVI · BluPine 50 MW',
    state:      'ISTS',
    dev:        'BluPine Energy',
    mw:         50,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Aug 2024',
    planCOD:    'Feb 2026',
    lag:        20,
    issue:      'Schedule slip',
    scheme:     'SECI-ISTS-XVI',
    sourceNote: 'Mercom India Aug 2024 (BluPine 50 MW @ ₹2.48/kWh). LOA 18 months → Feb 2026; 2 months past plan as of Apr 2026.',
  },

  // ── SECI-ISTS-XVIII · 600 MW Solar · LoA Dec 2024 ───────────────────────────
  //    Plan COD: Jun 2026 (18 months). As of Apr 2026: on schedule.
  {
    project:    'SECI-XVIII · ACME 300 MW',
    state:      'ISTS',
    dev:        'ACME Solar',
    mw:         300,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Dec 2024',
    planCOD:    'Jun 2026',
    lag:        18,
    issue:      'None',
    scheme:     'SECI-ISTS-XVIII',
    sourceNote: 'Power Line Dec 27 2024 (ACME 300 MW @ ₹3.05/kWh). LOA 18 months → Jun 2026; on schedule as of Apr 2026.',
  },
  {
    project:    'SECI-XVIII · ReNew 250 MW',
    state:      'ISTS',
    dev:        'ReNew Power',
    mw:         250,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Dec 2024',
    planCOD:    'Jun 2026',
    lag:        18,
    issue:      'None',
    scheme:     'SECI-ISTS-XVIII',
    sourceNote: 'Power Line Dec 27 2024 (ReNew 250 MW @ ₹3.04/kWh). LOA 18 months → Jun 2026; on schedule as of Apr 2026.',
  },
  {
    project:    'SECI-XVIII · Adani Green 50 MW',
    state:      'ISTS',
    dev:        'Adani Green',
    mw:         50,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Dec 2024',
    planCOD:    'Jun 2026',
    lag:        18,
    issue:      'None',
    scheme:     'SECI-ISTS-XVIII',
    sourceNote: 'Power Line Dec 27 2024 (Adani Green 50 MW @ ₹3.10/kWh). LOA 18 months → Jun 2026; on schedule as of Apr 2026.',
  },

  // ── GUVNL 250 MW Solar · Gujarat · LoA Mar 2025 ─────────────────────────────
  //    Plan COD: Sep 2026 (18 months). As of Apr 2026: on schedule.
  {
    project:    'GUVNL 250 MW · Welspun 50 MW',
    state:      'Gujarat',
    dev:        'Welspun',
    mw:         50,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Mar 2025',
    planCOD:    'Sep 2026',
    lag:        18,
    issue:      'None',
    scheme:     'GUVNL-250-SOL',
    sourceNote: 'SE Mar 2025 (Welspun 50 MW @ ₹2.60/kWh; GUVNL). LOA 18 months → Sep 2026.',
  },
  {
    project:    'GUVNL 250 MW · Avaada 100 MW',
    state:      'Gujarat',
    dev:        'Avaada Energy',
    mw:         100,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Mar 2025',
    planCOD:    'Sep 2026',
    lag:        18,
    issue:      'None',
    scheme:     'GUVNL-250-SOL',
    sourceNote: 'SE Mar 2025 (Avaada 100 MW @ ₹2.60/kWh; GUVNL). LOA 18 months → Sep 2026.',
  },
  {
    project:    'GUVNL 250 MW · SAEL 100 MW',
    state:      'Gujarat',
    dev:        'SAEL',
    mw:         100,
    type:       'Solar',
    status:     'Under Construction',
    awardDate:  'Mar 2025',
    planCOD:    'Sep 2026',
    lag:        18,
    issue:      'None',
    scheme:     'GUVNL-250-SOL',
    sourceNote: 'SE Mar 2025 (SAEL 100 MW @ ₹2.60/kWh; GUVNL). LOA 18 months → Sep 2026.',
  },

  // ── SECI-ISTS-XV · 1200 MW Solar+BESS · LoA Mar 2025 ────────────────────────
  //    Plan COD: Mar 2027 (24 months). As of Apr 2026: on schedule.
  //    MW split among 3 winners not disclosed; ~400 MW each is indicative.
  {
    project:    'SECI-XV Solar+BESS · ~400 MW',
    state:      'ISTS',
    dev:        'Pace Digitech',
    mw:         400,
    type:       'Solar+BESS',
    status:     'Under Construction',
    awardDate:  'Mar 2025',
    planCOD:    'Mar 2027',
    lag:        24,
    issue:      'None',
    scheme:     'SECI-ISTS-XV',
    sourceNote: 'IESA ESS Oct 2025 (Pace Digitech, ACME, HFE awarded 1200 MW at ₹3.41–3.42/kWh). Per-developer split indicative (1200 ÷ 3). LOA 24 months → Mar 2027.',
  },
  {
    project:    'SECI-XV Solar+BESS · ~400 MW',
    state:      'ISTS',
    dev:        'ACME Solar',
    mw:         400,
    type:       'Solar+BESS',
    status:     'Under Construction',
    awardDate:  'Mar 2025',
    planCOD:    'Mar 2027',
    lag:        24,
    issue:      'None',
    scheme:     'SECI-ISTS-XV',
    sourceNote: 'IESA ESS Oct 2025 (Pace Digitech, ACME, HFE awarded 1200 MW at ₹3.41–3.42/kWh). Per-developer split indicative (1200 ÷ 3). LOA 24 months → Mar 2027.',
  },
  {
    project:    'SECI-XV Solar+BESS · ~400 MW',
    state:      'ISTS',
    dev:        'HFE',
    mw:         400,
    type:       'Solar+BESS',
    status:     'Under Construction',
    awardDate:  'Mar 2025',
    planCOD:    'Mar 2027',
    lag:        24,
    issue:      'None',
    scheme:     'SECI-ISTS-XV',
    sourceNote: 'IESA ESS Oct 2025 (Pace Digitech, ACME, HFE awarded 1200 MW at ₹3.41–3.42/kWh). Per-developer split indicative (1200 ÷ 3). LOA 24 months → Mar 2027.',
  },

];

const PROJECT_TABLE_META = {
  cutoffDate:  '15 Apr 2026',
  method:      'Rows derived from confirmed SECI/GUVNL award records. Status is indicative — based on tender award dates and standard LOA timelines, not BSE Reg-30 commissioning intimations. State for ISTS projects is "ISTS" (exact location TBD — CEA plant-wise is robots-blocked). Lag = months from LoA issuance to projected/actual COD (on-schedule: 18 mo Solar; 24 mo Solar+BESS).',
  disclaimer:  'For listed developers (Adani Green, ReNew Power), actual project status will appear in BSE/NSE regulatory filings and quarterly investor presentations. SECI may grant commissioning extensions on application.',
  sources:     [
    'Mercom India Aug 2024 (SECI-ISTS-XVI result)',
    'Power Line Magazine Dec 27 2024 (SECI-ISTS-XVIII result)',
    'SE Mar 2025 / saurenergy.com (GUVNL 250 MW result)',
    'IESA India ESS Market Report Oct 2025 (SECI-ISTS-XV result)',
  ],
  totalRows:  null,  // computed below
  totalMW:    null,
};
PROJECT_TABLE_META.totalRows = PROJECT_TABLE_ROWS.length;
PROJECT_TABLE_META.totalMW   = PROJECT_TABLE_ROWS.reduce((a, r) => a + r.mw, 0);

/* ── Self-check ───────────────────────────────────────────────────────────── */
(function() {
  if (!Array.isArray(PROJECT_TABLE_ROWS) || !PROJECT_TABLE_ROWS.length)
    throw new Error('PROJECT_TABLE_ROWS: empty');
  PROJECT_TABLE_ROWS.forEach((r, i) => {
    if (!r.project || !r.dev || typeof r.mw !== 'number' || r.mw <= 0)
      throw new Error('PROJECT_TABLE_ROWS[' + i + ']: missing or invalid field for ' + (r.dev || 'unknown'));
    if (typeof r.lag !== 'number' || r.lag < 0 || r.lag > 60)
      throw new Error('PROJECT_TABLE_ROWS[' + i + ']: lag out of plausible range for ' + r.dev);
  });
})();
