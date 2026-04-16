/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: State-Wise Solar Commissioning (FY26 — Apr 2025 to Mar 2026)
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 4 → "State-Wise Commissioning (FY YTD)" donut + state bars
   ───────────────────────────────────────────────────────────────────────────

   DEFINITION:
     Newly commissioned solar capacity by state = (cumulative solar at Mar 2026)
     minus (cumulative solar at Mar 2025), using MNRE's total solar definition
     (ground-mounted + grid-connected rooftop + hybrid solar comp + off-grid).

   PRIMARY SOURCES:
     Mar 2026 state-wise (Tier A — exact):
       MNRE Physical Progress state-wise PDF, directly fetched 15 Apr 2026
       "State-wise (Location based) installed capacity of Renewable Power
        as on 31.03.2026"
       URL: https://cdnbbsr.s3waas.gov.in/...2026/04/20260408192373680.pdf

     Mar 2025 state-wise (Tier B — derived, top 5 RE states):
       MNRE RE Statistics 2024-25, Table 8 highlights — state-level solar %
       of total RE installed capacity for each of the top 5 RE states.
       Published Nov 2025. URL: https://cdnbbsr.s3waas.gov.in/...
         uploads/2025/11/202511061627678782.pdf
       Cross-check: MNRE Twitter (31 May 2025) confirms Rajasthan 29.5 GW,
         Gujarat 20 GW, Maharashtra 11.8 GW — consistent with Mar 2025 derived
         baselines (Raj 28.29 GW + ~1.2 GW growth in Apr–May ≈ 29.5 GW ✓)

     Mar 2025 state-wise (Tier C — interpolated, remaining states):
       Sep 2024 exact state-wise data (from MNRE archive PDF, Sep 2024)
       cross-checked against national FY26/FY25-H2 ratio = 0.721
       (FY26 = 44,613 MW; FY25-H2 = 17,308 MW; FY26 share = 72.1% of 18-month)
       FY26 addition estimate = (Mar 2026 - Sep 2024) × 0.721

   NATIONAL TOTALS (confirmed, used as closure check):
     Mar 2025 cumulative: 105,648 MW (PIB PRID=2120729)
     Mar 2026 cumulative: 150,261 MW (MNRE Physical Progress page, Apr 2026)
     FY26 total addition: 44,613 MW (exact from MNRE)
     All state values must sum to ≈ 44,613 MW (residual → "Others")

   TIER DEFINITIONS:
     A = Mar 2026 exact from MNRE PDF (all states)
     B = Mar 2025 from RE Stats 2024-25 percentage derivation (top 5 RE states)
     C = Mar 2025 interpolated from Sep 2024 + growth ratio (remaining states)

   LIMITATION:
     State-level Mar 2025 baselines for non-top-5 states carry ±15–25%
     uncertainty because they are interpolated, not directly from a Mar 2025
     state-wise PDF. The national total (44,613 MW) is exact; state
     distribution is estimated for states outside the top 5 RE capacity states.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── MNRE-confirmed national anchor values ───────────────────────────────── */
const STATE_COMMISSION_NATIONAL = {
  mar2026_cumulative: 150261,  // MNRE Physical Progress page, 31 Mar 2026 (exact)
  mar2025_cumulative: 105648,  // PIB PRID=2120729, FY25 end (exact)
  fy26_total:          44613,  // FY26 total solar commissioned (exact; derived)
};

/* ── State-level data ────────────────────────────────────────────────────────
   Sorted descending by fy26Mw.
   Each entry:
     state       = display name
     mar2026     = cumulative solar MW as of 31.03.2026 (Tier A — exact)
     mar2025     = cumulative solar MW as of 31.03.2025 (Tier B or C)
     fy26Mw      = commissioning in FY26 = mar2026 - mar2025
     tier        = derivation confidence ('B' or 'C') for the mar2025 baseline
     mar2025Note = brief source note for the baseline
   ─────────────────────────────────────────────────────────────────────────── */
const STATE_COMMISSION_ROWS = [
  {
    state:      'Rajasthan',
    mar2026:    41013,
    mar2025:    28289,   // 82.86% of 34,140 MW RE (RE Stats 2024-25 Table 8 highlights)
    fy26Mw:     12724,
    tier:       'B',
    color:      '#f59e0b',  // amber
    mar2025Note: 'RE Stats 2024-25: solar = 82.86% of RJ total RE 34.14 GW',
  },
  {
    state:      'Gujarat',
    mar2026:    29303,
    mar2025:    18490,   // 55.39% of 33,390 MW RE (RE Stats 2024-25 Table 8 highlights)
    fy26Mw:     10813,
    tier:       'B',
    color:      '#3b82f6',  // blue
    mar2025Note: 'RE Stats 2024-25: solar = 55.39% of GJ total RE 33.39 GW',
  },
  {
    state:      'Maharashtra',
    mar2026:    19622,
    mar2025:    10687,   // 47.71% of 22,400 MW RE (RE Stats 2024-25 Table 8 highlights)
    fy26Mw:     8935,
    tier:       'B',
    color:      '#22c55e',  // green
    mar2025Note: 'RE Stats 2024-25: solar = 47.71% of MH total RE 22.40 GW',
  },
  {
    state:      'Tamil Nadu',
    mar2026:    13580,
    mar2025:    10154,   // 40.23% of 25,240 MW RE (RE Stats 2024-25 Table 8 highlights)
    fy26Mw:     3426,
    tier:       'B',
    color:      '#a855f7',  // purple
    mar2025Note: 'RE Stats 2024-25: solar = 40.23% of TN total RE 25.24 GW',
  },
  {
    state:      'Andhra Pradesh',
    mar2026:    7495,
    mar2025:    5443,    // Sep 2024 was 4,648 MW → interpolated Mar 2025 ≈ 5,443
    fy26Mw:     2052,
    tier:       'C',
    color:      '#f97316',  // orange
    mar2025Note: 'Sep 2024 MNRE data (4,648 MW) + Tier C interpolation (×0.721 ratio)',
  },
  {
    state:      'Karnataka',
    mar2026:    11102,
    mar2025:    9680,    // 40.47% of 23,920 MW RE (RE Stats 2024-25 Table 8 highlights)
    fy26Mw:     1422,
    tier:       'B',
    color:      '#14b8a6',  // teal
    mar2025Note: 'RE Stats 2024-25: solar = 40.47% of KA total RE 23.92 GW',
  },
  {
    state:      'Madhya Pradesh',
    mar2026:    5985,
    mar2025:    4663,    // Sep 2024 was 4,151 MW → interpolated Mar 2025 ≈ 4,663
    fy26Mw:     1322,
    tier:       'C',
    color:      '#6366f1',  // indigo
    mar2025Note: 'Sep 2024 MNRE data (4,151 MW) + Tier C interpolation',
  },
  {
    state:      'Kerala',
    mar2026:    2216,
    mar2025:    1528,    // Sep 2024 was 1,262 MW → interpolated Mar 2025 ≈ 1,528
    fy26Mw:     688,
    tier:       'C',
    color:      '#ec4899',  // pink
    mar2025Note: 'Sep 2024 MNRE data (1,262 MW) + Tier C interpolation',
  },
  {
    state:      'Uttar Pradesh',
    mar2026:    4123,
    mar2025:    3518,    // Sep 2024 was 3,284 MW → interpolated Mar 2025 ≈ 3,518
    fy26Mw:     605,
    tier:       'C',
    color:      '#78716c',  // warm gray
    mar2025Note: 'Sep 2024 MNRE data (3,284 MW) + Tier C interpolation',
  },
  {
    state:      'Haryana',
    mar2026:    2608,
    mar2025:    2099,    // Sep 2024 was 1,902 MW → interpolated Mar 2025 ≈ 2,099
    fy26Mw:     509,
    tier:       'C',
    color:      '#84cc16',  // lime
    mar2025Note: 'Sep 2024 MNRE data (1,902 MW) + Tier C interpolation',
  },
  {
    state:      'Chhattisgarh',
    mar2026:    1813,
    mar2025:    1419,    // Sep 2024 was 1,266 MW → interpolated Mar 2025 ≈ 1,419
    fy26Mw:     394,
    tier:       'C',
    color:      '#06b6d4',  // cyan
    mar2025Note: 'Sep 2024 MNRE data (1,266 MW) + Tier C interpolation',
  },
  {
    state:      'Others',
    mar2026:    null,
    mar2025:    null,
    fy26Mw:     1723,    // National FY26 total (44,613) minus all identified states above
    tier:       'residual',
    color:      '#94a3b8',  // slate
    mar2025Note: 'Residual: national FY26 total minus all identified states',
  },
];

/* ── Self-check: fy26Mw values must sum to national total ───────────────── */
(function selfCheck() {
  const sum = STATE_COMMISSION_ROWS.reduce((s, r) => s + r.fy26Mw, 0);
  const expected = STATE_COMMISSION_NATIONAL.fy26_total;
  if (Math.abs(sum - expected) > 50) {
    throw new Error(
      'STATE_COMMISSION: sum of fy26Mw (' + sum + ') deviates >50 MW ' +
      'from national FY26 total (' + expected + ')'
    );
  }
})();

/* ── Chart-ready arrays (sorted descending already) ─────────────────────── */
const STATE_COMMISSION_DATA = {
  states: STATE_COMMISSION_ROWS.map(r => r.state),
  mw:     STATE_COMMISSION_ROWS.map(r => r.fy26Mw),
  colors: STATE_COMMISSION_ROWS.map(r => r.color),
};

const STATE_COMMISSION_META = {
  fy:            'FY26',
  period:        '01 Apr 2025 – 31 Mar 2026',
  fy26Total:     STATE_COMMISSION_NATIONAL.fy26_total,
  mar2026Source: 'MNRE state-wise PDF (31.03.2026), directly fetched 15 Apr 2026',
  mar2025Source: 'MNRE RE Statistics 2024-25 (top 5 RE states); MNRE Sep 2024 archive + interpolation (other states)',
  definition:    'All solar per MNRE: utility-scale + rooftop + hybrid solar component + off-grid',
  cutoffDate:    '15 Apr 2026',
  pdfUrl:        'https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/04/20260408192373680.pdf',
  statCount:     STATE_COMMISSION_ROWS.length,
  tierBStates:   STATE_COMMISSION_ROWS.filter(r => r.tier === 'B').map(r => r.state).join(', '),
  tierCStates:   STATE_COMMISSION_ROWS.filter(r => r.tier === 'C').map(r => r.state).join(', '),
};
