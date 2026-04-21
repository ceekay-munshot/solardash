#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   Demand-tab KPI scraper
   Writes: data/demand-kpis.json
   Usage:  FIRECRAWL_API_KEY=fc-... node scripts/scrape-demand-kpis.mjs

   KPIs:
     1. totalSolarGW    — MNRE Physical Progress PDF  (all-India solar MW)
     2. solarSharePct   — CEA Executive Summary PDF   (solar BU / total BU × 100)
     3. peakDemandMW    — Grid India Monthly Report   (FY YTD peak)
     4. demandGrowthPct — CEA Executive Summary PDF   (FY req BU YoY %)

   All sources are official, direct-document URLs.
   The script never hardcodes numbers — only URLs.
   ═══════════════════════════════════════════════════════════════════════════ */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join }    from 'node:path';
import { fileURLToPath }    from 'node:url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const OUT     = join(__dir, '..', 'data', 'demand-kpis.json');
const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) { console.error('FIRECRAWL_API_KEY required'); process.exit(2); }

/* ══════════════════════════════════════════════════════════════════════════
   SHARED ROUTINE — one function for every URL in this script
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

/* ── Extract the first URL in markdown text matching a regex ────────────── */
function firstUrl(md, re) {
  const m = md.match(re);
  return m ? m[0] : null;
}

/* ── Try a list of candidate URLs, return first that resolves (HTTP 200) ──
   Uses GET with a 1-byte Range header (HEAD is often blocked/misconfigured
   on older IIS/Apache setups behind these gov sites). */
async function firstOk(urls) {
  for (const u of urls) {
    try {
      const r = await fetch(u, { method: 'GET', headers: { Range: 'bytes=0-0' } });
      if (r.ok || r.status === 206) return u;
    } catch { /* skip */ }
  }
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
   SOURCE CONFIGS  — change URLs here, nowhere else
   ══════════════════════════════════════════════════════════════════════════ */

/* Source A: MNRE Physical Progress listing page
   PDF lives on S3-backed CDN; URL changes each month when MNRE posts new data. */
const MNRE_PAGE    = 'https://mnre.gov.in/en/physical-progress/';
const MNRE_RE      = /https?:\/\/cdnbbsr\.s3waas\.gov\.in\/[^\s"')]+\.pdf/;

/* Source B: CEA Executive Summary — power sector summary PDF (monthly)
   Page lists downloadable PDFs; URL changes each month.
   Fallback: construct URL from known naming pattern (last 3 months). */
const CEA_EXEC_PAGE = 'https://cea.nic.in/executive-summary-report/?lang=en';
const CEA_EXEC_RE   = /https?:\/\/cea\.nic\.in\/wp-content\/uploads\/executive\/[^\s"')]+\.pdf/;

function ceaFallbackUrls() {
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const abbr   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now    = new Date();
  const urls   = [];
  for (let delta = 1; delta <= 3; delta++) {
    const d  = new Date(now.getFullYear(), now.getMonth() - delta, 1);
    const y  = d.getFullYear();
    const m0 = String(d.getMonth() + 1).padStart(2, '0');
    const mn = months[d.getMonth()];
    const ma = abbr[d.getMonth()];
    // published folder is same month or one month later
    for (const pub of [m0, String(d.getMonth() + 2).padStart(2, '0')]) {
      const base = `https://cea.nic.in/wp-content/uploads/executive/${y}/${pub}`;
      urls.push(`${base}/Executive_Summary_${mn}_${y}_Aztual_updated.pdf`);
      urls.push(`${base}/Executive_Summary_${mn}_${y}_Aztual_Updated.pdf`);
      urls.push(`${base}/Executive_Summary_${ma}_${y}_Aztual_updated.pdf`);
      urls.push(`${base}/Executive_Summary_${ma}_${y}.pdf`);
      urls.push(`${base}/executive.pdf`);
    }
  }
  return urls;
}

/* Source C: Grid India Monthly Reports listing page.
   Fallback chain: known monthly executive summary PDFs → live PSP page. */
const GRID_PAGE  = 'https://grid-india.in/en/reports/monthly-reports/';
const GRID_RE    = /https?:\/\/(?:report\.)?grid-india\.in\/[^\s"')]+\.pdf/;

function gridFallbackUrls() {
  // PSP daily PDFs at report.grid-india.in follow:
  //   /ReportData/Daily%20Report/PSP%20Report/{FY}/{Month%20YYYY}/{DD.MM.YY}_NLDC_PSP.pdf
  // The report is not published every day (weekends/holidays skipped), so try
  // several candidate days for each recent month.
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const now  = new Date();
  const urls = [];
  // Try days 15, 20, 25, 10, 5 for each of the last 3 months
  const candidateDays = [15, 20, 25, 10, 5];
  for (let delta = 1; delta <= 3; delta++) {
    const base = new Date(now.getFullYear(), now.getMonth() - delta + 1, 1);
    const year = base.getFullYear();
    const monthIdx = base.getMonth() === 0 ? 11 : base.getMonth() - 1;
    // Use the month before `base` (i.e. the target month at delta offset)
    const target = new Date(year, monthIdx, 1);
    const ty = target.getFullYear();
    const tm = target.getMonth();
    const mName = months[tm];
    const mm = String(tm + 1).padStart(2, '0');
    const yy = String(ty).slice(-2);
    const fy = tm >= 3 ? `${ty}-${ty + 1}` : `${ty - 1}-${ty}`;
    for (const day of candidateDays) {
      const dd = String(day).padStart(2, '0');
      urls.push(
        `https://report.grid-india.in/ReportData/Daily%20Report/PSP%20Report/${fy}/${mName}%20${ty}/${dd}.${mm}.${yy}_NLDC_PSP.pdf`
      );
    }
  }
  // Live PSP page as last resort (shows current day only)
  urls.push('https://report.grid-india.in/psp_report.php');
  return urls;
}

/* ══════════════════════════════════════════════════════════════════════════
   EXTRACTION SCHEMAS — one per source, reusing the shared fc() routine
   ══════════════════════════════════════════════════════════════════════════ */
const MNRE_SCHEMA = {
  type: 'object', properties: {
    dataAsOf:         { type: 'string', description: 'Date the data covers, e.g. "31 March 2026" — appears in the document title or caption' },
    totalSolarMW:     { type: 'number', description: 'ALL-INDIA grand total solar installed capacity in MW — the single number in the "Grand Total" or "All India" summary row under the "Solar Power Total" column. This should be the sum of all states and is typically 140,000–200,000 MW (140–200 GW) as of 2026. Do NOT return a single state\'s solar capacity.' },
    groundMountedMW:  { type: 'number', description: 'Grand total ground-mounted solar (GMS) in MW — also from the Grand Total row' },
    rooftopMW:        { type: 'number', description: 'Grand total rooftop solar (RTS / PM-Surya Ghar) in MW — Grand Total row' },
  },
};
const MNRE_PROMPT =
  'This is the MNRE Physical Progress PDF — a table of renewable energy installed capacity by state. ' +
  'It has 35+ state rows plus a GRAND TOTAL row at the bottom.\n\n' +
  'Extract ONLY from the GRAND TOTAL (all-India summary) row:\n' +
  '  • totalSolarMW — the "Solar Power Total" column value in the Grand Total row\n' +
  '    (This is all-India solar and is typically printed as ~150,000 in 2026)\n' +
  '  • groundMountedMW — ground-mounted solar grand total\n' +
  '  • rooftopMW — rooftop solar grand total\n' +
  '  • dataAsOf — date of the report shown in the title/heading\n\n' +
  'CRITICAL: Return the Grand Total row numbers only. ' +
  'Do NOT return Rajasthan (41,000 MW), Gujarat (29,000 MW) or any other single state. ' +
  'If you cannot find the Grand Total row, return null for all fields.';

const CEA_SCHEMA = {
  type: 'object', properties: {
    reportPeriod:       { type: 'string', description: 'Cumulative FY period, e.g. "Apr 2025 – Feb 2026"' },
    solarBU:            { type: 'number', description: 'Solar generation BU for FY cumulative period (not just the single month)' },
    totalBU:            { type: 'number', description: 'Total all-source generation BU for FY cumulative period' },
    fyReqBU:            { type: 'number', description: 'Energy requirement BU for current FY to date (in BU, NOT MU)' },
    fyPriorReqBU:       { type: 'number', description: 'Energy requirement BU for same FY-to-date period of previous fiscal year (in BU, NOT MU)' },
    reqUnits:           { type: 'string', description: 'Units used for energy requirement in the document — either "BU" or "MU"' },
    allIndiaPeakMW:     { type: 'number', description: 'ALL-INDIA peak demand met (MW) during this report month — the national number (typically 150,000–260,000 MW range), NOT any regional peak' },
    allIndiaPeakDate:   { type: 'string', description: 'Date on which the all-India peak occurred (e.g. "15 Feb 2026")' },
  },
};
const CEA_PROMPT =
  'This is the CEA Executive Summary on Power Sector (India). Extract the following ALL-INDIA figures:\n' +
  '1. solarBU — Solar generation in Billion Units for the cumulative FY-to-date period (not just the single month column)\n' +
  '2. totalBU — Total generation BU for the same cumulative FY period\n' +
  '3. fyReqBU — Energy requirement (BU) for current FY to date — ALL-INDIA total\n' +
  '4. fyPriorReqBU — Energy requirement (BU) for same period in prior FY — ALL-INDIA total\n' +
  '5. reqUnits — Whether the energy requirement figures in the document are in BU or MU\n' +
  '6. allIndiaPeakMW — The ALL-INDIA (national) peak demand met in MW. Do NOT return a regional peak (NR, WR, SR, ER, NER are regional and smaller, typically 50,000-90,000 MW). The all-India peak is much larger, typically 150,000–260,000 MW\n' +
  '7. allIndiaPeakDate — date of the all-India peak\n' +
  '8. reportPeriod — the date range the cumulative figures cover\n\n' +
  'CRITICAL: For peak demand, return only the ALL-INDIA national figure. ' +
  'Regional peaks are smaller — do not confuse with the national peak.\n' +
  'Return null for any value not explicitly in the document. Do not guess.';

const GRID_SCHEMA = {
  type: 'object', properties: {
    fyPeakMW:     { type: 'number', description: 'Maximum peak demand met (MW) for FY 2025-26 year-to-date, if explicitly stated in the document' },
    fyPeakDate:   { type: 'string', description: 'Date on which FY 2025-26 peak occurred, e.g. "09 Jan 2026"' },
    monthPeakMW:  { type: 'number', description: 'Maximum peak demand met (MW) during this specific report month (the "Max Demand Met" figure for the month)' },
    monthName:    { type: 'string', description: 'The month this report covers, e.g. "March 2026"' },
    totalEnergyMU:{ type: 'number', description: 'Total energy met/generated in Million Units (MU) for the month' },
  },
};
const GRID_PROMPT =
  'This is a Grid India (NLDC) Power System Performance (PSP) report for India FY 2025-26.\n' +
  'Extract:\n' +
  '  • fyPeakMW — if the report explicitly states the FY 2025-26 all-year peak demand in MW, extract it\n' +
  '  • fyPeakDate — date the FY peak occurred (e.g. "09 Jan 2026")\n' +
  '  • monthPeakMW — the "Maximum Demand Met" in MW for this specific month (typically 150,000–260,000 MW range)\n' +
  '  • monthName — which month this report is for\n' +
  '  • totalEnergyMU — total energy met in MU for the month\n\n' +
  'For India: peak demand is 150,000–260,000 MW (150–260 GW). ' +
  'Return null for any field not explicitly in the document.';

/* ══════════════════════════════════════════════════════════════════════════
   SCRAPE EACH SOURCE
   ══════════════════════════════════════════════════════════════════════════ */
async function scrapeSource(label, { listPage, urlRe, fallbackUrls, schema, prompt, waitFor = 4000 }) {
  let pdfUrl = null;

  // Step 1: find PDF URL from listing page
  try {
    const { md } = await fc(listPage, { waitFor });
    pdfUrl = firstUrl(md, urlRe);
    if (!pdfUrl) console.log(`  ${label}: listing page yielded no PDF URL — trying fallbacks`);
  } catch (e) {
    console.log(`  ${label}: listing page failed (${e.message}) — trying fallbacks`);
  }

  // Step 2: fallback to candidate URL list
  if (!pdfUrl && fallbackUrls?.length) {
    pdfUrl = await firstOk(fallbackUrls);
    if (pdfUrl) console.log(`  ${label}: fallback URL resolved → ${pdfUrl}`);
    else console.log(`  ${label}: all fallback URLs 404`);
  }

  if (!pdfUrl) return { ok: false, url: listPage, error: 'No PDF URL found' };

  // Step 3: scrape the PDF
  try {
    const { x } = await fc(pdfUrl, { schema, prompt });
    return { ok: true, url: pdfUrl, type: 'PDF', data: x };
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

  // KPI 1: Total Solar GW — from MNRE Physical Progress PDF
  const sm = mnre?.data?.totalSolarMW;
  // Guard: India's solar installed base is 140,000–250,000 MW range in 2025-26
  if (pos(sm) && sm > 100000 && sm < 300000) {
    kpis.totalSolarGW = { value: +(sm / 1000).toFixed(2), asOf: mnre.data.dataAsOf || null,
                          sourceUrl: mnre.url, sourceType: 'PDF' };
  }

  // KPI 2: Solar Share % — calculated from CEA source-wise generation
  const sol = cea?.data?.solarBU, tot = cea?.data?.totalBU;
  if (pos(sol) && pos(tot) && sol < tot) {
    kpis.solarSharePct = { value: +((sol / tot) * 100).toFixed(1),
                           solarBU: sol, totalBU: tot,
                           period: cea?.data?.reportPeriod || null,
                           sourceUrl: cea.url, sourceType: 'PDF' };
  }

  // KPI 3: Peak Demand FY YTD
  //   Primary: Grid India monthly/daily report (fyPeakMW or monthPeakMW)
  //   Fallback: CEA Executive Summary all-India peak MW
  const gpk = grid?.data?.fyPeakMW || grid?.data?.monthPeakMW;
  const cpk = cea?.data?.allIndiaPeakMW;   // new explicit all-India field
  const fpk = (pos(gpk) && gpk > 100000) ? gpk
            : (pos(cpk) && cpk > 100000) ? cpk
            : null;
  if (fpk) {
    const isFromGrid = pos(gpk) && gpk > 100000;
    kpis.peakDemandMW = {
      value:      fpk,
      peakDate:   isFromGrid ? (grid.data.fyPeakDate || null) : (cea?.data?.allIndiaPeakDate || null),
      isFYYTD:    isFromGrid && !!grid?.data?.fyPeakMW,
      sourceUrl:  isFromGrid ? grid.url : cea.url,
      sourceType: 'PDF',
      note:       isFromGrid ? (grid.data.fyPeakMW ? 'FY YTD max' : 'monthly peak from Grid India') : 'monthly peak from CEA Executive Summary',
    };
  }

  // KPI 4: Demand Growth YoY — from CEA energy requirement comparison
  //   LLM sometimes returns numbers in MU instead of BU. Detect by magnitude
  //   and normalise to BU before reporting (YoY % is unit-invariant but
  //   labels must match actual units). India FY demand is ~1400–1700 BU.
  let cur = cea?.data?.fyReqBU, prv = cea?.data?.fyPriorReqBU;
  if (pos(cur) && pos(prv)) {
    const reqUnits = (cea?.data?.reqUnits || '').toUpperCase();
    // If values look like MU (>50,000 — India's annual demand in BU is ~1700)
    // OR if the document says "MU", divide by 1000 to get BU.
    if (cur > 50000 || prv > 50000 || reqUnits === 'MU') {
      cur = cur / 1000;
      prv = prv / 1000;
    }
    if (cur > 100 && prv > 100 && cur < 2500 && prv < 2500) {
      kpis.demandGrowthPct = { value: +(((cur - prv) / prv) * 100).toFixed(1),
                                currentBU: +cur.toFixed(1), priorBU: +prv.toFixed(1),
                                period: cea?.data?.reportPeriod || null,
                                sourceUrl: cea.url, sourceType: 'PDF' };
    }
  }

  return kpis;
}

/* Print raw extracted values from each source (helps debug failed validations) */
function debugRaw(mnre, cea, grid) {
  if (mnre?.data) {
    console.log('\n  MNRE raw:', JSON.stringify(mnre.data));
  }
  if (cea?.data) {
    console.log('  CEA raw:', JSON.stringify(cea.data));
  }
  if (grid?.data) {
    console.log('  Grid raw:', JSON.stringify(grid.data));
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════════════════════ */
console.log('Demand-tab KPI scrape\n');

const [mnre, cea, grid] = await Promise.all([
  scrapeSource('MNRE', {
    listPage:     MNRE_PAGE,
    urlRe:        MNRE_RE,
    schema:       MNRE_SCHEMA,
    prompt:       MNRE_PROMPT,
  }),
  scrapeSource('CEA Exec', {
    listPage:     CEA_EXEC_PAGE,
    urlRe:        CEA_EXEC_RE,
    fallbackUrls: ceaFallbackUrls(),
    schema:       CEA_SCHEMA,
    prompt:       CEA_PROMPT,
  }),
  scrapeSource('Grid India', {
    listPage:     GRID_PAGE,
    urlRe:        GRID_RE,
    fallbackUrls: gridFallbackUrls(),
    schema:       GRID_SCHEMA,
    prompt:       GRID_PROMPT,
    waitFor:      6000,
  }),
]);

debugRaw(mnre, cea, grid);
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

// Report
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
