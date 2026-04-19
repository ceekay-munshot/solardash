#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   Adani Green Energy — Firecrawl scrape script
   ───────────────────────────────────────────────────────────────────────────
   Scrapes 4 public sources and writes data/ipp-adani-green.json.
   That file is auto-picked-up by js/real-data-ipp-companies.js →
   loadIPPCompanyData('Adani Green') → rendered by tab-ipp.js.

   Usage:
     FIRECRAWL_API_KEY=fc-... node scripts/scrape-ipp-adani-green.mjs

   Re-run any time to refresh. The dashboard picks up the new JSON on the
   next page load (or when the Refresh button is clicked).

   Sources (all official public):
     1. Adani Green investor presentations (latest operational update / Q-deck)
        https://www.adanigreenenergy.com/investors/investor-presentations
     2. Adani Green quarterly financial results
        https://www.adanigreenenergy.com/investors/financial-results
     3. BSE corporate announcements for ADANIGREEN (BSE: 541450)
        https://www.bseindia.com/corporates/ann.html?scrip=541450&dur=D
     4. SECI tenders — for project-win pipeline cross-check
        https://www.seci.co.in/tenders

   Output schema  →  data/ipp-adani-green.json
     See SCHEMA comment below for field definitions.
   ═══════════════════════════════════════════════════════════════════════════ */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join }    from 'node:path';
import { fileURLToPath }    from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const OUT_PATH  = join(REPO_ROOT, 'data', 'ipp-adani-green.json');

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error('ERROR: FIRECRAWL_API_KEY env var is required.');
  console.error('Usage: FIRECRAWL_API_KEY=fc-... node scripts/scrape-ipp-adani-green.mjs');
  process.exit(2);
}

const FIRECRAWL = 'https://api.firecrawl.dev/v1/scrape';

/* ─── Output schema (what this script writes to data/ipp-adani-green.json)
   All strings match the shape expected by the KPI card / table cells in
   tab-ipp.js. Leave a field null/undefined if not extractable.

   kpi:
     opCapacity     "11,184"           MW as formatted string (no unit)
     opCapacityAsOf "Q3 FY25"          quarter / date reference
     ucCapacity     "8,800"            MW under construction
     ucCapacityAsOf "Q3 FY25"
     ppa            "22,000"           signed PPA pipeline (MW)
     ppaAsOf        "Q3 FY25"
     capex          "₹1,24,000 Cr"     3-year capex guidance string
     capexPeriod    "FY25–28E"

   fin:
     netDebt        "₹84,000 Cr"
     netDebtAsOf    "Q3 FY25"
     leverage       "7.2x"             net debt / EBITDA
     debtEquity     "4.1x"
     yield          "₹38/unit"         avg realisation per kWh (₹)
     revCGR         "28%"              3-year revenue CAGR
     revCGRPeriod   "FY22–25"

   mix:   { Solar: 68, Wind: 14, Hybrid: 10, FDRE: 8 }  (integers, sum ≈ 100)

   cod:   [{ date: "Jun 25", project: "Khavda Ph-1", mw: 500 }, ...]

   ann:   [{ date: "Apr 2025", title: "...", detail: "...", bseUrl: "..." }, ...]
          bseUrl = direct BSE filing URL if available (else omit)

   sources:   per-source status metadata (ok, url, fetchedAt, error)
   ─────────────────────────────────────────────────────────────────────────── */

async function fcScrape(url, { schema, prompt, waitFor = 2000 } = {}) {
  const formats = ['markdown'];
  const body = { url, formats, onlyMainContent: true, timeout: 60000, waitFor };
  if (schema) {
    formats.push('extract');
    body.extract = { schema, prompt };
  }

  const resp = await fetch(FIRECRAWL, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  let payload;
  try { payload = await resp.json(); } catch { payload = {}; }

  if (!resp.ok || payload.success === false) {
    throw new Error(payload.error || payload.message || `HTTP ${resp.status}`);
  }
  const d = payload.data || {};
  return { markdown: d.markdown || '', extracted: d.extract ?? d.json ?? null };
}

/* ─── Source 1: Adani Green investor presentations listing ─────────────── */
async function scrapeIRPresentations() {
  const { markdown, extracted } = await fcScrape(
    'https://www.adanigreenenergy.com/investors/investor-presentations',
    {
      waitFor: 3000,
      schema: {
        type: 'object',
        properties: {
          latestPresentation: {
            type: 'object',
            properties: {
              title:    { type: 'string', description: 'Title of the most recent investor presentation' },
              url:      { type: 'string', description: 'Direct URL/link to download the presentation PDF or view it' },
              date:     { type: 'string', description: 'Date of the presentation (e.g. Q3 FY25, Jan 2025)' },
            },
          },
          allPresentations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url:   { type: 'string' },
                date:  { type: 'string' },
              },
            },
          },
        },
      },
      prompt:
        'List all investor presentations for Adani Green Energy. The most recent one ' +
        'is the most important. Return title, direct download/view URL, and date for ' +
        'each. Focus on quarterly operational updates and annual investor days.',
    }
  );
  return { markdown, extracted, url: 'https://www.adanigreenenergy.com/investors/investor-presentations' };
}

/* ─── Source 2: Adani Green quarterly operational data
   We try to scrape the latest investor presentation directly (PDF or slide deck).
   If the listing gave us a direct URL, scrape that.
   Otherwise fall back to the financial-results landing page.             ─── */
async function scrapeOperationalData(presentationUrl) {
  const targetUrl = presentationUrl || 'https://www.adanigreenenergy.com/investors/financial-results';
  const { markdown, extracted } = await fcScrape(targetUrl, {
    waitFor: 4000,
    schema: {
      type: 'object',
      properties: {
        operatingCapacityMW: {
          type: 'number',
          description: 'Total operating / commissioned capacity in MW (most recent quarter)',
        },
        operatingCapacityAsOf: {
          type: 'string',
          description: 'Quarter or date for the operating capacity figure (e.g. "Q3 FY25", "Dec 2024")',
        },
        underConstructionMW: {
          type: 'number',
          description: 'Total capacity under construction in MW',
        },
        signedPPAMW: {
          type: 'number',
          description: 'Total signed PPA / contracted but not yet commissioned pipeline in MW',
        },
        capexGuidance: {
          type: 'string',
          description: '3-year or FY capex guidance as stated (e.g. "₹1,24,000 Cr over FY25-28")',
        },
        capexPeriod: {
          type: 'string',
          description: 'Time horizon for the capex guidance (e.g. "FY25-28E")',
        },
        portfolioMix: {
          type: 'object',
          description: 'Technology mix as % of total contracted capacity',
          properties: {
            Solar:  { type: 'number' },
            Wind:   { type: 'number' },
            Hybrid: { type: 'number' },
            FDRE:   { type: 'number' },
          },
        },
        upcomingCODs: {
          type: 'array',
          description: 'Projects expected to achieve commercial operation (COD) in near term',
          items: {
            type: 'object',
            properties: {
              projectName: { type: 'string' },
              expectedDate: { type: 'string', description: 'Expected COD date like "Jun 2025"' },
              capacityMW:   { type: 'number' },
              location:     { type: 'string' },
            },
          },
        },
        totalContractedMW: {
          type: 'number',
          description: 'Total contracted capacity (op + UC + pipeline) in MW if stated',
        },
        targetCapacityGW: {
          type: 'number',
          description: '2030 or long-term capacity target in GW (e.g. 50 GW by 2030)',
        },
      },
    },
    prompt:
      'This is an Adani Green Energy investor presentation or results document. ' +
      'Extract: (1) Operating capacity MW and the quarter it refers to. ' +
      '(2) Under-construction MW. (3) Signed PPA pipeline MW. ' +
      '(4) Capex guidance amount and period. (5) Portfolio technology mix percentages ' +
      '(Solar / Wind / Hybrid / FDRE). (6) Any upcoming COD projects with expected ' +
      'commissioning dates and MW. Return only values clearly stated in the document.',
  });
  return { markdown, extracted, url: targetUrl };
}

/* ─── Source 3: Adani Green financial results page (for leverage/yield) ── */
async function scrapeFinancials() {
  const { markdown, extracted } = await fcScrape(
    'https://www.adanigreenenergy.com/investors/financial-results',
    {
      waitFor: 3000,
      schema: {
        type: 'object',
        properties: {
          latestQuarterRevenueCr: {
            type: 'number',
            description: 'Total revenue for latest reported quarter in INR Crore',
          },
          latestQuarter: {
            type: 'string',
            description: 'Quarter label (e.g. "Q3 FY25")',
          },
          ebitdaCr: {
            type: 'number',
            description: 'EBITDA for latest quarter in INR Crore',
          },
          netDebtCr: {
            type: 'number',
            description: 'Net debt as reported, in INR Crore',
          },
          netDebtEbitda: {
            type: 'number',
            description: 'Net Debt / EBITDA ratio',
          },
          debtEquity: {
            type: 'number',
            description: 'Debt / Equity ratio',
          },
          realisationPerUnit: {
            type: 'string',
            description: 'Average realisation per kWh / unit (₹ per unit)',
          },
          revenueCagrPct: {
            type: 'number',
            description: '3-year revenue CAGR in %',
          },
          revenueCagrPeriod: {
            type: 'string',
            description: 'Period for the CAGR calculation (e.g. "FY22-25")',
          },
          latestResultsDocUrl: {
            type: 'string',
            description: 'Direct URL to the latest quarterly results PDF',
          },
        },
      },
      prompt:
        'Extract Adani Green Energy\'s latest quarterly financial results: ' +
        'revenue, EBITDA, net debt, net debt/EBITDA ratio, debt/equity, ' +
        'average realisation per unit (₹/kWh), and 3-year revenue CAGR. ' +
        'Also return the direct URL to the latest results PDF if visible. ' +
        'Return only clearly stated figures.',
    }
  );
  return { markdown, extracted, url: 'https://www.adanigreenenergy.com/investors/financial-results' };
}

/* ─── Source 4: BSE corporate announcements (last 90 days) ─────────────── */
async function scrapeBSEAnnouncements() {
  // BSE announcements for ADANIGREEN — dur=D means recent (dynamic date range)
  const url = 'https://www.bseindia.com/corporates/ann.html?scrip=541450&dur=D';
  const { markdown, extracted } = await fcScrape(url, {
    waitFor: 4000,
    schema: {
      type: 'object',
      properties: {
        announcements: {
          type: 'array',
          description: 'Recent BSE corporate announcements for Adani Green Energy',
          items: {
            type: 'object',
            properties: {
              date:      { type: 'string', description: 'Date of filing (e.g. "15 Apr 2025")' },
              title:     { type: 'string', description: 'Title / subject of the announcement' },
              detail:    { type: 'string', description: '1-2 sentence summary of the announcement content' },
              filingUrl: { type: 'string', description: 'Direct URL to the announcement PDF/doc if visible' },
              category:  {
                type: 'string',
                description: 'Category: "Result"|"BoardMeeting"|"ProjectAward"|"Commissioning"|"Financial"|"Regulatory"|"Other"',
              },
            },
          },
        },
      },
    },
    prompt:
      'This is the BSE corporate filings/announcements page for Adani Green Energy Ltd ' +
      '(BSE code 541450). Extract the 10 most recent announcements. For each: date, ' +
      'title/subject, a 1-2 sentence summary of what it says (especially MW figures, ' +
      'project names, financial figures), category, and direct filing URL if visible. ' +
      'Prioritise announcements about: project wins, commissioning, quarterly results, ' +
      'contracts, and capex.',
  });
  return { markdown, extracted, url };
}

/* ─── Source 5: SECI tenders — Adani Green project awards ──────────────── */
async function scrapeSECI() {
  const { markdown, extracted } = await fcScrape(
    'https://www.seci.co.in/tenders',
    {
      waitFor: 3000,
      schema: {
        type: 'object',
        properties: {
          recentAwards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title:    { type: 'string' },
                developer:{ type: 'string' },
                mw:       { type: 'number' },
                date:     { type: 'string' },
                tenderNo: { type: 'string' },
              },
            },
          },
        },
      },
      prompt:
        'List any recent tender awards or results where Adani Green Energy ' +
        'or Adani Renewables was selected. Include title, MW awarded, date, ' +
        'and tender number. If Adani is not visible in results, return empty array.',
    }
  );
  return { markdown, extracted, url: 'https://www.seci.co.in/tenders' };
}

/* ─── Normalise scraped data into the final JSON shape ──────────────────── */
function normalise(opData, finData, annData, presData) {
  const op  = opData?.extracted  || {};
  const fin = finData?.extracted || {};
  const ann = annData?.extracted || {};
  const pre = presData?.extracted || {};

  /* ── kpi ── */
  const kpi = {};
  if (op.operatingCapacityMW != null) {
    kpi.opCapacity   = _fmtMW(op.operatingCapacityMW);
    kpi.opCapacityAsOf = op.operatingCapacityAsOf || null;
  }
  if (op.underConstructionMW != null) {
    kpi.ucCapacity   = _fmtMW(op.underConstructionMW);
    kpi.ucCapacityAsOf = op.operatingCapacityAsOf || null;
  }
  if (op.signedPPAMW != null) {
    kpi.ppa          = _fmtMW(op.signedPPAMW);
    kpi.ppaAsOf      = op.operatingCapacityAsOf || null;
  }
  if (op.capexGuidance) {
    kpi.capex        = op.capexGuidance;
    kpi.capexPeriod  = op.capexPeriod || null;
  }
  if (op.targetCapacityGW) {
    kpi.targetGW     = op.targetCapacityGW;
  }

  /* ── fin ── */
  const finOut = {};
  if (fin.netDebtCr != null)       finOut.netDebt    = `₹${_fmtCr(fin.netDebtCr)} Cr`;
  if (fin.netDebtCr != null)       finOut.netDebtAsOf = fin.latestQuarter || null;
  if (fin.netDebtEbitda != null)   finOut.leverage   = `${fin.netDebtEbitda.toFixed(1)}x`;
  if (fin.debtEquity != null)      finOut.debtEquity = `${fin.debtEquity.toFixed(1)}x`;
  if (fin.realisationPerUnit)      finOut.yield      = fin.realisationPerUnit;
  if (fin.revenueCagrPct != null)  finOut.revCGR     = `${fin.revenueCagrPct}%`;
  if (fin.revenueCagrPeriod)       finOut.revCGRPeriod = fin.revenueCagrPeriod;

  /* ── mix ── */
  const mix = op.portfolioMix
    ? { Solar: op.portfolioMix.Solar || 0, Wind: op.portfolioMix.Wind || 0,
        Hybrid: op.portfolioMix.Hybrid || 0, FDRE: op.portfolioMix.FDRE || 0 }
    : null;

  /* ── cod ── */
  const cod = Array.isArray(op.upcomingCODs) && op.upcomingCODs.length > 0
    ? op.upcomingCODs.map(c => ({
        date:    c.expectedDate || '—',
        project: [c.projectName, c.location].filter(Boolean).join(' · '),
        mw:      c.capacityMW || 0,
      }))
    : null;

  /* ── announcements ── */
  const rawAnn = ann.announcements;
  const annOut = Array.isArray(rawAnn) && rawAnn.length > 0
    ? rawAnn.slice(0, 8).map(a => ({
        date:   a.date     || '—',
        title:  a.title    || '—',
        detail: a.detail   || '',
        bseUrl: a.filingUrl || null,
      }))
    : null;

  return {
    kpi:    Object.keys(kpi).length    > 0 ? kpi    : null,
    fin:    Object.keys(finOut).length > 0 ? finOut : null,
    mix:    mix,
    cod:    cod,
    ann:    annOut,
  };
}

function _fmtMW(mw) {
  return Math.round(mw).toLocaleString('en-IN');
}

function _fmtCr(cr) {
  // Round to nearest 100 Cr and format with Indian number system
  const rounded = Math.round(cr / 100) * 100;
  return rounded.toLocaleString('en-IN');
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

console.log('Adani Green Energy — live data scrape\n');

const out = {
  scrapedAt:  new Date().toISOString(),
  company:    'Adani Green',
  bseCode:    '541450',
  nseSymbol:  'ADANIGREEN',
  sources:    {},
};

let results = {};

// Step 1: IR presentations listing
process.stdout.write('[1/5] Investor presentations listing … ');
try {
  results.presentations = await scrapeIRPresentations();
  out.sources.irPresentations = {
    url: results.presentations.url, ok: true,
    fetchedAt: new Date().toISOString(), error: null,
  };
  console.log('OK');
} catch (err) {
  out.sources.irPresentations = {
    url: 'https://www.adanigreenenergy.com/investors/investor-presentations',
    ok: false, fetchedAt: new Date().toISOString(), error: String(err.message),
  };
  console.log('FAIL ·', err.message);
}

// Step 2: Follow latest presentation URL if found
const latestPresUrl = results.presentations?.extracted?.latestPresentation?.url || null;
process.stdout.write(`[2/5] Operational data (${latestPresUrl || 'financial-results page'}) … `);
try {
  results.opData = await scrapeOperationalData(latestPresUrl);
  out.sources.operationalData = {
    url: results.opData.url, ok: true,
    fetchedAt: new Date().toISOString(), error: null,
  };
  console.log('OK');
} catch (err) {
  out.sources.operationalData = {
    url: latestPresUrl || 'https://www.adanigreenenergy.com/investors/financial-results',
    ok: false, fetchedAt: new Date().toISOString(), error: String(err.message),
  };
  console.log('FAIL ·', err.message);
}

// Step 3: Financials
process.stdout.write('[3/5] Financial results … ');
try {
  results.finData = await scrapeFinancials();
  out.sources.financials = {
    url: results.finData.url, ok: true,
    fetchedAt: new Date().toISOString(), error: null,
  };
  console.log('OK');
} catch (err) {
  out.sources.financials = {
    url: 'https://www.adanigreenenergy.com/investors/financial-results',
    ok: false, fetchedAt: new Date().toISOString(), error: String(err.message),
  };
  console.log('FAIL ·', err.message);
}

// Step 4: BSE announcements
process.stdout.write('[4/5] BSE announcements … ');
try {
  results.annData = await scrapeBSEAnnouncements();
  out.sources.bseAnnouncements = {
    url: results.annData.url, ok: true,
    fetchedAt: new Date().toISOString(), error: null,
  };
  console.log('OK');
} catch (err) {
  out.sources.bseAnnouncements = {
    url: 'https://www.bseindia.com/corporates/ann.html?scrip=541450&dur=D',
    ok: false, fetchedAt: new Date().toISOString(), error: String(err.message),
  };
  console.log('FAIL ·', err.message);
}

// Step 5: SECI (optional; failure is fine)
process.stdout.write('[5/5] SECI tenders (Adani pipeline check) … ');
try {
  results.seciData = await scrapeSECI();
  out.sources.seci = {
    url: results.seciData.url, ok: true,
    fetchedAt: new Date().toISOString(), error: null,
  };
  // Merge any SECI awards into announcements if not already covered
  const seciAwards = results.seciData.extracted?.recentAwards;
  if (Array.isArray(seciAwards) && seciAwards.length) {
    results.seciAwards = seciAwards;
  }
  console.log('OK');
} catch (err) {
  out.sources.seci = {
    url: 'https://www.seci.co.in/tenders',
    ok: false, fetchedAt: new Date().toISOString(), error: String(err.message),
  };
  console.log('FAIL (non-fatal) ·', err.message);
}

// Normalise all scraped data into the JSON shape the tab expects
const norm = normalise(results.opData, results.finData, results.annData, results.presentations);
Object.assign(out, norm);

const okCount = Object.values(out.sources).filter(s => s.ok).length;
const total   = Object.keys(out.sources).length;

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

console.log(`\nWrote ${OUT_PATH}`);
console.log(`${okCount}/${total} sources OK`);

// Field coverage report
console.log('\nField coverage:');
const fields = { kpi: out.kpi, fin: out.fin, mix: out.mix,
                 cod: out.cod, ann: out.ann };
for (const [k, v] of Object.entries(fields)) {
  const status = v == null ? '✗ not extracted (mock fallback)'
    : Array.isArray(v)     ? `✓ ${v.length} item(s)`
    : `✓ ${Object.keys(v).length} field(s)`;
  console.log(`  ${k.padEnd(4)} → ${status}`);
}

console.log('\nNext:');
console.log('  git add data/ipp-adani-green.json');
console.log('  git commit -m "data(adani-green): refresh live data"');
console.log('  git push');

process.exit(okCount === 0 ? 1 : 0);
