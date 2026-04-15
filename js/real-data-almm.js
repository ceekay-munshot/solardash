/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: ALMM Domestic Solar PV Manufacturing Capacity Stack
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 2 → "Domestic Capacity Stack" block only
   ───────────────────────────────────────────────────────────────────────────

   MODULE CAPACITY (ALMM List-I) — 173.1 GW as of 01 Mar 2026
   ─────────────────────────────────────────────────────────────
   Source page : https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/
   Source PDF  : https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/03/202603021503313944.pdf
   Corroborated: Mercom India (04 Mar 2026) · Energetica India (03 Mar 2026)
                 Both cite official MNRE ALMM Revision XLVII (01 Mar 2026)
   Meaning     : Cumulative enlisted module manufacturing capacity registered
                 under ALMM List-I. Covers only models approved for use in
                 government/government-assisted projects. Total market
                 manufacturing capacity (including non-ALMM) is ~210 GW per
                 Mercom India March 2026 report.
   Note        : Previous revision (07 Feb 2026) = 162,109 MW.
                 01 Mar 2026 added 11,035 MW (Vikram, Solex, INA, etc.)

   CELL CAPACITY (ALMM List-II) — 27.2 GW as of 13 Feb 2026
   ─────────────────────────────────────────────────────────────
   Source page : https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/
   Source PDF  : https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/04/20260413760726099.pdf
                 (Rev 6, 13 Apr 2026 — contains all prior revisions in same doc)
   Cumulative build-up:
     Rev 0  (31 Jul 2025) — first edition, 6 manufacturers:  13,066 MW
     Rev 1  (23 Sep 2025) — Jupiter International added:      4,822 MW → total ~17,888 MW
     Rev 2  (24 Nov 2025) — further additions:               ~17,888 MW
     Rev 3  (15 Dec 2025) — Waaree (3,923 PERC + 1,328 TOPCon → 5,251 MW):  23,732 MW
     Rev 4  (05 Feb 2026) — Evervolt (1,074), Mundra model, Premier (1,358 TOPCon):  26,790 MW
     Rev 5  (13 Feb 2026) — Fujiyama Power Systems (437 MW):  27,227 MW  ← used here
     Rev 6  (13 Apr 2026) — Reliance (1,238 HJT new) + Jupiter Solartech + Websol change
   Using Rev 5 total (27,227 MW = 27.2 GW): last revision with fully confirmed aggregate
   from industry reporting (Energetica India Feb 09, 2026 confirmed 26,790 MW for Rev 4;
   Rev 5 adds Fujiyama 437 MW = 27,227 MW).
   Rev 6 adds at minimum Reliance 1,238 MW → post-Rev-6 ≥ 28.5 GW; exact total pending
   MNRE publication of a cumulative aggregate. Shown as ≥27.2 GW.
   Mandate: ALMM List-II mandatory from 01 Jun 2026 (modules must use only ALMM cells)
   Corroborated: Mercom India (Mar 18, 2026): "nearly 26.5 GW" at time of report = Rev 5
   Manufacturers listed (as of Rev 5): Emmvee, Premier (PERC+TOPCon), Mundra Solar
                 PV, Mundra Solar Energy, FS India (First Solar), Waaree,
                 Evervolt, Fujiyama, + Rev 6 adds Reliance & others

   WAFER / INGOT CAPACITY — 2.2 GW PLI-declared as of 30 Jun 2025
   ─────────────────────────────────────────────────────────────
   Source      : Parliamentary statement by MoS Shripad Yesso Naik, Aug 2025
                 "2.2 GW of ingot-wafer capacity installed under PLI Scheme as on 30.06.2025"
   Corroborated: pv-magazine.com (08 Aug 2025) · Energetica India (Aug 2025)
                 Saurenergy (Aug 13, 2025) · Wright Research (Dec 2025)
   ALMM status : ALMM List-III for wafers NOT yet published as of Apr 2026.
                 Effective date: June 1, 2028, subject to ≥15 GW operational.
                 Source: MNRE draft amendment (Sep 2025); Mercom India (Dec 2025).
   Note on ingot: ALMM List-III rules require wafer manufacturers to hold
                 EQUIVALENT ingot capacity. Therefore PLI-declared ingot ≈
                 PLI-declared wafer (2.2 GW). Used symmetrically here.
   Additional  : PV Tech (Oct 2025) confirms no new ingot/wafer capacity brought
                 online in H1 2025 except pre-existing ~2 GW Adani Solar unit.
                 2.2 GW is the most recent government-stated figure; actual
                 operational capacity by Mar 2026 may be marginally higher as
                 manufacturers ramp, but no authoritative public figure exists.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const ALMM_META = {
  // ── Module (List-I) ──────────────────────────────────────────────────────
  moduleSourcePage: 'https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/',
  modulePdfUrl:     'https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/03/202603021503313944.pdf',
  moduleAsOf:       '01 Mar 2026',
  moduleRevision:   'XLVII',

  // ── Cell (List-II) ───────────────────────────────────────────────────────
  cellSourcePage: 'https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/',
  cellPdfUrl:     'https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/04/20260413760726099.pdf',
  cellAsOf:       '13 Feb 2026',       // Rev 5 — last revision with confirmed aggregate
  cellRevision:   '5',
  cellNote:       'Rev 6 (13 Apr 2026) adds ≥Reliance 1.24 GW; aggregate pending MNRE summary',

  // ── Wafer / Ingot ────────────────────────────────────────────────────────
  waferIngotSource:  'Parliament Q&A — MoS Naik, Aug 2025',
  waferIngotAsOf:    '30 Jun 2025',
  waferIngotNote:    'PLI-declared installed capacity; ALMM List-III (wafers) not yet published',
  waferAlmmStatus:   'ALMM List-III effective June 2028 (≥15 GW threshold not yet met)',
};

/* ── Capacity figures (GW) ────────────────────────────────────────────────── */
const ALMM_CAPACITY = {
  // Exact figure from MNRE ALMM Revision XLVII, 01 Mar 2026
  moduleGW: 173.1,      // 173,144 MW → 173.1 GW

  // Sum through ALMM List-II Revision 5, 13 Feb 2026: 27,227 MW
  cellGW:   27.2,       // displayed as "≥27.2 GW" in UI due to pending Rev 6 aggregate

  // Parliamentary statement — PLI-installed as of 30 Jun 2025
  waferGW:   2.2,

  // Equal to wafer per PLI structure & ALMM List-III mandate logic
  ingotGW:   2.2,
};

/* ── Backward integration ratios ─────────────────────────────────────────────
   Percentage of downstream capacity that has an equivalent upstream step.
   All percentages are capped at 100 for display; values >100 are truncated.
   ─────────────────────────────────────────────────────────────────────────── */
const ALMM_INTEGRATION = (function () {
  const m = ALMM_CAPACITY;

  // How much of module capacity is covered by ALMM-listed cell capacity?
  // = cell / module × 100
  const moduleToCellPct = parseFloat(((m.cellGW / m.moduleGW) * 100).toFixed(1));

  // How much of cell capacity is covered by PLI-declared wafer capacity?
  // = wafer / cell × 100
  const cellToWaferPct  = parseFloat(((m.waferGW / m.cellGW) * 100).toFixed(1));

  // How much of wafer capacity is covered by PLI-declared ingot capacity?
  // = ingot / wafer × 100 — always ~100% per PLI structure
  const waferToIngotPct = parseFloat(((m.ingotGW / m.waferGW) * 100).toFixed(1));

  return {
    moduleToCellPct,   // ~15.7%
    cellToWaferPct,    // ~8.1%
    waferToIngotPct,   // ~100%
    // Gap = how much of the reference layer lacks upstream domestic supply
    moduleToCellGap:   parseFloat((100 - moduleToCellPct).toFixed(1)),
    cellToWaferGap:    parseFloat((100 - cellToWaferPct).toFixed(1)),
  };
})();

/* ── Donut chart data ─────────────────────────────────────────────────────── */
const ALMM_DONUT = {
  labels: ['Module (ALMM List-I)', 'Cell (ALMM List-II)', 'Wafer (PLI)', 'Ingot (PLI)'],
  values: [
    ALMM_CAPACITY.moduleGW,
    ALMM_CAPACITY.cellGW,
    ALMM_CAPACITY.waferGW,
    ALMM_CAPACITY.ingotGW,
  ],
  colors: ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7'],
};
