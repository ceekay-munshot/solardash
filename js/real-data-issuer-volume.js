/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Issuer-Wise Tender Volume (FY26 — Apr 2025 to Mar 2026)
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 3 → "Issuer-Wise Tender Volume" horizontal bar chart ONLY
   ───────────────────────────────────────────────────────────────────────────

   PERIOD:  FY26 (01 Apr 2025 – 31 Mar 2026)  [same period as TYPE_MIX_META]
   FIELD:   Tender publication / notice date   [consistent with TYPE_MIX]
   SCOPE:   Utility-scale RE generation capacity tenders ≥ 100 MW
            (same exclusions as TYPE_MIX — see real-data-type-mix.js)

   DERIVATION: Grouped and summed from TYPE_MIX_RECORDS (real-data-type-mix.js).
   No separate source research required — this is a deterministic aggregation
   of the same tender-level records already sourced there.

   ISSUER COVERAGE (FY26 scope):
     Searched: SECI, NTPC/NTPC REL, NHPC, SJVN, GUVNL, RUMSL, MSEDCL, TANTRANSCO
     Found with confirmed FY26 tenders in scope: SECI, GUVNL, SJVN
     Not found (no confirmed FY26 generation-capacity selection tenders):
       • NTPC/NTPC REL — FY26 activity limited to EPC packages for own projects;
         last BOO generation-capacity tender: Jan 2025 (Q4 FY25, outside window)
       • NHPC — FY26 tenders are rooftop RESCO <100 MW (NHPC 23.34 MW J&K;
         NHPC 30.93 MW Haryana): below 100 MW scope threshold
       • RUMSL — last tracked award: 170 MW Dec 2024 (Q3 FY25); no FY26 tender
         confirmed within scope
       • MSEDCL — MERC approved MSEDCL 2,269 MW MSKVY 2.0 procurement plan
         but no corresponding tender notice confirmed as published in FY26
       • TANTRANSCO/TANGEDCO — routes through SECI for ISTS tenders; no direct
         FY26 generation-capacity BOO tender confirmed

   NOTE ON SCOPE INTEGRITY:
     The 10 tenders in TYPE_MIX_RECORDS cover all confirmed utility-scale
     generation capacity selection tenders (BOO/BOOT/TBCB) ≥ 100 MW published
     in FY26 from the issuers listed above. NTPC REL EPC packages and
     standalone BESS tenders are excluded per scope rules.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Issuer color palette ─────────────────────────────────────────────────── */
const ISSUER_COLORS = {
  'SECI':  '#3b82f6',   // blue   — central nodal agency, largest volume
  'GUVNL': '#f59e0b',   // amber  — state discom with direct tendering
  'SJVN':  '#22c55e',   // green  — central PSU hydro/RE
};
const ISSUER_FALLBACK_COLOR = '#6366f1'; // indigo for any unexpected issuer

/* ── Derive issuer aggregates from TYPE_MIX_RECORDS ─────────────────────── */
function deriveIssuerVolumeData() {
  if (typeof TYPE_MIX_RECORDS === 'undefined') {
    throw new Error('ISSUER_VOLUME: TYPE_MIX_RECORDS not loaded — check script order');
  }

  // Aggregate MW by issuer
  const totals = {};
  TYPE_MIX_RECORDS.forEach(r => {
    totals[r.issuer] = (totals[r.issuer] || 0) + r.mw;
  });

  // Sort descending by MW
  const sorted = Object.entries(totals)
    .map(([issuer, mw]) => ({
      issuer,
      mw,
      color: ISSUER_COLORS[issuer] || ISSUER_FALLBACK_COLOR,
      tenderCount: TYPE_MIX_RECORDS.filter(r => r.issuer === issuer).length,
    }))
    .sort((a, b) => b.mw - a.mw);

  const grandTotal = sorted.reduce((s, r) => s + r.mw, 0);

  return {
    rows:       sorted,
    labels:     sorted.map(r => r.issuer),
    mw:         sorted.map(r => r.mw),
    colors:     sorted.map(r => r.color),
    grandTotal,
    issuerCount: sorted.length,
  };
}

const ISSUER_VOLUME_DATA = deriveIssuerVolumeData();

const ISSUER_VOLUME_META = {
  fy:          TYPE_MIX_META.fy,
  period:      TYPE_MIX_META.period,
  totalMW:     ISSUER_VOLUME_DATA.grandTotal,
  issuerCount: ISSUER_VOLUME_DATA.issuerCount,
  cutoffDate:  TYPE_MIX_META.cutoffDate,
  field:       'Tender publication / notice date',
  note:        'Derived by grouping TYPE_MIX_RECORDS (real-data-type-mix.js) by issuer. Same scope, same period, same date field.',
  notFound:    'NTPC/NTPC REL, NHPC, RUMSL, MSEDCL, TANTRANSCO — no confirmed FY26 generation-capacity selection tenders in scope',
};
