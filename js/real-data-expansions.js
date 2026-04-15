/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Solar Manufacturer Capacity Expansion Tracker
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 2 → "Announced Capacity Expansion Tracker" block
   ───────────────────────────────────────────────────────────────────────────

   STATUS RULES (strictly enforced — no inference):
     'Commissioned'   = company explicitly confirmed commissioning in a
                        regulatory filing, press release, or exchange notice
     'Under Execution'= physical work confirmed as underway — groundbreaking
                        done, civil works in progress, equipment installed,
                        or first production initiated
     'Planned'        = board/BOD approval received; work not yet confirmed
                        as physically underway
     'Delayed'        = company or credible reporting confirms timeline slip
                        vs. a previously stated date
   "On-track" is NOT used unless the company's exact words in a filing say so.

   SOURCE HIERARCHY (preferred order):
     1. BSE / NSE Regulation 30 (LODR) filing
     2. Company official press release (investor-relations page)
     3. Annual General Meeting (AGM) shareholder statement
     4. Company IPO DRHP / prospectus (legally filed documents)
     5. Corroborated industry reporting where primary source not web-accessible

   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const EXP_META = {
  cutoffDate: '15 Apr 2026',
  note: 'Capacity figures and timelines are as disclosed by companies; future targets are not verified actuals.',
};

/* ── Status constants ─────────────────────────────────────────────────────── */
const STATUS = {
  COMMISSIONED:    'Commissioned',
  UNDER_EXECUTION: 'Under Execution',
  PLANNED:         'Planned',
  DELAYED:         'Delayed',
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPANSION ENTRIES
   Each entry = one publicly announced discrete expansion event.
   Sorted: Commissioned first, then Under Execution, then Planned.
   ═══════════════════════════════════════════════════════════════════════════ */
const EXPANSIONS = [

  // ── COMMISSIONED ──────────────────────────────────────────────────────────

  {
    company:     'Premier Energies',
    type:        'Module',
    capacity:    '5.6 GW TOPCon',
    location:    'Seetharampur, Telangana',
    targetDate:  'Mar 2026 (target); commissioned Apr 2026',
    status:      STATUS.COMMISSIONED,
    announcedOn: 'Feb 2025 (board approval for plant)',
    sourceDate:  'Apr 2026',
    sourceName:  'BSE / NSE Reg-30 + company press release',
    sourceUrl:   'https://www.screener.in/company/PREMIERENE/consolidated/',
    notes:       '75-acre G12R TOPCon 0BB facility; AI quality control; 2,000 jobs. Brings Premier total module capacity to 11.1 GW. BSE/NSE exchange notice filed on commissioning.',
  },

  {
    company:     'Vikram Solar',
    type:        'Module',
    capacity:    '5 GW TOPCon',
    location:    'Vallam, Tamil Nadu',
    targetDate:  'Nov 2025 (commissioned)',
    status:      STATUS.COMMISSIONED,
    announcedOn: 'Jun 2025 (SEBI DRHP / IPO disclosures)',
    sourceDate:  'Nov 2025',
    sourceName:  'Company press release (vikramsolar.com) + PV Tech',
    sourceUrl:   'https://www.vikramsolar.com/press-releases/',
    notes:       'M10 / G12 / G12R-capable automated facility. Brings Vikram total module capacity to 9.5 GW. Disclosed in IPO DRHP and confirmed via company press release on commissioning.',
  },

  // ── UNDER EXECUTION ───────────────────────────────────────────────────────

  {
    company:     'Waaree Energies',
    type:        'Ingot + Wafer',
    capacity:    '10 GW (each)',
    location:    'Butibori, Nagpur, Maharashtra',
    targetDate:  'Not disclosed; groundbreaking Mar 2025',
    status:      STATUS.UNDER_EXECUTION,
    announcedOn: 'Dec 2024 (initial disclosure); Mar 2025 (groundbreaking)',
    sourceDate:  'Mar 2026',
    sourceName:  'BSE Reg-30 disclosure (Regulation 30 LODR) + PV Tech',
    sourceUrl:   'https://www.pv-tech.org/waaree-begins-construction-of-its-10gw-solar-ingot-and-wafer-plant-in-maharashtra/',
    notes:       '300 acres; ₹6,200 crore investment. Waaree stated: "Fulfil disclosure obligations under Regulation 30 of SEBI LODR." Groundbreaking attended by Maharashtra CM. Physical construction confirmed underway.',
  },

  {
    company:     'Waaree Energies',
    type:        'Cell',
    capacity:    '4 GW TOPCon (Phase 1)',
    location:    'Gujarat (site undisclosed)',
    targetDate:  'FY27 (board guidance Aug 2025)',
    status:      STATUS.UNDER_EXECUTION,
    announcedOn: 'Jul 2025 (board approved ₹2,754 cr for 4 GW cell + 4 GW ingot-wafer)',
    sourceDate:  'Aug 2025',
    sourceName:  'Institutional Investor Meeting Q1 FY26 + Board Resolution',
    sourceUrl:   'https://www.bseindia.com/xml-data/corpfiling/AttachHis/f69a5752-7431-48c9-bba7-8fd52b54ca4f.pdf',
    notes:       'Board approved ₹2,754 cr capex: 4 GW solar cell (Gujarat) + 4 GW ingot-wafer (Maharashtra). Separate from Nagpur Ingot+Wafer plant above. Waaree currently has 5.4 GW cell operational at Chikhli, Gujarat.',
  },

  {
    company:     'Premier Energies',
    type:        'Wafer',
    capacity:    '2 GW Silicon Wafer (JV)',
    location:    'Andhra Pradesh (site undisclosed)',
    targetDate:  'Jun 2026 (commercial operations)',
    status:      STATUS.UNDER_EXECUTION,
    announcedOn: 'May 2025 (JV agreement with Sino-American Silicon Products, Taiwan)',
    sourceDate:  'May 2025',
    sourceName:  'BSE / NSE Exchange Filing (JV announcement under Reg-30)',
    sourceUrl:   'https://www.screener.in/company/PREMIERENE/consolidated/',
    notes:       '74:26 JV (Premier Energy: SAS). Equipment ordered per company disclosures. Premier targets 10 GW ingot by FY28, 8 GW further wafer expansion by FY28. Commercial operation target confirmed at Jun 2026.',
  },

  {
    company:     'Reliance Industries',
    type:        'Solar Cell + Module (HJT)',
    capacity:    '~1.7 GW module operational; scaling to 10 GW',
    location:    'Dhirubhai Ambani Giga Energy Complex, Jamnagar, Gujarat',
    targetDate:  '10 GW target: "coming quarters" (AGM Sep 2025)',
    status:      STATUS.UNDER_EXECUTION,
    announcedOn: 'AGM Sep 2025; first 200 MW HJT modules produced',
    sourceDate:  'Apr 2026',
    sourceName:  'RIL 48th AGM statement (Anant Ambani) + ALMM List-II Rev 6 (Apr 2026)',
    sourceUrl:   'https://www.mercomindia.com/reliance-industries-rolls-out-first-200-mw-hjt-modules-at-jamnagar',
    notes:       '1,716 MW module + 1,238 MW HJT cell now ALMM-listed (Apr 2026). First 200 MW modules produced; cell facility commissioned Q3 2025. Scaling to 10 GW in "coming quarters", then 20 GW. Battery + electrolyzer giga factories also under construction.',
  },

  {
    company:     'Adani Solar',
    type:        'Cell + Module (integrated)',
    capacity:    '10 GW (from current 4 GW)',
    location:    'Mundra Electronic Manufacturing Cluster, Gujarat',
    targetDate:  'Mid-2026 (company stated)',
    status:      STATUS.UNDER_EXECUTION,
    announcedOn: 'REI Expo 2024 (Sep 2024); capacity additions visible in ALMM updates',
    sourceDate:  'Sep 2024',
    sourceName:  'pv-magazine India interview with Adani Solar VP (Rahul Bhutiani) at REI Expo 2024 + PV Tech RE+ coverage',
    sourceUrl:   'https://www.pv-tech.org/re-adani-solar-pauses-polysilicon-plant-targets-10gw-of-solar-cells-and-modules-in-next-18-months/',
    notes:       'Starting from 4 GW (2 GW PERC + 2 GW TOPCon cells and modules). 2 GW ingot-wafer already operational. 10 GW ingot-wafer target by 2027-28. Polysilicon plan on hold ("tough business case"). Adani Solar is unlisted; disclosures via public statements, not exchange filings.',
  },

  // ── PLANNED ───────────────────────────────────────────────────────────────

  {
    company:     'Vikram Solar',
    type:        'Cell',
    capacity:    '12 GW TOPCon',
    location:    'Gangakondan, Tamil Nadu',
    targetDate:  'First cell Dec 2026; full ramp Dec 2026–Mar 2027',
    status:      STATUS.PLANNED,
    announcedOn: 'Jan 2026 (board cleared ₹10,700 cr total capex)',
    sourceDate:  'Jan 2026',
    sourceName:  'BSE / NSE Board resolution (₹10,700 cr capex approval) + Q3 FY26 earnings call',
    sourceUrl:   'https://www.vikramsolar.com/press-releases/',
    notes:       'Civil work to complete Sep 2026; equipment install Oct-Nov 2026. Board-approved capex: ₹6,400 cr for modules + cells. 6 GW module plant at same site targeting Q1 FY27. Company targets 17.5 GW modules + 12 GW cells by FY27.',
  },

  {
    company:     'Premier Energies',
    type:        'Cell + Ingot',
    capacity:    '4.8 GW TOPCon Cell + 10 GW Ingot (target)',
    location:    'Naidupeta, Andhra Pradesh (cell); separate site for ingot',
    targetDate:  'Cell: FY27 target; Ingot 10 GW: FY28 target',
    status:      STATUS.PLANNED,
    announcedOn: 'Q1 FY26 investor communications; BSE Reg-30 project location change (Telangana → AP)',
    sourceDate:  'Nov 2025',
    sourceName:  'BSE / NSE filing (project location change: Ranga Reddy, TS → Tirupati, AP) + Q3FY26 investor communications',
    sourceUrl:   'https://indiaipo.jpmorgan.com/content/dam/jpm/india-private-limited/documents/premier-track-record.pdf',
    notes:       'Board approved 4 GW cell in AP. Location changed from Telangana to AP per exchange filing. 10 GW ingot by FY28. BESS 12 GWh by FY28, inverters 3 GW by FY26 also planned. Rs 12,500 cr total 3-year capex programme.',
  },

];

/* ── Status display config ─────────────────────────────────────────────────── */
function getExpansionStatusConfig(status) {
  const map = {
    [STATUS.COMMISSIONED]:    { type: 'positive', icon: 'fa-circle-check',    label: 'Commissioned'    },
    [STATUS.UNDER_EXECUTION]: { type: 'info',     icon: 'fa-hard-hat',        label: 'Under Execution' },
    [STATUS.PLANNED]:         { type: 'neutral',  icon: 'fa-calendar-check',  label: 'Planned'         },
    [STATUS.DELAYED]:         { type: 'warning',  icon: 'fa-clock',           label: 'Delayed'         },
  };
  return map[status] || { type: 'neutral', icon: 'fa-circle-question', label: status };
}
