#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   Demand-tab KPI scraper
   Writes: data/demand-kpis.json
   Usage:  FIRECRAWL_API_KEY=fc-... node scripts/scrape-demand-kpis.mjs

   KPIs:
     1. totalSolarGW    — MNRE Physical Progress PDF  (all-India solar MW)
     2. solarSharePct   — CEA Executive Summary PDF   (solar BU / total BU × 100)
     3. peakDemandMW    — Grid India PSP daily report (monthly peak demand)
     4. demandGrowthPct — CEA Executive Summary PDF   (FY req BU YoY %)

   All sources are official direct-document URLs (no ministry homepages).
   The script never hardcodes numbers — only URLs.

   FALLBACK STRATEGY
   -----------------
   The Indian gov listing pages (mnre.gov.in, cea.nic.in, grid-india.in) are
   intermittently unreachable via Firecrawl (rate-limiting / IP blocks).
   Direct fetch() from Node is also rejected (no browser UA).

   Solution: every source has a directTry fallback list — URLs sent straight
   to Firecrawl without probing first. Firecrawl uses a real browser and can
   reach PDF files the gov servers would otherwise block. The fallback list
   always starts with the most-recently confirmed working URL (hardcoded as
   LAST_KNOWN_* consts) so a stale-but-valid value is available immediately
   if newer months haven't been posted yet.
   ═══════════════════════════════════════════════════════════════════════════ */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join }    from 'node:path';
import { fileURLToPath }    from 'node:url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const OUT     = join(__dir, '..', 'data', 'demand-kpis.json');
const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) { console.error('FIRECRAWL_API_KEY required'); process.exit(2); }

/* ══════════════════════════════════════════════════════════════════════════
   SHARED FIRECRAWL ROUTINE — used for every URL in this script
   ══════════════════════════════════════════════════════════════════════════ */
async function fc(url, { schema, prompt, waitFor = 3000 } = {}) {
  const formats = ['markdown'];
  const body    = { url, formats, onlyMainContent: true, waitFor, timeout: 60000 };
  if (schema) { formats.push('extract'); body.extract = { schema, prompt }; }

  const r = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const p = await r.json().catch(() => ({}));
  if (!r.ok || p.success === false) throw new Error(p.error || `HTTP ${r.status}`);
  return { md: (p.data||{}).markdown || '', x: (p.data||{}).extract ?? null };
}

function firstUrl(md, re) {
  const m = md.match(re);
  return m ? m[0] : null;
}

/* ══════════════════════════════════════════════════════════════════════════
   SOURCE CONFIGS — change URLs here, nowhere else
   ══════════════════════════════════════════════════════════════════════════ */

/* ── MNRE Physical Progress
   PDF on S3-CDN; URL changes monthly. Listing page reveals the new URL.
   LAST_KNOWN_MNRE_PDF: confirmed working as of April 2026 scrape run.
   Update this const after each successful scrape for a new month. */
const MNRE_PAGE         = 'https://mnre.gov.in/en/physical-progress/';
const MNRE_RE           = /https?:\/\/cdnbbsr\.s3waas\.gov\.in\/[^\s"')]+\.pdf/;
const LAST_KNOWN_MNRE_PDF =
  'https://cdnbbsr.s3waas.gov.in/s3716e1b8c6cd17b771da77391355749f3/uploads/2026/04/20260415955675604.pdf';

/* ── CEA Executive Summary
   Published monthly at a consistent path pattern. Listing page reveals the
   exact filename. LAST_KNOWN_CEA_PDF: Feb 2026 confirmed working.
   Update after each successful run. */
const CEA_EXEC_PAGE     = 'https://cea.nic.in/executive-summary-report/?lang=en';
const CEA_EXEC_RE       = /https?:\/\/cea\.nic\.in\/wp-content\/uploads\/executive\/[^\s"')]+\.pdf/;
const LAST_KNOWN_CEA_PDF =
  'https://cea.nic.in/wp-content/uploads/executive/2026/02/Executive_Summary_February_2026_Actual.pdf';

function ceaFallbackUrls() {
  // Try recent months newest-first; each month tries the 3 most common filename patterns.
  // "_Actual" = correct spelling used in FY26+ files (confirmed).
  // "_Aztual_updated" = legacy typo spelling used in FY25 and earlier files.
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const abbr   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now    = new Date();
  const urls   = [];
  for (let delta = 1; delta <= 4; delta++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - delta, 1);
    const y   = d.getFullYear();
    const m0  = String(d.getMonth() + 1).padStart(2, '0');
    const mn  = months[d.getMonth()];
    const ma  = abbr[d.getMonth()];
    // published folder = same month or month+1
    for (const pub of [m0, String(d.getMonth() + 2).padStart(2, '0')]) {
      const base = `https://cea.nic.in/wp-content/uploads/executive/${y}/${pub}`;
      urls.push(`${base}/Executive_Summary_${mn}_${y}_Actual.pdf`);         // FY26+
      urls.push(`${base}/Executive_Summary_${mn}_${y}_Aztual_updated.pdf`); // FY25-
      urls.push(`${base}/Executive_Summary_${ma}_${y}_Actual.pdf`);
      urls.push(`${base}/Executive_Summary_${ma}_${y}_Aztual_updated.pdf`);
      urls.push(`${base}/executive.pdf`);
    }
  }
  // Guaranteed fallback — confirmed working, may be 1-2 months stale
  urls.push(LAST_KNOWN_CEA_PDF);
  return urls;
}

/* ── Grid India PSP daily reports
   Path: /ReportData/Daily Report/PSP Report/{FY}/{Month YYYY}/{DD.MM.YY}_NLDC_PSP.pdf
   PSP server rejects all probe methods (HEAD, Range GET) from Node but works
   fine when fetched via Firecrawl's browser. Use directTry mode.
   Try mid-month days (fewer holidays) for the last 3 months. */
const GRID_PAGE = 'https://grid-india.in/en/reports/monthly-reports/';
const GRID_RE   = /https?:\/\/(?:report\.)?grid-india\.in\/[^\s"')]+\.pdf/i;

function gridFallbackUrls() {
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const now  = new Date();
  const urls = [];
  const days = [17, 18, 16, 15, 20, 19, 12, 14, 21, 22];  // weekday-safe days
  for (let delta = 1; delta <= 3; delta++) {
    const d   = new Date(now.getFullYear(), now.getMonth() - delta, 1);
    const ty  = d.getFullYear();
    const tm  = d.getMonth();
    const mn  = monthNames[tm];
    const mm  = String(tm + 1).padStart(2, '0');
    const yy  = String(ty).slice(-2);
    const fy  = tm >= 3 ? `${ty}-${ty + 1}` : `${ty - 1}-${ty}`;
    for (const day of days) {
      const dd = String(day).padStart(2, '0');
      urls.push(
        `https://report.grid-india.in/ReportData/Daily%20Report/PSP%20Report/${fy}/${mn}%20${ty}/${dd}.${mm}.${yy}_NLDC_PSP.pdf`
      );
    }
  }
  return urls;
}

/* ══════════════════════════════════════════════════════════════════════════
   EXTRACTION SCHEMAS
   ══════════════════════════════════════════════════════════════════════════ */
const MNRE_SCHEMA = {
  type: 'object', properties: {
    dataAsOf:    { type: 'string', description: 'Date the data covers, e.g. "31 March 2026"' },
    totalSolarMW:{ type: 'number',
      description: 'ALL-INDIA grand total solar installed capacity in MW from the Grand Total / All India summary row under the "Solar Power Total" column. Typically ~150,000 MW in 2026. Do NOT return a single state value.' },
  },
};
const MNRE_PROMPT =
  'This is the MNRE Physical Progress PDF — a table of renewable energy installed capacity by state with a GRAND TOTAL row. ' +
  'Extract ONLY from the GRAND TOTAL (all-India) row: ' +
  'totalSolarMW (the "Solar Power Total" column in the Grand Total row, ~150,000 in 2026) ' +
  'and dataAsOf (the report date). ' +
  'Do NOT return Rajasthan or any other individual state figure.';

const CEA_SCHEMA = {
  type: 'object', properties: {
    reportPeriod:    { type: 'string', description: 'Cumulative FY period e.g. "Apr 2025 – Feb 2026"' },
    solarBU:         { type: 'number', description: 'Solar generation BU for the cumulative FY period (not just the single month)' },
    totalBU:         { type: 'number', description: 'Total all-source generation BU for the same cumulative FY period' },
    fyReqBU:         { type: 'number', description: 'Energy requirement for current FY to date — in BU or MU as printed' },
    fyPriorReqBU:    { type: 'number', description: 'Energy requirement for same FY-to-date period of previous fiscal year — same units' },
    reqUnits:        { type: 'string', description: '"BU" or "MU" — the units used for energy requirement in the document' },
    allIndiaPeakMW:  { type: 'number',
      description: 'ALL-INDIA (national) peak demand met in MW. Must be 150,000–260,000 range. Do NOT return a regional peak (NR/WR/SR/ER/NER which are 50,000–90,000 MW).' },
    allIndiaPeakDate:{ type: 'string', description: 'Date the all-India peak occurred e.g. "15 Feb 2026"' },
  },
};
const CEA_PROMPT =
  'CEA Executive Summary on Power Sector (India). Extract ALL-INDIA figures:\n' +
  '  solarBU — cumulative FY solar generation in BU (not single month)\n' +
  '  totalBU — cumulative FY total generation in BU\n' +
  '  fyReqBU / fyPriorReqBU — energy requirement current vs prior FY-to-date\n' +
  '  reqUnits — "BU" or "MU"\n' +
  '  allIndiaPeakMW — NATIONAL peak demand in MW (150k–260k range). NOT a regional peak.\n' +
  '  reportPeriod — cumulative date range\n' +
  'Return null for anything not explicitly in the document.';

const GRID_SCHEMA = {
  type: 'object', properties: {
    monthPeakMW:  { type: 'number', description: 'Maximum demand met in MW for this report day/month (national all-India figure, typically 150,000–260,000 MW)' },
    reportDate:   { type: 'string', description: 'Date this report covers e.g. "17 March 2026"' },
    energyMetMU:  { type: 'number', description: 'Total energy met in MU for this report day or month period' },
  },
};
const GRID_PROMPT =
  'Grid India NLDC Power System Performance (PSP) report. ' +
  'Extract the ALL-INDIA maximum demand met in MW (national figure, 150k–260k range), ' +
  'the report date, and total energy met in MU. Return null for anything not in the document.';

/* ══════════════════════════════════════════════════════════════════════════
   SCRAPE EACH SOURCE
   directTry = true: skip probing, send each fallback URL to Firecrawl until
     one returns non-null extracted data. Needed when direct fetch() is blocked.
   directTry = false (default): use listing page only; no URL-probe fallback.
   ══════════════════════════════════════════════════════════════════════════ */
async function scrapeSource(label, { listPage, urlRe, fallbackUrls, schema, prompt, waitFor = 4000, directTry = false }) {
  let pdfUrl = null;

  // Step 1: listing page → regex PDF URL
  try {
    const { md } = await fc(listPage, { waitFor });
    pdfUrl = firstUrl(md, urlRe);
    if (!pdfUrl) console.log(`  ${label}: listing page yielded no PDF link — trying fallbacks`);
  } catch (e) {
    console.log(`  ${label}: listing page failed (${e.message}) — trying fallbacks`);
  }

  // Step 2: directTry — pass each candidate directly to Firecrawl
  if (!pdfUrl && directTry && fallbackUrls?.length) {
    for (const u of fallbackUrls) {
      try {
        const { x } = await fc(u, { schema, prompt, waitFor });
        if (x && Object.values(x).some(v => v !== null && v !== undefined)) {
          console.log(`  ${label}: direct fallback succeeded → ${u}`);
          return { ok: true, url: u, type: u.toLowerCase().endsWith('.pdf') ? 'PDF' : 'HTML', data: x };
        }
      } catch { /* Firecrawl returned error (404 / blocked) → try next */ }
    }
    console.log(`  ${label}: all fallbacks exhausted`);
    return { ok: false, url: listPage, error: 'All fallback URLs failed' };
  }

  if (!pdfUrl) return { ok: false, url: listPage, error: 'No PDF link found and no directTry fallbacks' };

  // Step 3: scrape the discovered URL
  try {
    const { x } = await fc(pdfUrl, { schema, prompt, waitFor });
    return { ok: true, url: pdfUrl, type: pdfUrl.toLowerCase().endsWith('.pdf') ? 'PDF' : 'HTML', data: x };
  } catch (e) {
    return { ok: false, url: pdfUrl, error: e.message };
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   NORMALISE + VALIDATE
   ══════════════════════════════════════════════════════════════════════════ */
function pos(n) { return typeof n === 'number' && isFinite(n) && n > 0; }

function normalise(mnre, cea, grid) {
  const kpis = {};

  // KPI 1: Total Solar GW from MNRE Physical Progress PDF
  const sm = mnre?.data?.totalSolarMW;
  if (pos(sm) && sm > 100000 && sm < 300000) {
    kpis.totalSolarGW = { value: +(sm / 1000).toFixed(2), asOf: mnre.data.dataAsOf || null,
                          sourceUrl: mnre.url, sourceType: 'PDF' };
  }

  // KPI 2: Solar Share % = solar BU / total BU × 100
  const sol = cea?.data?.solarBU, tot = cea?.data?.totalBU;
  if (pos(sol) && pos(tot) && sol < tot && sol > 1) {
    kpis.solarSharePct = { value: +((sol / tot) * 100).toFixed(1),
                           solarBU: sol, totalBU: tot,
                           period: cea?.data?.reportPeriod || null,
                           sourceUrl: cea.url, sourceType: 'PDF' };
  }

  // KPI 3: Peak Demand — Grid India PSP primary, CEA all-India fallback
  const gpk = grid?.data?.monthPeakMW;
  const cpk = cea?.data?.allIndiaPeakMW;
  const fpk = (pos(gpk) && gpk > 100000) ? gpk
            : (pos(cpk) && cpk > 100000) ? cpk
            : null;
  if (fpk) {
    const fromGrid = pos(gpk) && gpk > 100000;
    kpis.peakDemandMW = {
      value:      fpk,
      peakDate:   fromGrid ? (grid.data.reportDate || null) : (cea?.data?.allIndiaPeakDate || null),
      sourceUrl:  fromGrid ? grid.url : cea.url,
      sourceType: 'PDF',
      note:       fromGrid ? 'monthly peak from Grid India PSP report'
                           : 'monthly peak from CEA Executive Summary',
    };
  }

  // KPI 4: Demand Growth YoY from CEA energy requirement comparison
  // LLM sometimes returns MU instead of BU — detect by magnitude and normalise.
  // India FY demand: ~1400–1700 BU  or  ~1,400,000–1,700,000 MU
  let cur = cea?.data?.fyReqBU, prv = cea?.data?.fyPriorReqBU;
  if (pos(cur) && pos(prv)) {
    const reqUnits = (cea?.data?.reqUnits || '').toUpperCase();
    if (cur > 50000 || prv > 50000 || reqUnits === 'MU') { cur /= 1000; prv /= 1000; }
    if (cur > 100 && prv > 100 && cur < 2500 && prv < 2500) {
      kpis.demandGrowthPct = { value: +(((cur - prv) / prv) * 100).toFixed(1),
                                currentBU: +cur.toFixed(1), priorBU: +prv.toFixed(1),
                                period: cea?.data?.reportPeriod || null,
                                sourceUrl: cea.url, sourceType: 'PDF' };
    }
  }

  return kpis;
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════════════ */
console.log('Demand-tab KPI scrape\n');

const [mnre, cea, grid] = await Promise.all([
  scrapeSource('MNRE', {
    listPage:    MNRE_PAGE,
    urlRe:       MNRE_RE,
    fallbackUrls:[LAST_KNOWN_MNRE_PDF],
    schema:      MNRE_SCHEMA,
    prompt:      MNRE_PROMPT,
    directTry:   true,
  }),
  scrapeSource('CEA Exec', {
    listPage:    CEA_EXEC_PAGE,
    urlRe:       CEA_EXEC_RE,
    fallbackUrls:ceaFallbackUrls(),
    schema:      CEA_SCHEMA,
    prompt:      CEA_PROMPT,
    directTry:   true,
  }),
  scrapeSource('Grid India', {
    listPage:    GRID_PAGE,
    urlRe:       GRID_RE,
    fallbackUrls:gridFallbackUrls(),
    schema:      GRID_SCHEMA,
    prompt:      GRID_PROMPT,
    waitFor:     6000,
    directTry:   true,
  }),
]);

// Print raw extracted values for debugging
if (mnre?.data) console.log('\n  MNRE raw:', JSON.stringify(mnre.data));
if (cea?.data)  console.log('  CEA raw:', JSON.stringify(cea.data));
if (grid?.data) console.log('  Grid raw:', JSON.stringify(grid.data));

const kpis = normalise(mnre, cea, grid);
const out  = {
  scrapedAt: new Date().toISOString(),
  sources: {
    mnre:     { ok: mnre.ok,  url: mnre.url,  type: mnre.type  || null, error: mnre.error  || null },
    cea:      { ok: cea.ok,   url: cea.url,   type: cea.type   || null, error: cea.error   || null },
    gridIndia:{ ok: grid.ok,  url: grid.url,  type: grid.type  || null, error: grid.error  || null },
  },
  kpis,
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2));

const filled = Object.keys(kpis).length;
console.log(`\nSources:`);
for (const [k, s] of Object.entries(out.sources))
  console.log(`  ${s.ok ? '✓' : '✗'} ${k.padEnd(12)} ${s.type || '?'} — ${s.url}`);
console.log(`\nKPIs extracted: ${filled}/4`);
for (const [k, v] of Object.entries(kpis))
  console.log(`  ✓ ${k}: ${JSON.stringify(v.value)} (${v.sourceUrl})`);
if (filled < 4)
  console.log(`  ✗ ${4 - filled} KPI(s) not extracted → dashboard falls back to MOCK`);
console.log(`\nWrote ${OUT}`);
