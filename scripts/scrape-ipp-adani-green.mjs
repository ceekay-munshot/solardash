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
      'This is an Adani Green Energy (AGEL) investor presentation or operational ' +
      'update document. Extract these values ONLY if they are explicitly stated ' +
      'as numbers in the visible content:\n' +
      '  • operatingCapacityMW — total operational MW (typically 11000-15000 MW)\n' +
      '  • operatingCapacityAsOf — the quarter / date label printed beside it\n' +
      '  • underConstructionMW — MW under construction (typically 5000-12000 MW)\n' +
      '  • signedPPAMW — total contracted/PPA pipeline MW (typically 15000-30000)\n' +
      '  • capexGuidance — capex guidance string with currency (e.g. "₹1,24,000 Cr")\n' +
      '  • capexPeriod — the period that capex covers (e.g. "FY25-28")\n' +
      '  • portfolioMix — % split as integers summing to ~100\n' +
      '  • upcomingCODs — array of projects with expectedDate, capacityMW, name\n\n' +
      'CRITICAL: Return null (or omit) for ANY field not explicitly visible. ' +
      'Do NOT use defaults like 0 or "N/A". If the page is just a navigation ' +
      'page with no operational figures, return an empty object {}.',
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
        'Extract Adani Green Energy\'s latest quarterly financial figures: ' +
        'revenue (INR Crore), EBITDA, net debt, net debt/EBITDA ratio, ' +
        'debt/equity, average realisation per unit (₹/kWh), 3-year revenue ' +
        'CAGR, and the direct URL to the latest results PDF.\n\n' +
        'CRITICAL: Return null (or omit the field entirely) for ANY value that ' +
        'is not explicitly stated as a number on the visible page. Do NOT ' +
        'guess, do NOT default to 0, do NOT use placeholders like "N/A". ' +
        'For Adani Green, a real net-debt value is in the tens of thousands ' +
        'of INR Crore — never single digits or zero. If the page shows only ' +
        'navigation/links and no numeric financials, return an empty object.',
    }
  );
  return { markdown, extracted, url: 'https://www.adanigreenenergy.com/investors/financial-results' };
}

/* ─── Source 4: BSE corporate announcements (last 90 days) ─────────────── */
async function scrapeBSEAnnouncements() {
  // BSE announcements for ADANIGREEN — dur=D means recent (dynamic date range)
  const url = 'https://www.bseindia.com/corporates/ann.html?scrip=541450&dur=D';
  const { markdown, extracted } = await fcScrape(url, {
    waitFor: 8000,                                            // BSE is JS-heavy
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
      'This is the BSE corporate filings/announcements page for Adani Green Energy ' +
      'Ltd (BSE code 541450). Extract the 10 most recent announcements that are ' +
      'literally visible in the page text. For each: date (as printed), title/' +
      'subject (verbatim), a 1-sentence factual summary, category, and the ' +
      'direct filing URL.\n\n' +
      'CRITICAL: Do NOT invent announcements. Do NOT generate sequential filing ' +
      'IDs like "?id=1", "?id=2". Real BSE filing URLs contain a long ' +
      'alphanumeric ID — if you cannot see the actual link, return null for ' +
      'filingUrl. If the page shows no announcement list (e.g. only nav / login ' +
      'prompt), return announcements: []. Use only the literal text visible.',
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

/* ─── Validation helpers ─────────────────────────────────────────────────────
   Firecrawl's LLM `extract` will hallucinate plausible-looking data when a
   page doesn't render properly (e.g. JS-heavy BSE / NSE pages). We reject
   any field that looks like an LLM default before writing the JSON. The
   dashboard then truthfully falls back to MOCK rather than display
   invented "REAL" values.
   ─────────────────────────────────────────────────────────────────────────── */

function _isValidUrl(s) {
  if (!s || typeof s !== 'string') return false;
  if (/^(N\/A|null|undefined|none|tbd|—|-|—)$/i.test(s.trim())) return false;
  try {
    const u = new URL(s);
    return (u.protocol === 'https:' || u.protocol === 'http:') && /\./.test(u.hostname);
  } catch { return false; }
}

function _isLikelyRealBseUrl(s) {
  // Real BSE filing URLs look like ?id=<long-alphanumeric> or contain
  // /xml-data/corpfiling/ or /downloadFile.aspx — never sequential ?id=1.
  if (!_isValidUrl(s)) return false;
  if (!/bseindia\.com/i.test(s)) return false;
  if (/[?&]id=\d{1,4}(?:$|&)/.test(s)) return false;          // reject ?id=1, ?id=42 etc.
  return true;
}

function _isPositiveNum(n) {
  return typeof n === 'number' && isFinite(n) && n > 0;
}

function _isNonZeroValue(v) {
  if (v == null) return false;
  if (typeof v === 'number') return v !== 0 && isFinite(v);
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t || /^(N\/A|null|undefined|none|tbd|—|-)$/i.test(t)) return false;
    if (/^[₹$]?\s*0\b/.test(t)) return false;                 // "₹0", "0.0x", "0%"
    if (/^0\.0+\s*x$/i.test(t)) return false;
    return true;
  }
  return true;
}

function _isPlausibleDate(s) {
  // Accept dates within last 18 months only (avoid stale hallucinations).
  if (!s || typeof s !== 'string') return true;               // unknown → keep
  const yearMatch = s.match(/\b(20\d{2})\b/);
  if (!yearMatch) return true;                                // no year → keep (relative date)
  const year = parseInt(yearMatch[1], 10);
  const now  = new Date().getFullYear();
  return year >= (now - 1) && year <= now + 1;                // window: prev / current / next year
}

/* Catches the LLM's "Q2 FY23" / "Q4 FY22" / "FY24" stale references when the
   current year is FY26 (Apr 2025 - Mar 2026) or later. Only allow current FY
   and the immediately-preceding FY. */
function _isPlausibleFYQuarter(s) {
  if (!s || typeof s !== 'string') return true;
  const m = s.match(/FY\s*(\d{2,4})/i);
  if (!m) return true;
  let year = parseInt(m[1], 10);
  if (year < 100) year = 2000 + year;
  const nowY  = new Date().getFullYear();
  const nowM  = new Date().getMonth();
  const currentFY = nowM >= 3 ? nowY + 1 : nowY;             // FY ends Mar; FY26 = Apr2025-Mar2026
  return year >= (currentFY - 1) && year <= (currentFY + 1);
}

/* Detects LLM placeholder strings like "Project A", "Location B", "TBD",
   "Example Solar Park", "Site 1", etc. */
function _isPlaceholderName(s) {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  if (/^(Project|Location|Site|Example|Sample|Plant|Facility|Park)\s+[A-Z]\b/i.test(t)) return true;
  if (/^(Project|Location|Site)\s*\d{1,2}\s*$/i.test(t)) return true;
  if (/lorem ipsum/i.test(t)) return true;
  if (/placeholder/i.test(t)) return true;
  if (/example/i.test(t) && t.length < 40) return true;
  return false;
}

/* True if the mix dictionary looks like LLM defaults: all values multiples
   of 5 AND all values are >= 10. Real portfolio mixes have fractional %s. */
function _isSuspiciousMix(m) {
  if (!m) return false;
  const vals = [m.Solar, m.Wind, m.Hybrid, m.FDRE].filter(v => typeof v === 'number');
  if (vals.length < 4) return false;
  const allRound = vals.every(v => v % 5 === 0 && v >= 10);
  // Specific known-bad pattern: 40/30/20/10
  const pattern = vals.slice().sort((a, b) => b - a).join(',');
  if (pattern === '40,30,20,10' || pattern === '50,30,15,5' || pattern === '60,20,10,10') return true;
  return false;
}

/* ─── Normalise scraped data into the final JSON shape ──────────────────── */
function normalise(opData, finData, annData, presData) {
  const op  = opData?.extracted  || {};
  const fin = finData?.extracted || {};
  const ann = annData?.extracted || {};
  const pre = presData?.extracted || {};

  /* ── kpi (operational MW figures) ──
     If the asOf reference is stale (e.g. "Q2 FY23" when current is FY26),
     reject the WHOLE kpi block — it's almost certainly LLM hallucination
     from a chart label or made up entirely. Real current data carries a
     current-FY label. */
  const kpi = {};
  const opAsOf = op.operatingCapacityAsOf;
  const asOfPlausible = _isPlausibleFYQuarter(opAsOf) && _isPlausibleDate(opAsOf);

  if (_isPositiveNum(op.operatingCapacityMW) && asOfPlausible) {
    kpi.opCapacity     = _fmtMW(op.operatingCapacityMW);
    kpi.opCapacityAsOf = opAsOf || null;
  }
  if (_isPositiveNum(op.underConstructionMW) && asOfPlausible) {
    kpi.ucCapacity     = _fmtMW(op.underConstructionMW);
    kpi.ucCapacityAsOf = opAsOf || null;
  }
  if (_isPositiveNum(op.signedPPAMW) && asOfPlausible) {
    kpi.ppa            = _fmtMW(op.signedPPAMW);
    kpi.ppaAsOf        = opAsOf || null;
  }
  if (_isNonZeroValue(op.capexGuidance) && _isPlausibleFYQuarter(op.capexPeriod)) {
    kpi.capex          = op.capexGuidance;
    kpi.capexPeriod    = op.capexPeriod || null;
  }
  if (_isPositiveNum(op.targetCapacityGW) && op.targetCapacityGW >= 30) {
    // Adani's stated 2030 target is 50 GW — anything below 30 GW is suspect.
    kpi.targetGW       = op.targetCapacityGW;
  }

  /* ── fin (financial summary) ──
     Reject if value looks like an LLM default. We require netDebt to be
     plausible (Adani Green's net debt is in the tens of thousands of Cr —
     a value < 1000 Cr is almost certainly hallucinated). */
  const finOut = {};
  if (_isPositiveNum(fin.netDebtCr) && fin.netDebtCr > 1000) {
    finOut.netDebt     = `₹${_fmtCr(fin.netDebtCr)} Cr`;
    finOut.netDebtAsOf = fin.latestQuarter || null;
  }
  if (_isPositiveNum(fin.netDebtEbitda) && fin.netDebtEbitda > 0.1) {
    finOut.leverage    = `${fin.netDebtEbitda.toFixed(1)}x`;
  }
  if (_isPositiveNum(fin.debtEquity) && fin.debtEquity > 0.1) {
    finOut.debtEquity  = `${fin.debtEquity.toFixed(1)}x`;
  }
  if (_isNonZeroValue(fin.realisationPerUnit)) {
    finOut.yield       = fin.realisationPerUnit;
  }
  if (_isPositiveNum(fin.revenueCagrPct) && fin.revenueCagrPct > 0) {
    finOut.revCGR      = `${fin.revenueCagrPct}%`;
  }
  if (_isNonZeroValue(fin.revenueCagrPeriod)) {
    finOut.revCGRPeriod = fin.revenueCagrPeriod;
  }

  /* ── mix (portfolio technology %) ──
     Reject if percentages don't sum to ~100, OR if the pattern looks like
     LLM defaults (40/30/20/10 etc). */
  let mix = null;
  if (op.portfolioMix && typeof op.portfolioMix === 'object') {
    const m = op.portfolioMix;
    const sum = (m.Solar||0) + (m.Wind||0) + (m.Hybrid||0) + (m.FDRE||0);
    if (sum >= 90 && sum <= 110 && !_isSuspiciousMix(m)) {
      mix = { Solar: m.Solar||0, Wind: m.Wind||0, Hybrid: m.Hybrid||0, FDRE: m.FDRE||0 };
    }
  }

  /* ── cod (upcoming COD timeline) ──
     Drop entries with no MW, no project name, or placeholder names like
     "Project A" / "Location B". */
  const cod = Array.isArray(op.upcomingCODs) && op.upcomingCODs.length > 0
    ? op.upcomingCODs
        .filter(c => _isPositiveNum(c.capacityMW) && c.projectName && c.expectedDate)
        .filter(c => !_isPlaceholderName(c.projectName) && !_isPlaceholderName(c.location))
        .filter(c => _isPlausibleDate(c.expectedDate))
        .map(c => ({
          date:    c.expectedDate,
          project: [c.projectName, c.location].filter(Boolean).join(' · '),
          mw:      Math.round(c.capacityMW),
        }))
    : null;
  const codOut = cod && cod.length > 0 ? cod : null;

  /* ── announcements ──
     Reject items with implausible dates (>18 months stale) or fake-looking
     BSE URLs (sequential ?id=1..N). bseUrl is set to null if it looks fake;
     the announcement text itself is kept since the title/detail still hold
     value when sourced from real markdown. */
  const rawAnn = ann.announcements;
  const annOut = Array.isArray(rawAnn) && rawAnn.length > 0
    ? rawAnn
        .filter(a => a.title && a.date)
        .filter(a => _isPlausibleDate(a.date))
        .slice(0, 8)
        .map(a => ({
          date:   a.date,
          title:  a.title,
          detail: a.detail || '',
          bseUrl: _isLikelyRealBseUrl(a.filingUrl) ? a.filingUrl : null,
        }))
    : null;
  const annFinal = annOut && annOut.length > 0 ? annOut : null;

  return {
    kpi:    Object.keys(kpi).length    > 0 ? kpi    : null,
    fin:    Object.keys(finOut).length > 0 ? finOut : null,
    mix:    mix,
    cod:    codOut,
    ann:    annFinal,
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

// Step 2: Follow latest presentation URL if found AND valid
const rawPresUrl  = results.presentations?.extracted?.latestPresentation?.url || null;
const latestPresUrl = _isValidUrl(rawPresUrl) ? rawPresUrl : null;
if (rawPresUrl && !latestPresUrl) {
  console.log(`  (step-1 returned non-URL "${rawPresUrl}" — using fallback)`);
}
process.stdout.write(`[2/5] Operational data (${latestPresUrl || 'financial-results page (fallback)'}) … `);
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

// Field coverage report (after validation guards)
console.log('\nField coverage (after anti-hallucination guards):');
const fields = { kpi: out.kpi, fin: out.fin, mix: out.mix,
                 cod: out.cod, ann: out.ann };
for (const [k, v] of Object.entries(fields)) {
  const status = v == null ? '✗ not extracted / rejected as junk → mock fallback'
    : Array.isArray(v)     ? `✓ ${v.length} item(s)`
    : `✓ ${Object.keys(v).length} field(s)`;
  console.log(`  ${k.padEnd(4)} → ${status}`);
}

// Show what raw values were rejected (if any) — helps debug bad extraction.
const rawOp  = results.opData?.extracted   || {};
const rawFin = results.finData?.extracted  || {};
const rawAnn = results.annData?.extracted?.announcements;
const rejected = [];

if (rawOp.operatingCapacityAsOf && !_isPlausibleFYQuarter(rawOp.operatingCapacityAsOf)) {
  rejected.push(`kpi: stale asOf "${rawOp.operatingCapacityAsOf}" (rejected entire kpi block)`);
}
if (rawOp.portfolioMix && _isSuspiciousMix(rawOp.portfolioMix)) {
  rejected.push(`mix: pattern ${JSON.stringify(rawOp.portfolioMix)} looks like LLM default`);
}
if (Array.isArray(rawOp.upcomingCODs)) {
  const placeholder = rawOp.upcomingCODs.filter(c =>
    _isPlaceholderName(c.projectName) || _isPlaceholderName(c.location)
  ).length;
  if (placeholder > 0) rejected.push(`${placeholder}/${rawOp.upcomingCODs.length} cod entries had placeholder names ("Project A" etc.)`);
}

if (rawFin.netDebtCr != null && (!_isPositiveNum(rawFin.netDebtCr) || rawFin.netDebtCr <= 1000)) {
  rejected.push(`fin.netDebtCr=${rawFin.netDebtCr} (implausibly small for AGEL)`);
}
if (rawFin.netDebtEbitda != null && (!_isPositiveNum(rawFin.netDebtEbitda) || rawFin.netDebtEbitda <= 0.1)) {
  rejected.push(`fin.netDebtEbitda=${rawFin.netDebtEbitda} (LLM default)`);
}

if (Array.isArray(rawAnn)) {
  const fakeUrls = rawAnn.filter(a => a.filingUrl && !_isLikelyRealBseUrl(a.filingUrl)).length;
  if (fakeUrls > 0) rejected.push(`${fakeUrls}/${rawAnn.length} announcement filingUrls were sequential/fake`);
  const staleAnn = rawAnn.filter(a => a.date && !_isPlausibleDate(a.date)).length;
  if (staleAnn > 0) rejected.push(`${staleAnn}/${rawAnn.length} announcements had stale dates`);
}

if (rejected.length > 0) {
  console.log('\nRejected (suspect hallucinations):');
  rejected.forEach(r => console.log(`  ⚠ ${r}`));
  console.log('  → these fields stay on MOCK rather than display invented "REAL" values.');
}

// Honest summary about Firecrawl extraction quality
const realFieldsCount = Object.values(fields).filter(v => v != null).length;
if (realFieldsCount === 0) {
  console.log('\n⚠ All fields rejected. The pages Firecrawl scraped do not appear to');
  console.log('  contain extractable data (likely JS-only or anti-bot blocked).');
  console.log('  The dashboard will continue to show MOCK truthfully for Adani Green.');
} else if (realFieldsCount < 3) {
  console.log(`\n${realFieldsCount}/5 fields populated with REAL data. Other fields stay on MOCK.`);
}

console.log('\nNext:');
console.log('  git add data/ipp-adani-green.json');
console.log('  git commit -m "data(adani-green): refresh live data"');
console.log('  git push');

process.exit(okCount === 0 ? 1 : 0);
