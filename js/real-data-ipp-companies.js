/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: IPP / Listed Player — Company Registry & Data Loader
   ───────────────────────────────────────────────────────────────────────────
   Consumed by: js/tab-ipp.js — company selector, all per-company blocks.
   Consumed by: js/main.js   — company filter population + IPP refresh handler.

   Architecture:
     1. IPP_COMPANIES  — canonical list of tracked companies (the "universe").
        Single source of truth. Replace MOCK.ipp.companies everywhere.
     2. loadIPPCompanyData(name)  — async loader with three-tier fallback:
          (a) In-memory cache (5-min TTL)
          (b) Committed scrape JSON at ./data/ipp-{key}.json
              Produced per-company by a future scrape script (BSE/NSE/IR pages)
          (c) MOCK.ipp data for that company (safe fallback until live data lands)
     3. refreshIPPCompany(name)  — busts cache for one company and reloads.
     4. refreshIPPTab()  — busts + reloads active company; returns summary
        object compatible with TAB_REFRESH contract in main.js.

   To wire a new company with live data:
     1. Add/verify its entry in IPP_COMPANIES.
     2. Create a scrape script (scripts/scrape-ipp-{key}.mjs) using Firecrawl
        against the company's bseUrl / irUrl / annualReportUrl.
     3. Commit the resulting ./data/ipp-{key}.json.
     4. loadIPPCompanyData() will pick it up on the next load automatically.

   Source hierarchy per company (in order of preference):
     Listed-India : BSE announcements + NSE filings + company IR page
     Listed-US    : SEC / 6-K filings + IR page
     Unlisted     : company IR page + press releases
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Company universe ───────────────────────────────────────────────────────
   Add new companies here; the selector, filter dropdown, and comparison
   table all derive from this list automatically.

   category values:
     'listed-india'             BSE + NSE filings available
     'subsidiary-listed-parent' subsidiary; use parent exchange codes
     'listed-us'                US-listed (SEC filings)
     'unlisted'                 private; IR page + press releases only

   BSE/NSE codes are verified against exchange records as of Apr 2026.
   ─────────────────────────────────────────────────────────────────────────── */
const IPP_COMPANIES = [
  {
    key:       'adani-green',
    name:      'Adani Green',
    color:     '#f59e0b',
    category:  'listed-india',
    bseCode:   '541450',
    nseSymbol: 'ADANIGREEN',
    irUrl:     'https://www.adanigreenenergy.com/investors',
    bseUrl:    'https://www.bseindia.com/stock-share-price/adani-green-energy-ltd/adanigreen/541450/',
    nseUrl:    'https://www.nseindia.com/get-quotes/equity?symbol=ADANIGREEN',
    annualReportUrl: 'https://www.adanigreenenergy.com/investors/annual-reports',
    active:    true,
  },
  {
    key:       'renew-power',
    name:      'ReNew Power',
    color:     '#3b82f6',
    category:  'unlisted',   // NASDAQ:RNW delisted 2023 (privatised); NSE re-listing under exploration
    bseCode:   null,
    nseSymbol: null,
    irUrl:     'https://www.renewpower.in/investors',
    bseUrl:    null,
    nseUrl:    null,
    annualReportUrl: 'https://www.renewpower.in/investors',
    active:    true,
  },
  {
    key:       'greenko',
    name:      'Greenko',
    color:     '#22c55e',
    category:  'unlisted',   // private; backed by GIC / ADIA / ORIX
    bseCode:   null,
    nseSymbol: null,
    irUrl:     'https://www.greenkogroup.com/',
    bseUrl:    null,
    nseUrl:    null,
    annualReportUrl: null,
    active:    true,
  },
  {
    key:       'ntpc-renewable',
    name:      'NTPC Renewable',
    color:     '#a855f7',
    // 100% subsidiary of listed NTPC Ltd; subsidiary itself is unlisted.
    // Source: NTPC parent filings (BSE:532555) which disclose RE subsidiary separately.
    category:  'subsidiary-listed-parent',
    bseCode:   '532555',
    nseSymbol: 'NTPC',
    irUrl:     'https://www.ntpc.co.in/en/investors',
    bseUrl:    'https://www.bseindia.com/stock-share-price/ntpc-ltd/ntpc/532555/',
    nseUrl:    'https://www.nseindia.com/get-quotes/equity?symbol=NTPC',
    annualReportUrl: 'https://www.ntpc.co.in/en/investors/annual-report',
    active:    true,
  },
  {
    key:       'jsw-energy',
    name:      'JSW Energy',
    color:     '#f97316',
    category:  'listed-india',
    bseCode:   '533148',
    nseSymbol: 'JSWENERGY',
    irUrl:     'https://www.jsw.in/energy/investors',
    bseUrl:    'https://www.bseindia.com/stock-share-price/jsw-energy-ltd/jswenergy/533148/',
    nseUrl:    'https://www.nseindia.com/get-quotes/equity?symbol=JSWENERGY',
    annualReportUrl: 'https://www.jsw.in/energy/investors/annual-reports',
    active:    true,
  },
  {
    key:       'torrent-power',
    name:      'Torrent Power',
    color:     '#14b8a6',
    category:  'listed-india',
    bseCode:   '532779',
    nseSymbol: 'TORNTPOWER',
    irUrl:     'https://www.torrentpower.com/investors.php',
    bseUrl:    'https://www.bseindia.com/stock-share-price/torrent-power-ltd/torntpower/532779/',
    nseUrl:    'https://www.nseindia.com/get-quotes/equity?symbol=TORNTPOWER',
    annualReportUrl: 'https://www.torrentpower.com/annual-reports.php',
    active:    true,
  },
  {
    key:       'acme-solar',
    name:      'Acme Solar',
    color:     '#6366f1',
    category:  'listed-india',   // IPO Dec 2024; BSE: 544120 / NSE: ACMESOLAR
    bseCode:   '544120',
    nseSymbol: 'ACMESOLAR',
    irUrl:     'https://acme.in/investor-relations',
    bseUrl:    'https://www.bseindia.com/stock-share-price/acme-solar-holdings-ltd/acmesolar/544120/',
    nseUrl:    'https://www.nseindia.com/get-quotes/equity?symbol=ACMESOLAR',
    annualReportUrl: 'https://acme.in/investor-relations',
    active:    true,
  },
];

/* ─── Convenience lookup ────────────────────────────────────────────────── */
const IPP_COMPANY_BY_NAME = Object.fromEntries(IPP_COMPANIES.map(c => [c.name, c]));
const IPP_COMPANY_NAMES   = IPP_COMPANIES.filter(c => c.active).map(c => c.name);

/* ─── Per-company data cache ────────────────────────────────────────────────
   Entries: { loadedAt, source, data: { kpi, fin, mix, cod, ann, color } }
   ─────────────────────────────────────────────────────────────────────────── */
const IPP_COMPANY_CACHE  = {};
const IPP_CACHE_TTL_MS   = 5 * 60 * 1000;   // 5 min

/* ─── Data loader ────────────────────────────────────────────────────────────
   Three-tier:
     1. Memory cache (warm and fresh) → immediate return
     2. Committed scrape JSON at ./data/ipp-{key}.json → overlay on mock shape
     3. MOCK.ipp data for this company → always available
   ─────────────────────────────────────────────────────────────────────────── */
async function loadIPPCompanyData(name) {
  const cached = IPP_COMPANY_CACHE[name];
  if (cached && (Date.now() - cached.loadedAt) < IPP_CACHE_TTL_MS) return cached;

  const co   = IPP_COMPANY_BY_NAME[name];
  const mock = MOCK.ipp;

  // Try live scrape JSON for this company
  if (co) {
    try {
      const r = await fetch(`./data/ipp-${co.key}.json`, { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        // Overlay scraped fields on top of mock shape so any missing field
        // falls back gracefully.
        const entry = {
          loadedAt:  Date.now(),
          source:    'scraped',
          scrapedAt: j.scrapedAt || null,
          co,
          data: _mergeWithMock(name, j, co),
        };
        IPP_COMPANY_CACHE[name] = entry;
        return entry;
      }
    } catch { /* CORS / 404 — fall through to mock */ }
  }

  // Mock fallback
  const entry = {
    loadedAt:  Date.now(),
    source:    'mock',
    scrapedAt: null,
    co:        co || null,
    data:      _mockDataFor(name),
  };
  IPP_COMPANY_CACHE[name] = entry;
  return entry;
}

function _mockDataFor(name) {
  const mock = MOCK.ipp;
  return {
    kpi:   mock.kpis[name]          || { opCapacity:'—', ucCapacity:'—', ppa:'—', capex:'—' },
    fin:   mock.financials[name]    || { netDebt:'—', leverage:'—', debtEquity:'—', yield:'—', revCGR:'—' },
    mix:   mock.portfolioMix[name]  || { Solar: 100 },
    cod:   mock.codTimeline[name]   || [],
    ann:   mock.announcements[name] || mock.announcements['Adani Green'] || [],
    color: mock.companyColors[name] || '#f59e0b',
  };
}

/* Merge a scraped JSON payload onto the mock shape.
   Any field present in the scraped JSON overrides the mock value.
   Called per-company when a committed data/ipp-{key}.json exists.         */
function _mergeWithMock(name, scraped, co) {
  const base  = _mockDataFor(name);
  const color = co ? co.color : base.color;
  return {
    kpi:   scraped.kpi   ? { ...base.kpi,  ...scraped.kpi  } : base.kpi,
    fin:   scraped.fin   ? { ...base.fin,  ...scraped.fin  } : base.fin,
    mix:   scraped.mix   || base.mix,
    cod:   scraped.cod   || base.cod,
    ann:   scraped.ann   || base.ann,
    color: scraped.color || color,
  };
}

/* ─── Cache control ─────────────────────────────────────────────────────── */
function bustIPPCache(name) {
  if (name) delete IPP_COMPANY_CACHE[name];
  else Object.keys(IPP_COMPANY_CACHE).forEach(k => delete IPP_COMPANY_CACHE[k]);
}

/* ─── Tab-level refresh (called by TAB_REFRESH.ipp in main.js) ───────────
   Busts cache for the active company, reloads, re-renders, returns summary.
   ─────────────────────────────────────────────────────────────────────────── */
async function refreshIPPTab() {
  const start   = Date.now();
  const company = typeof activeIPP !== 'undefined' ? activeIPP : IPP_COMPANY_NAMES[0];
  let ok = 0, errored = 0;

  bustIPPCache(company);
  try {
    await loadIPPCompanyData(company);
    if (typeof renderIPPTab === 'function') renderIPPTab(company);
    ok = 1;
  } catch {
    errored = 1;
  }

  return { summary: { ok, errored, skipped: 0, durationMs: Date.now() - start } };
}
