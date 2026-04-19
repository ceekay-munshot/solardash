#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   Grid-Risk Scrape Script — Firecrawl-based
   ───────────────────────────────────────────────────────────────────────────
   Pulls public data from PRAAPTI, CEA, GRID-India, CERC, RBI and writes a
   normalized JSON file that js/real-data-grid-risk.js overlays onto its seed
   dataset. Preserves partial success: sources that fail are recorded with
   ok:false and do not block the rest.

   Usage:
     FIRECRAWL_API_KEY=fc-... node scripts/scrape-grid-risk.mjs

   Output:
     data/grid-risk.json

   Run this locally (the dashboard runtime does not hit Firecrawl — CORS +
   key exposure would both be problems). Commit the resulting JSON so the
   hosted dashboard picks up the fresh values.
   ═══════════════════════════════════════════════════════════════════════════ */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const OUT_PATH  = join(REPO_ROOT, 'data', 'grid-risk.json');

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error('ERROR: FIRECRAWL_API_KEY env var is required.');
  console.error('Usage: FIRECRAWL_API_KEY=fc-... node scripts/scrape-grid-risk.mjs');
  process.exit(2);
}

const FIRECRAWL_ENDPOINT = 'https://api.firecrawl.dev/v1/scrape';

/* ─── Firecrawl wrapper ─────────────────────────────────────────────────────
   Uses v1 scrape with markdown + extract (JSON schema) when a schema is
   provided. Returns { markdown, extracted } or throws.
   ─────────────────────────────────────────────────────────────────────────── */
async function firecrawlScrape(url, { schema, prompt, waitFor = 0 } = {}) {
  const formats = ['markdown'];
  const body = {
    url,
    formats,
    onlyMainContent: true,
    timeout: 60000,
  };
  if (waitFor) body.waitFor = waitFor;
  if (schema) {
    formats.push('extract');
    body.extract = { schema, prompt };
  }

  const resp = await fetch(FIRECRAWL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });

  let payload;
  try { payload = await resp.json(); }
  catch { payload = { success: false, error: `non-JSON response (HTTP ${resp.status})` }; }

  if (!resp.ok || payload.success === false) {
    const msg = payload.error || payload.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  const data = payload.data || {};
  return {
    markdown:  data.markdown || '',
    extracted: data.extract ?? data.json ?? data.llm_extraction ?? null,
  };
}

/* ─── Source definitions ────────────────────────────────────────────────────
   Each source: a URL + (optional) JSON schema + prompt for structured
   extraction. All schemas are conservative — fields are optional — so
   partial extraction still produces useful JSON.
   ─────────────────────────────────────────────────────────────────────────── */

const SOURCES = [

  /* ── PRAAPTI — state-wise DISCOM outstanding dues ────────────────────── */
  {
    key:   'praapti',
    label: 'PRAAPTI',
    url:   'https://praapti.in/',
    waitFor: 2500,
    schema: {
      type: 'object',
      properties: {
        asOfDate:           { type: 'string', description: 'Date these dues are as-of, as printed on the portal' },
        totalOutstandingCr: { type: 'number', description: 'Total outstanding dues across all DISCOMs, in INR Crore' },
        totalOverdueCr:     { type: 'number', description: 'Total overdue (past due) amount, in INR Crore' },
        stateDues: {
          type: 'array',
          description: 'Per-state DISCOM dues to RE/conventional generators',
          items: {
            type: 'object',
            properties: {
              state:         { type: 'string' },
              outstandingCr: { type: 'number', description: 'Outstanding dues in INR Crore' },
              overdueCr:     { type: 'number', description: 'Overdue amount in INR Crore' },
            },
          },
        },
      },
    },
    prompt:
      'PRAAPTI is the Power Ministry portal showing DISCOM outstanding dues to ' +
      'generators. Extract the as-of date, the total outstanding and total ' +
      'overdue amounts in INR Crore, and a per-state breakdown with state ' +
      'name, outstanding (INR Cr), and overdue (INR Cr). Return only values ' +
      'that are plainly visible on the page.',
  },

  /* ── CEA — Monthly Executive Summary + Transmission Reports ──────────── */
  {
    key:   'cea-monthly',
    label: 'CEA — Monthly Executive Summary',
    url:   'https://cea.nic.in/monthly-executive-summary-report/?lang=en',
    schema: {
      type: 'object',
      properties: {
        latestReportTitle:      { type: 'string' },
        latestReportPdfUrl:     { type: 'string' },
        latestReportMonth:      { type: 'string', description: 'Month the report covers' },
        latestReportPostedDate: { type: 'string', description: 'Date the report was posted' },
      },
    },
    prompt: 'Find the most recently posted Monthly Executive Summary. Return title, PDF URL, the month it covers, and the date it was posted.',
  },

  {
    key:   'cea-transmission',
    label: 'CEA — Transmission Reports',
    url:   'https://cea.nic.in/transmission-planning-division-reports/?lang=en',
    schema: {
      type: 'object',
      properties: {
        recentReports: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title:      { type: 'string' },
              pdfUrl:     { type: 'string' },
              postedDate: { type: 'string' },
            },
          },
        },
      },
    },
    prompt: 'List the most recent transmission-planning reports from CEA relevant to RE evacuation, green energy corridors, or ISTS constraints. Include title, PDF URL, and posted date.',
  },

  /* ── GRID-India — RE curtailment / congestion ────────────────────────── */
  {
    key:   'grid-india',
    label: 'GRID-India',
    url:   'https://grid-india.in/',
    schema: {
      type: 'object',
      properties: {
        reCurtailmentReports: {
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
        congestionReports: {
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
    prompt: 'Identify any reports listed on GRID-India relating to (a) RE curtailment and (b) transmission congestion / constraint. For each, extract title, link URL, and date.',
  },

  /* ── CERC — recent orders (DSM / payment security / curtailment) ─────── */
  {
    key:   'cerc',
    label: 'CERC',
    url:   'https://cercind.gov.in/Orders.html',
    schema: {
      type: 'object',
      properties: {
        recentOrders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              date:  { type: 'string' },
              url:   { type: 'string' },
            },
          },
        },
      },
    },
    prompt: 'Extract the most recent CERC orders relevant to DISCOM payment security, DSM, RE curtailment, or grid code. Include title, date, URL.',
  },

  /* ── RBI — State Finances: A Study of Budgets ────────────────────────── */
  {
    key:   'rbi',
    label: 'RBI — State Finances',
    url:   'https://rbi.org.in/Scripts/AnnualPublications.aspx?head=State+Finances+%3a+A+Study+of+Budgets',
    schema: {
      type: 'object',
      properties: {
        latestEditionTitle:   { type: 'string' },
        latestEditionPdfUrl:  { type: 'string' },
        latestEditionDate:    { type: 'string' },
        allEditions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title:  { type: 'string' },
              pdfUrl: { type: 'string' },
              date:   { type: 'string' },
            },
          },
        },
      },
    },
    prompt: 'Find the list of editions of "State Finances: A Study of Budgets". Return the most recent edition\'s title, PDF URL, and publication date, plus an array of all editions listed.',
  },

];

/* ─── Run ───────────────────────────────────────────────────────────────── */

const out = {
  scrapedAt: new Date().toISOString(),
  scraper:   'firecrawl v1',
  sources:   {},
};

let okCount = 0;

for (const src of SOURCES) {
  process.stdout.write(`[${src.key.padEnd(18)}] ${src.url}\n  → `);
  try {
    const { markdown, extracted } = await firecrawlScrape(src.url, {
      schema:  src.schema,
      prompt:  src.prompt,
      waitFor: src.waitFor,
    });
    out.sources[src.key] = {
      label:     src.label,
      url:       src.url,
      fetchedAt: new Date().toISOString(),
      ok:        true,
      extracted: extracted,
      markdownLen: markdown.length,
      markdownHead: markdown.slice(0, 400),
      error:     null,
    };
    okCount++;
    const extractedSummary = extracted
      ? `extracted ${Object.keys(extracted).length} field(s)`
      : 'no structured extraction';
    console.log(`OK · ${markdown.length} md chars · ${extractedSummary}`);
  } catch (err) {
    out.sources[src.key] = {
      label:     src.label,
      url:       src.url,
      fetchedAt: new Date().toISOString(),
      ok:        false,
      extracted: null,
      markdownLen: 0,
      markdownHead: '',
      error:     String(err.message || err),
    };
    console.log(`FAIL · ${err.message || err}`);
  }
}

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');

console.log('');
console.log(`Wrote ${OUT_PATH}`);
console.log(`Partial success: ${okCount}/${SOURCES.length} sources OK`);
console.log('');
console.log('Next:');
console.log('  1. git add data/grid-risk.json && git commit -m "data(grid-risk): refresh"');
console.log('  2. git push');
console.log('  (real-data-grid-risk.js will overlay scraped values on next page load)');

process.exit(okCount === 0 ? 1 : 0);
