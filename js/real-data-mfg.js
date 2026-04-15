/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: MNRE ALMM — Manufacturer-Level Capacity Table
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 2 → "Manufacturer Ranking — Capacity & Backward Integration"
   ───────────────────────────────────────────────────────────────────────────

   DATA SOURCES AND CONFIDENCE LEVELS
   ────────────────────────────────────
   MODULE GW  → MNRE ALMM List-I. Each figure cross-referenced across multiple
                 Energetica India / Mercom India reports citing official MNRE
                 revision announcements (Rev XLIII–XLVII, Aug 2025–Mar 2026).
                 Source page: https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/
                 Most recent PDF: https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/03/202603021503313944.pdf

   CELL GW    → MNRE ALMM List-II. Rev 1–6 (Jul 2025–Apr 2026).
                 Source PDF (Rev 6): https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/04/20260413760726099.pdf
                 All capacities verified from Energetica India / Mercom India citing
                 official MNRE revision announcements.

   WAFER/INGOT → Only Adani Solar has publicly disclosed operational capacity
                  (2 GW ingot-wafer, per Adani Solar corporate website and
                  pv-magazine India, Oct 2024). No other manufacturer has
                  a publicly confirmed ALMM-listed or PLI-declared wafer/ingot
                  number for individual entity attribution. Shown as null elsewhere.

   PLI        → MNRE PLI Scheme winners (Tranche I + II). Based on:
                 - Parliament statements (MoS Naik, Aug 2025)
                 - MNRE announcements and company press releases
                 - Energetica India, Mercom India reporting
                 Shown only where affirmatively confirmed in reporting.

   LISTED     → Stock exchange listing status. NSE/BSE data as of Apr 2026.
   ───────────────────────────────────────────────────────────────────────────

   IMPORTANT ACCURACY NOTE ON MODULE CAPACITY
   ────────────────────────────────────────────
   ALMM List-I revision announcements track ADDITIONS per revision, not cumulative
   totals for each company. Companies have multiple manufacturing units, each
   separately enlisted. The figures below represent company-level totals derived by
   aggregating confirmed unit-level figures from revision reports, and are as of
   the most recent revision where that manufacturer's total is explicitly stated.
   Where a total is not explicitly stated post-March 2026 revision, the most
   recently confirmed aggregate is used and labelled with its reference date.

   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Confidence levels used in annotations ────────────────────────────────
   'almm'    = directly from MNRE ALMM revision announcement (highest confidence)
   'stated'  = company/MNRE stated capacity (cross-corroborated)
   'derived' = aggregated from multiple unit-level ALMM revision figures
   'est'     = estimated from trajectory; exact ALMM total not individually confirmed
   ─────────────────────────────────────────────────────────────────────────── */

const MFG_META = {
  moduleSource: 'MNRE ALMM List-I, Rev XLVII (01 Mar 2026)',
  cellSource:   'MNRE ALMM List-II, Rev 6 (13 Apr 2026)',
  waferSource:  'MNRE PLI Parliament statement + Adani corporate disclosure',
  cutoffDate:   '01 Mar 2026 (modules) / 13 Apr 2026 (cells)',
  sourceUrl:    'https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/',
};

/* ═══════════════════════════════════════════════════════════════════════════
   MANUFACTURER TABLE DATA
   Sorted descending by moduleGW.
   Null = not confirmed publicly; displayed as "—" in table.
   ═══════════════════════════════════════════════════════════════════════════ */
const MFG_ROWS = [

  {
    rank: 1,
    name: 'Waaree Energies',
    ticker: 'NSE: WAAREEENER',
    moduleGW:  20.2,
    moduleConf: 'almm',
    moduleNote: 'Crossed 20 GW after Chikhli (16.44 GW) added Dec 2025; pv-magazine Dec 31, 2025',
    cellGW:    5.25,
    cellConf:  'almm',
    cellNote:  'ALMM List-II Rev 3 (Dec 2025): 3.92 GW TOPCon + 1.33 GW PERC at Chikhli, Navsari',
    waferGW:   null,   // Investing but no confirmed commissioned/ALMM capacity as of Apr 2026
    ingotGW:   null,
    integration: 'Module + Cell',
    pli: true,
    pliNote: 'PLI Tranche II winner; PLI-installed cell+module capacity confirmed in parliamentary statement',
    listed: true,
  },

  {
    rank: 2,
    name: 'Goldi Solar (Goldi Sun)',
    ticker: 'Private',
    moduleGW:  15.2,
    moduleConf: 'almm',
    moduleNote: '3 facilities (Pipodara, Navsari, Kosamba); 15.2 GW ALMM-approved per Business Standard Jan 4, 2026',
    cellGW:    null,   // 1.2 GW cell plant under construction; NOT yet in ALMM List-II as of Apr 2026
    cellConf:  null,
    cellNote:  '1.2 GW TOPCon cell plant under construction; target Mar 2026 commissioning; ALMM List-II not yet issued',
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only',
    pli: false,  // No PLI confirmation found in available reporting
    pliNote: 'No PLI enlistment confirmed in available sources',
    listed: false,
  },

  {
    rank: 3,
    name: 'Rayzon Solar',
    ticker: 'Private',
    moduleGW:  9.1,
    moduleConf: 'almm',
    moduleNote: '9,065 MW after adding 5,659 MW new Surat plant in Dec 2025; Energetica India Dec 22, 2025',
    cellGW:    null,
    cellConf:  null,
    cellNote:  null,
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only',
    pli: false,
    pliNote: 'No PLI enlistment confirmed in available sources',
    listed: false,
  },

  {
    rank: 4,
    name: 'Avaada Electro',
    ticker: 'Private (Avaada Energy)',
    moduleGW:  8.2,
    moduleConf: 'almm',
    moduleNote: '8,220 MW per Energetica India (Nov 2025); Nagpur (6,909 MW) + Aurangabad facilities',
    cellGW:    null,
    cellConf:  null,
    cellNote:  null,
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only',
    pli: true,
    pliNote: 'PLI Tranche II winner (Avaada Ventures); 2.4 GW awarded',
    listed: false,
  },

  {
    rank: 5,
    name: 'Vikram Solar',
    ticker: 'Private (IPO planned)',
    moduleGW:  6.3,
    moduleConf: 'derived',
    moduleNote: 'Kolkata plant ~2.9 GW (Aug 2025) + new Tamil Nadu plant 3.36 GW (Mar 2026 ALMM Rev XLVII); derived aggregate ~6.3 GW',
    cellGW:    null,
    cellConf:  null,
    cellNote:  'Has cell manufacturing lines but not in ALMM List-II as of Apr 2026',
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only (cells not ALMM-listed)',
    pli: true,
    pliNote: 'PLI Tranche I winner (7 selected companies)',
    listed: false,
  },

  {
    rank: 6,
    name: 'Grew Energy (Grew Solar)',
    ticker: 'Private',
    moduleGW:  5.8,
    moduleConf: 'almm',
    moduleNote: '5,818 MW total after adding 3,015 MW Dudu, Rajasthan plant in Feb 2026; Energetica India Feb 9, 2026',
    cellGW:    null,
    cellConf:  null,
    cellNote:  null,
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only',
    pli: false,
    pliNote: 'No PLI enlistment confirmed in available sources',
    listed: false,
  },

  {
    rank: 7,
    name: 'Premier Energies',
    ticker: 'NSE: PREMIERENE',
    moduleGW:  5.2,
    moduleConf: 'almm',
    moduleNote: '5,153 MW total after adding 1,507 MW Telangana plant (Feb 2026); Energetica India Feb 9, 2026',
    cellGW:    3.28,
    cellConf:  'almm',
    cellNote:  'ALMM List-II Rev 4: Premier Int\'l 1.17 GW PERC + Premier PV 0.75 GW PERC + 1.36 GW TOPCon = 3.28 GW total',
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module + Cell',
    pli: true,
    pliNote: 'PLI beneficiary; PLI-installed cell capacity confirmed in parliamentary statement (9.7 GW total national)',
    listed: true,
  },

  {
    rank: 8,
    name: 'RenewSys India',
    ticker: 'Private',
    moduleGW:  5.1,
    moduleConf: 'almm',
    moduleNote: '5,117 MW total after adding 2,268 MW Maharashtra plant in Feb 2026; Energetica India Feb 9, 2026',
    cellGW:    null,
    cellConf:  null,
    cellNote:  'Core business is encapsulants (EVA/POE) and backsheets; no cell ALMM listing as of Apr 2026',
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only',
    pli: false,
    pliNote: 'No PLI module enlistment confirmed in available sources',
    listed: false,
  },

  {
    rank: 9,
    name: 'INA Solar (Insolation Green Energy)',
    ticker: 'NSE: INSOLATION',
    moduleGW:  5.1,
    moduleConf: 'almm',
    moduleNote: '3,602 MW (Dec 2025) + 1,491 MW (Mar 2026 Rev XLVII) = ~5.09 GW; Energetica India Mar 3, 2026',
    cellGW:    null,
    cellConf:  null,
    cellNote:  null,
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only',
    pli: false,
    pliNote: 'No PLI enlistment confirmed in available sources',
    listed: true,
  },

  {
    rank: 10,
    name: 'Emmvee Energy',
    ticker: 'Private (Emmvee Group)',
    moduleGW:  4.3,
    moduleConf: 'almm',
    moduleNote: '4,308 MW shown in ALMM Rev XLVII (Mar 2026 PDF) for primary Karnataka unit; Feb update added 2,079 MW increment',
    cellGW:    1.55,
    cellConf:  'almm',
    cellNote:  'ALMM List-II inaugural (Jul 2025): 1,553 MW TOPCon cells, Karnataka',
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module + Cell',
    pli: true,
    pliNote: 'PLI Tranche II winner; cell capacity under PLI',
    listed: false,
  },

  {
    rank: 11,
    name: 'SAEL Solar (SAEL Industries)',
    ticker: 'Private',
    moduleGW:  4.1,
    moduleConf: 'almm',
    moduleNote: '4,129 MW total after adding 1,535 MW Rajasthan plant in Feb 2026; Energetica India Feb 9, 2026',
    cellGW:    null,
    cellConf:  null,
    cellNote:  null,
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module only',
    pli: false,
    pliNote: 'No PLI enlistment confirmed in available sources',
    listed: false,
  },

  {
    rank: 12,
    name: 'Adani Solar (Mundra)',
    ticker: 'Unlisted subsidiary (ADANIGREEN group)',
    moduleGW:  4.0,
    moduleConf: 'stated',
    moduleNote: 'Adani Solar corporate stated "4 GW cells & modules" (website + pv-magazine Oct 2024); exact ALMM module total across all Mundra units not confirmed as single figure in available reporting',
    cellGW:    4.24,
    cellConf:  'almm',
    cellNote:  'ALMM List-II: Mundra Solar Energy 1.94 GW PERC + Mundra Solar PV 2.30 GW TOPCon (after Feb 2026 +405 MW update)',
    waferGW:   2.0,
    ingotGW:   2.0,
    integration: 'Module + Cell + Wafer + Ingot',
    pli: true,
    pliNote: 'PLI winner; integrated manufacturing. Ingot-wafer 2 GW operational per Adani Solar corporate website and pv-magazine India Oct 2024',
    listed: false,  // Adani Solar entity itself is unlisted; parent Adani Green is listed
  },

  {
    rank: 13,
    name: 'ReNew Photovoltaics',
    ticker: 'Private (ReNew Energy Global)',
    moduleGW:  3.6,
    moduleConf: 'almm',
    moduleNote: '3,550 MW shown in Feb 7, 2026 ALMM revision for Dholera SIR plant (model addition + capacity add); Energetica India Feb 9, 2026',
    cellGW:    1.77,
    cellConf:  'almm',
    cellNote:  'ALMM List-II inaugural (Jul 2025): 1,766 MW PERC cells at Dholera SIR, Gujarat',
    waferGW:   null,
    ingotGW:   null,
    integration: 'Module + Cell',
    pli: true,
    pliNote: 'PLI Tranche II winner (ReNew Solar)',
    listed: false,
  },

  {
    rank: 14,
    name: 'FS India Solar (First Solar)',
    ticker: 'Unlisted (subsidiary of FSLR:NASDAQ)',
    moduleGW:  3.4,
    moduleConf: 'almm',
    moduleNote: '3,433 MW after +221 MW update in Feb 2026; Sipcot Industrial Park, Tamil Nadu; thin-film CdTe',
    cellGW:    3.43,
    cellConf:  'almm',
    cellNote:  'ALMM List-II inaugural (Jul 2025): 3,212 MW → 3,433 MW after +221 MW (Feb 2026). Note: thin-film CdTe — cell+module is integrated single process',
    waferGW:   null,  // CdTe thin film: no silicon wafer step
    ingotGW:   null,  // CdTe thin film: no silicon ingot step
    integration: 'Integrated (thin-film CdTe)',
    pli: true,
    pliNote: 'PLI Tranche I winner (integrated manufacturing)',
    listed: false,
  },

];

/* ── Derived integration level for display ───────────────────────────────── */
function getMfgIntegrationTag(row) {
  const hasCell  = row.cellGW  !== null;
  const hasWafer = row.waferGW !== null;
  const isThinFilm = row.integration.includes('thin-film');

  if (isThinFilm)      return { label: 'Full (Thin-Film)', type: 'positive' };
  if (hasCell && hasWafer) return { label: 'Full Integration', type: 'positive' };
  if (hasCell)         return { label: 'Module + Cell',   type: 'info'     };
  return                      { label: 'Module only',     type: 'neutral'  };
}

/* ── Confidence chip builder ─────────────────────────────────────────────── */
function getMfgConfidenceChip(conf) {
  if (!conf) return '';
  const map = {
    'almm':    { label: 'ALMM',    bg: 'rgba(59,130,246,0.12)',  color: 'var(--accent-blue)'   },
    'stated':  { label: 'STATED',  bg: 'rgba(245,158,11,0.12)',  color: 'var(--status-warning)' },
    'derived': { label: 'DERIVED', bg: 'rgba(168,85,247,0.12)', color: 'var(--accent-purple)'  },
    'est':     { label: 'EST',     bg: 'rgba(90,106,133,0.12)', color: 'var(--text-muted)'     },
  };
  const c = map[conf] || map['est'];
  return `<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;
    background:${c.bg};color:${c.color};letter-spacing:0.04em">${c.label}</span>`;
}
