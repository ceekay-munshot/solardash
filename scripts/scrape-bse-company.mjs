#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   BSE company scraper — all public corporate data for one scrip code
   ───────────────────────────────────────────────────────────────────────────
   Writes: data/bse-<slug>.json

   Usage:
     node scripts/scrape-bse-company.mjs 541450 adani-green
     node scripts/scrape-bse-company.mjs <scripCode> <slug>

   Covers six categories. Each is fetched independently and FAILS SOFT — one
   category erroring never aborts the others. The output JSON records per-
   category status so the dashboard (and the next run) knows what is real.

     1. announcements   — corporate announcements / filings  (CONFIRMED endpoint)
     2. corpActions     — dividends, splits, bonuses          (best-guess endpoint)
     3. boardMeetings   — scheduled / outcome                 (best-guess endpoint)
     4. results         — quarterly / annual financial results(best-guess endpoint)
     5. shareholding    — shareholding pattern                (best-guess endpoint)
     6. annualReports   — annual report PDFs                  (best-guess endpoint)

   ───────────────────────────────────────────────────────────────────────────
   IMPORTANT — endpoint reliability
   BSE's announcement API is stable and well-documented. The other five
   endpoints change paths periodically; the URLs below are best-effort. The
   FIRST run is a discovery run: check the per-category status table in the
   log. Any category that 404s / returns junk → fix only that BSE_ENDPOINTS
   entry. Numbers are never hardcoded — only endpoint URLs.

   BSE blocks requests without browser-like headers, and may rate-limit
   datacentre IPs (incl. GitHub Actions runners). The script retries with
   backoff and exits 0 even on partial failure so CI does not hard-fail.
   ═══════════════════════════════════════════════════════════════════════════ */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join }    from 'node:path';
import { fileURLToPath }    from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO  = join(__dir, '..');

/* ── CLI args ──────────────────────────────────────────────────────────── */
const SCRIP = process.argv[2];
const SLUG  = process.argv[3] || (SCRIP ? `scrip-${SCRIP}` : null);
if (!SCRIP || !/^\d{6}$/.test(SCRIP)) {
  console.error('Usage: node scripts/scrape-bse-company.mjs <6-digit-scripCode> <slug>');
  console.error('Example: node scripts/scrape-bse-company.mjs 541450 adani-green');
  process.exit(2);
}
const OUT = join(REPO, 'data', `bse-${SLUG}.json`);

/* ── Date helpers (BSE wants YYYYMMDD) ─────────────────────────────────── */
const ymd = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
const TODAY     = new Date();
const NINETY_AGO = new Date(Date.now() - 90 * 864e5);
const FROM = ymd(NINETY_AGO);
const TO   = ymd(TODAY);

/* ── Browser-like headers — BSE rejects plain requests ─────────────────── */
const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer':         'https://www.bseindia.com/',
  'Origin':          'https://www.bseindia.com',
};

/* ── GET JSON with retry + backoff ─────────────────────────────────────── */
async function bseGet(url) {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      const r = await fetch(url, { headers: HEADERS, signal: ctrl.signal });
      clearTimeout(timer);
      if (r.status === 403 || r.status === 429) throw new Error(`HTTP ${r.status} (blocked/rate-limited)`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      try { return JSON.parse(text); }
      catch { throw new Error(`non-JSON response (${text.slice(0,60)}…)`); }
    } catch (e) {
      lastErr = e;
      if (attempt < 4) await new Promise(res => setTimeout(res, attempt * 2000));
    }
  }
  throw lastErr;
}

/* ══════════════════════════════════════════════════════════════════════════
   BSE ENDPOINTS — edit URLs here, nowhere else.
   {scrip} {from} {to} are substituted. Mark each as confirmed/best-guess.
   ══════════════════════════════════════════════════════════════════════════ */
const API = 'https://api.bseindia.com/BseIndiaAPI/api';

const BSE_ENDPOINTS = {
  announcements: {
    confirmed: true,
    url: `${API}/AnnGetData/w?pageno=1&strCat=-1&strPrevDate={from}&strScrip={scrip}&strSearch=P&strToDate={to}&strType=C`,
    // response: { Table: [ { NEWS_DT, NEWSSUB, HEADLINE, CATEGORYNAME, ATTACHMENTNAME, NSURL, ... } ] }
    pick: j => (j.Table || []).map(r => ({
      date:     r.NEWS_DT || r.News_submission_dt || null,
      title:    r.HEADLINE || r.NEWSSUB || null,
      category: r.CATEGORYNAME || r.SUBCATNAME || null,
      pdfUrl:   r.ATTACHMENTNAME
                  ? `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${r.ATTACHMENTNAME}`
                  : (r.NSURL || null),
    })),
  },

  corpActions: {
    confirmed: false,
    url: `${API}/CorporateActiononCompany/w?scripcode={scrip}`,
    pick: j => (j.Table || j.CorpactList || []).map(r => ({
      exDate:   r.Ex_date || r.EX_DATE || null,
      purpose:  r.Purpose || r.PURPOSE || null,
      recordDt: r.RD_Date || r.RECORD_DATE || null,
      details:  r.purpose_remarks || r.DETAILS || null,
    })),
  },

  boardMeetings: {
    confirmed: false,
    url: `${API}/BoardMeeting_v1/w?scripcode={scrip}&strType=C`,
    pick: j => (j.Table || []).map(r => ({
      date:    r.Meeting_Date || r.MeetingDate || r.Board_Meeting_Date || null,
      purpose: r.Meeting_Purpose || r.Purpose || r.Description || null,
    })),
  },

  results: {
    confirmed: false,
    url: `${API}/Comp_Resultsnew/w?scripcode={scrip}`,
    pick: j => (j.Table || []).map(r => ({
      period:  r.Result_Period || r.PERIOD || r.Quarter || null,
      revenue: r.Net_Sales || r.Revenue || r.Income || null,
      pat:     r.Net_Profit || r.PAT || null,
      pdfUrl:  r.NSURL || r.AttachmentURL || null,
    })),
  },

  shareholding: {
    confirmed: false,
    url: `${API}/Shareholding_Pattern/w?scripcode={scrip}`,
    pick: j => (j.Table || []).map(r => ({
      asOf:        r.QTR_END_DT || r.Period || null,
      promoterPct: r.Promoter || r.PROMOTER_PCT || null,
      publicPct:   r.Public || r.PUBLIC_PCT || null,
    })),
  },

  annualReports: {
    confirmed: false,
    url: `${API}/Annual_Reports/w?scripcode={scrip}`,
    pick: j => (j.Table || []).map(r => ({
      year:   r.Year || r.FY || null,
      pdfUrl: r.PDFURL || r.NSURL || r.AttachmentURL || null,
    })),
  },
};

/* ── Substitute placeholders into an endpoint URL ──────────────────────── */
function buildUrl(tpl) {
  return tpl.replace('{scrip}', SCRIP).replace('{from}', FROM).replace('{to}', TO);
}

/* ══════════════════════════════════════════════════════════════════════════
   SCRAPE
   ══════════════════════════════════════════════════════════════════════════ */
console.log(`BSE scrape — scrip ${SCRIP} (${SLUG})`);
console.log(`Window: ${FROM} → ${TO}\n`);

const out = {
  scrapedAt: new Date().toISOString(),
  scripCode: SCRIP,
  slug:      SLUG,
  sources:   {},
  data:      {},
};

for (const [name, cfg] of Object.entries(BSE_ENDPOINTS)) {
  const url = buildUrl(cfg.url);
  process.stdout.write(`  ${name.padEnd(15)} `);
  try {
    const raw  = await bseGet(url);
    const rows = cfg.pick(raw) || [];
    out.data[name]    = rows;
    out.sources[name] = { ok: true, url, count: rows.length, confirmed: cfg.confirmed, error: null };
    console.log(`✓ ${rows.length} row(s)${cfg.confirmed ? '' : '  (best-guess endpoint)'}`);
  } catch (e) {
    out.data[name]    = [];
    out.sources[name] = { ok: false, url, count: 0, confirmed: cfg.confirmed, error: String(e.message) };
    console.log(`✗ ${e.message}`);
  }
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2));

const ok = Object.values(out.sources).filter(s => s.ok).length;
console.log(`\n${ok}/6 categories OK → wrote ${OUT}`);
if (ok === 0) {
  console.log('All categories failed — likely BSE IP block. Output written empty; CI stays green.');
}
process.exit(0);   // always 0 — partial success must not fail CI
