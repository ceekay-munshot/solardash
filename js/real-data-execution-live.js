/* ═══════════════════════════════════════════════════════════════════════════
   EXECUTION TAB — LIVE REFRESH ENGINE
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 4 → Commissioned KPI, Commissioning Trend, State-Wise
            Commissioning. No other tab and no other block.

   CORS PROBE RESULTS (documented in real-data-policy.js, re-verified):
     mnre.gov.in            → CORS: NONE     → browser fetch blocked
     pib.gov.in             → CORS: NONE     → browser fetch blocked
     cea.nic.in             → robots.txt + CORS NONE → browser fetch blocked
     api.anthropic.com      → CORS-OK                → browser fetch OK

   LIVE REFRESH ARCHITECTURE (matches the proven tab-policy.js pattern):
     Browser → api.anthropic.com (CORS-OK) → web_search tool
            → MNRE / PIB / Mercom / JMK (all citing primary sources) → JSON
     Model:   claude-sonnet-4-20250514 with web_search_20250305

   DESIGN RULES (enforced below):
     • SOLAR ONLY. All-solar per MNRE headline definition (utility-scale +
       grid-connected rooftop + hybrid solar component + off-grid).
       Wind, bioenergy, small hydro, large hydro must be EXCLUDED.
     • Do not invent numbers. A quarter or a state is included in the live
       result ONLY when both its endpoints are confirmed from primary-source
       documents.
     • If the live call fails or the API key is empty, we do NOT show stale
       numbers pretending to be live. Seed values remain visible, the block
       is labelled "SEED · as-of <date>", and the refresh status line is
       truthful.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── API Key ────────────────────────────────────────────────────────────────
   Obtain a key at https://console.anthropic.com/ and paste below to enable
   live refresh. Without a key the tab shows seed data and clearly says so.
   ─────────────────────────────────────────────────────────────────────────── */
const EXEC_API_KEY = '';  // ← paste your key: 'sk-ant-...'

/* ─── Refresh-state (mutable) ────────────────────────────────────────────── */
let EXEC_LIVE_RESULT      = null;  // parsed JSON object from last successful live call
let EXEC_LAST_REFRESHED   = null;  // Date of last successful live refresh
let EXEC_LAST_ERROR       = null;  // string message of last failed refresh
let EXEC_REFRESH_MODE     = 'seed';// 'seed' | 'live' | 'live-partial'
const EXEC_SEED_AS_OF     = '15 Apr 2026';
let _EXEC_LIVE_INFLIGHT   = null;  // shared Promise within a single refresh run

/* ─── Reset per-run cache (orchestrator calls at start of a refresh click) ─ */
function execResetLiveRun() { _EXEC_LIVE_INFLIGHT = null; }

/* ─── System prompt: tight, strict, solar-only ──────────────────────────────
   Five blocks in one JSON object; each block can be independently null when
   unsourceable. Per-block source-restriction rules are ENFORCED inside the
   schema text so the model does not cross them.
   ─────────────────────────────────────────────────────────────────────── */
const _EXEC_REFRESH_SYSTEM = `You are a market-data assistant for India's solar sector. Search official public sources and return the latest solar figures as one strict JSON object.

PRIORITY OFFICIAL SOURCES (per block — read carefully):
A. commissioned / commissionTrend / stateCommission:
   1. MNRE Physical Progress: https://mnre.gov.in/en/physical-progress/
   2. MNRE state-wise installed-capacity PDFs (linked from page above)
   3. PIB press releases: https://pib.gov.in
   4. MNRE official @mnreindia posts for intra-quarter updates
   5. Trade press (Mercom India, JMK Research, Bridge to India) ONLY when the item explicitly cites MNRE/CEA/PIB
B. ucPipeline / developerRanking:
   1. CEA UC RE reports: https://cea.nic.in/rpm/quarterly-report-on-under-construction-renewable-energy-projects/?lang=en
   2. CEA plant-wise RE projects: https://cea.nic.in/rpm/plant-wise-details-of-renewable-energy-projects/?lang=en
   3. SECI tenders / result docs: https://www.seci.co.in/tenders
   4. BSE announcements: https://www.bseindia.com/corporates/ann.html
   5. NSE filings: https://www.nseindia.com/companies-listing/corporate-filings-announcements
   6. Official company investor-relations pages / press releases
   DO NOT use Mercom, JMK, Bridge to India, SolarQuarter, RenewableWatch, or any trade-press source for ucPipeline or developerRanking. Only primary or regulator-published sources. If CEA pages return robots-disallowed or no usable solar breakdown, return that block as null — do not substitute trade-press.

SCOPE: SOLAR ONLY. All-solar per MNRE headline (utility-scale + grid-connected rooftop + hybrid solar component + off-grid). DO NOT add wind, bioenergy, small hydro, or large hydro to any number.

OUTPUT: Return ONLY a valid JSON object. No markdown fences. No explanation. Start with { and end with }.

SCHEMA:
{
  "asOfDate": "YYYY-MM-DD",
  "fetchedFrom": ["primary source URL", ...],
  "commissioned": { "currentFY": "FY26"|"FY27", "fyYtdMW": <number>, "cumulativeMW": <number>, "priorFYEndMW": <number>, "priorFYEndDate": "YYYY-MM-DD", "confidence": "high"|"medium"|"low", "sourceNote": "short" } | null,
  "commissionTrend": { "quarters": [ { "label": "Q1 FY25"|..., "periodStart": "YYYY-MM-DD", "periodEnd": "YYYY-MM-DD", "mw": <number>, "confidence": "high"|"medium"|"low", "sourceNote": "short" } ] } | null,
  "stateCommission": { "currentFY": "FY26"|"FY27", "priorFYEndDate": "YYYY-MM-DD", "latestDate": "YYYY-MM-DD", "states": [ { "state": "Rajasthan", "fyYtdMW": <number>, "latestCumulativeMW": <number>, "priorFYEndMW": <number>, "tier": "A"|"B"|"C", "sourceNote": "short" } ] } | null,
  "ucPipeline": { "quarters": [ { "label": "Q2 FY26"|..., "periodEnd": "YYYY-MM-DD", "mw": <number>, "confidence": "high"|"medium", "sourceNote": "short", "sourceUrl": "<CEA url>" } ] } | null,
  "developerRanking": { "asOfDate": "YYYY-MM-DD", "developers": [ { "developer": "Adani Green Energy", "ticker": "NSE: ADANIGREEN", "totalAwardedMW": <number>|null, "commissionedMW": <number>|null, "underConstructionMW": <number>|null, "conversionPct": <number>|null, "latestQuarter": "Q4 FY26"|"Q3 FY26"|..., "sourceUrls": ["<BSE/NSE/IR URL>", ...], "sourceNote": "short" } ] } | null
}

HARD RULES (apply to every block):
- SOLAR ONLY. If a source mixes RE types, extract only the solar line. If a developer's commissioned / awarded MW cannot be separated into solar, you may report RE-total as commissionedMW BUT set sourceNote to say so explicitly.
- Include a quarter in commissionTrend or ucPipeline ONLY when its endpoint is confirmed by primary source. Omit in-progress quarters.
- Include a state ONLY when both endpoints are confirmed by primary source.
- For developerRanking: include only developers confirmable from official filings. totalAwardedMW, underConstructionMW, conversionPct must each be individually nullable. NEVER compute conversionPct from inconsistent or mixed-source values — return null instead.
- For ucPipeline, NEVER synthesize a quarterly series from a single anchor point. If fewer than 2 primary-source quarterly points are available, return ucPipeline = null.
- If a whole block cannot be confirmed, set it to null rather than fabricate.
- Do not include any non-solar capacity or RE totals in the commissioning / trend / state blocks.`;

/* ─── Live refresh: single API call, returns bundle for all 3 blocks ─────── */
async function execLiveRefresh() {
  if (!EXEC_API_KEY || !EXEC_API_KEY.trim()) throw new Error('NO_API_KEY');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         EXEC_API_KEY.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system:     _EXEC_REFRESH_SYSTEM,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      messages:   [{
        role:    'user',
        content: 'Search the official sources and return the latest India SOLAR commissioning figures as one JSON object per the schema. Prioritise the MNRE Physical Progress page and the most recent MNRE state-wise PDF. Solar only. Omit any block you cannot confirm from primary source.',
      }],
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `API ${res.status}`);
  }

  const body = await res.json();
  const txt = (body.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  if (!txt) throw new Error('Empty API response');

  let raw = txt.replace(/^```(?:json)?\s*/im, '').replace(/\s*```$/im, '').trim();
  const s = raw.indexOf('{'), e2 = raw.lastIndexOf('}');
  if (s === -1 || e2 === -1) throw new Error('No JSON object in response');
  raw = raw.slice(s, e2 + 1);

  const obj = JSON.parse(raw);
  if (!obj || typeof obj !== 'object') throw new Error('Malformed JSON');

  // Validate & coerce — reject fabricated or non-solar-looking shapes
  _validateLiveBundle(obj);

  // Persist
  EXEC_LIVE_RESULT    = obj;
  EXEC_LAST_REFRESHED = new Date();
  EXEC_LAST_ERROR     = null;

  const okBlocks = [obj.commissioned, obj.commissionTrend, obj.stateCommission].filter(Boolean).length;
  EXEC_REFRESH_MODE = okBlocks === 3 ? 'live' : (okBlocks > 0 ? 'live-partial' : 'seed');

  return obj;
}

/* ─── Run-scoped singleton: all three loaders share one API call per click ── */
async function execLiveOnce() {
  if (_EXEC_LIVE_INFLIGHT) return _EXEC_LIVE_INFLIGHT;
  _EXEC_LIVE_INFLIGHT = execLiveRefresh().catch(err => {
    EXEC_LAST_ERROR = err && err.message ? err.message : String(err);
    // Don't flip to 'live' on error. Seed stays visible.
    throw err;
  });
  return _EXEC_LIVE_INFLIGHT;
}

/* ─── Validation guardrails ──────────────────────────────────────────────── */
function _validateLiveBundle(obj) {
  if (obj.commissioned) {
    const c = obj.commissioned;
    if (typeof c.fyYtdMW !== 'number' || c.fyYtdMW < 0 || c.fyYtdMW > 200000)
      throw new Error('commissioned.fyYtdMW out of plausible range');
    if (typeof c.cumulativeMW !== 'number' || c.cumulativeMW < 50000 || c.cumulativeMW > 500000)
      throw new Error('commissioned.cumulativeMW out of plausible range');
  }
  if (obj.commissionTrend && Array.isArray(obj.commissionTrend.quarters)) {
    obj.commissionTrend.quarters.forEach(q => {
      if (typeof q.mw !== 'number' || q.mw < 0 || q.mw > 50000)
        throw new Error('commissionTrend.quarter.mw out of plausible range');
    });
  }
  if (obj.stateCommission && Array.isArray(obj.stateCommission.states)) {
    obj.stateCommission.states.forEach(s => {
      if (typeof s.fyYtdMW !== 'number' || s.fyYtdMW < 0 || s.fyYtdMW > 50000)
        throw new Error('stateCommission.state.fyYtdMW out of plausible range');
    });
  }
  if (obj.ucPipeline && Array.isArray(obj.ucPipeline.quarters)) {
    if (obj.ucPipeline.quarters.length < 2) {
      // single-anchor UC cannot form a series; force null to avoid faking
      obj.ucPipeline = null;
    } else {
      obj.ucPipeline.quarters.forEach(q => {
        if (typeof q.mw !== 'number' || q.mw < 0 || q.mw > 500000)
          throw new Error('ucPipeline.quarter.mw out of plausible range');
      });
    }
  }
  if (obj.developerRanking && Array.isArray(obj.developerRanking.developers)) {
    obj.developerRanking.developers.forEach(d => {
      ['totalAwardedMW','commissionedMW','underConstructionMW','conversionPct'].forEach(k => {
        if (d[k] != null) {
          if (typeof d[k] !== 'number' || d[k] < 0) throw new Error('developer.' + k + ' invalid');
          if (k === 'conversionPct' && d[k] > 100) throw new Error('developer.conversionPct > 100');
          if (k !== 'conversionPct' && d[k] > 200000) throw new Error('developer.' + k + ' out of plausible range');
        }
      });
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EFFECTIVE GETTERS — live-first, seed-fallback, always truthful about source
   Consumed by tab-execution.js render code.
   ─────────────────────────────────────────────────────────────────────── */

function execGetCommissionedKPI() {
  const live = EXEC_LIVE_RESULT && EXEC_LIVE_RESULT.commissioned;
  if (live) {
    return {
      mode:       'live',
      fyYtdMW:    live.fyYtdMW,
      cumulativeMW: live.cumulativeMW,
      currentFY:  live.currentFY,
      asOfDate:   EXEC_LIVE_RESULT.asOfDate,
      confidence: live.confidence,
      sourceNote: live.sourceNote || '',
    };
  }
  // Seed derivation: FY26 total from COMMISSION_TREND_META (already official-anchored)
  if (typeof COMMISSION_TREND_META !== 'undefined') {
    return {
      mode:       'seed',
      fyYtdMW:    COMMISSION_TREND_META.fy26Total,
      cumulativeMW: COMMISSION_TREND_META.latestCumulative,
      currentFY:  'FY26',
      asOfDate:   COMMISSION_TREND_META.cutoffDate,
      confidence: 'high',
      sourceNote: 'MNRE Physical Progress + PIB FY26 annual',
    };
  }
  return { mode: 'unavailable' };
}

function execGetCommissionTrend() {
  const live = EXEC_LIVE_RESULT && EXEC_LIVE_RESULT.commissionTrend;
  if (live && Array.isArray(live.quarters) && live.quarters.length > 0) {
    return {
      mode:        'live',
      labels:      live.quarters.map(q => q.label),
      commissioned: live.quarters.map(q => q.mw),
      asOfDate:    EXEC_LIVE_RESULT.asOfDate,
      quarters:    live.quarters,
    };
  }
  if (typeof COMMISSION_TREND_DATA !== 'undefined') {
    return {
      mode:        'seed',
      labels:      COMMISSION_TREND_DATA.labels,
      commissioned: COMMISSION_TREND_DATA.commissioned,
      asOfDate:    COMMISSION_TREND_META.cutoffDate,
      quarters:    null,
    };
  }
  return { mode: 'unavailable' };
}

function execGetStateCommission() {
  const live = EXEC_LIVE_RESULT && EXEC_LIVE_RESULT.stateCommission;
  if (live && Array.isArray(live.states) && live.states.length > 0) {
    // Sort live states descending by fyYtdMW so the bar ranking is stable.
    const rows = [...live.states].sort((a, b) => b.fyYtdMW - a.fyYtdMW);
    return {
      mode:       'live',
      fy:         live.currentFY,
      latestDate: live.latestDate,
      priorDate:  live.priorFYEndDate,
      states:     rows.map(r => r.state),
      mw:         rows.map(r => r.fyYtdMW),
      colors:     rows.map((_, i) => _PALETTE[i % _PALETTE.length]),
      rows,       // full row objects for detail rendering
      asOfDate:   live.latestDate,
    };
  }
  if (typeof STATE_COMMISSION_DATA !== 'undefined') {
    return {
      mode:       'seed',
      fy:         STATE_COMMISSION_META.fy,
      latestDate: STATE_COMMISSION_META.cutoffDate,
      priorDate:  'Mar 2025',
      states:     STATE_COMMISSION_DATA.states,
      mw:         STATE_COMMISSION_DATA.mw,
      colors:     STATE_COMMISSION_DATA.colors,
      rows:       STATE_COMMISSION_ROWS,
      asOfDate:   STATE_COMMISSION_META.cutoffDate,
    };
  }
  return { mode: 'unavailable' };
}

const _PALETTE = ['#f59e0b','#3b82f6','#22c55e','#a855f7','#f97316','#14b8a6','#6366f1','#ec4899','#78716c','#84cc16','#06b6d4','#94a3b8'];

function execGetUcPipeline() {
  const live = EXEC_LIVE_RESULT && EXEC_LIVE_RESULT.ucPipeline;
  if (live && Array.isArray(live.quarters) && live.quarters.length >= 2) {
    return {
      mode:     'live',
      labels:   live.quarters.map(q => q.label),
      mw:       live.quarters.map(q => q.mw),
      quarters: live.quarters,
      asOfDate: live.quarters[live.quarters.length - 1].periodEnd || EXEC_LIVE_RESULT.asOfDate,
    };
  }
  // No series possible — truthful UNAVAILABLE state. Surface the single
  // confirmed anchor point (if known) so the UI can state what IS confirmed
  // rather than omit it silently.
  return {
    mode:     'unavailable',
    reason:   'CEA quarterly UC reports return robots-disallowed and no ≥2-point solar-only quarterly series is available from the allowed primary sources.',
    confirmedAnchor: { date: '31 Dec 2024', mw: 84190, source: 'MNRE official @mnreindia post (Jan 2025)' },
  };
}

function execGetDeveloperRanking() {
  // The six required columns:
  //   rank · developer (+ticker) · totalAwardedMW · commissionedMW
  //   · underConstructionMW · conversionPct · latestQuarter
  const live = EXEC_LIVE_RESULT && EXEC_LIVE_RESULT.developerRanking;
  if (live && Array.isArray(live.developers) && live.developers.length > 0) {
    const rows = [...live.developers]
      .filter(d => typeof d.commissionedMW === 'number' && d.commissionedMW > 0)
      .sort((a, b) => b.commissionedMW - a.commissionedMW)
      .map((d, i) => ({
        rank:             i + 1,
        developer:        d.developer,
        ticker:           d.ticker || '',
        totalAwardedMW:   typeof d.totalAwardedMW      === 'number' ? d.totalAwardedMW      : null,
        commissionedMW:   typeof d.commissionedMW      === 'number' ? d.commissionedMW      : null,
        underConstructionMW: typeof d.underConstructionMW === 'number' ? d.underConstructionMW : null,
        conversionPct:    typeof d.conversionPct       === 'number' ? d.conversionPct       : null,
        latestQuarter:    d.latestQuarter || '',
        sourceUrls:       Array.isArray(d.sourceUrls) ? d.sourceUrls : [],
        sourceNote:       d.sourceNote || '',
      }));
    return {
      mode:     'live',
      asOfDate: live.asOfDate || EXEC_LIVE_RESULT.asOfDate,
      rows,
    };
  }
  // Seed fallback — remap DEVELOPER_ROWS to the 6-column shape.
  if (Array.isArray(DEVELOPER_ROWS) && DEVELOPER_ROWS.length > 0) {
    const rows = DEVELOPER_ROWS.map(d => ({
      rank:             d.rank,
      developer:        d.developer,
      ticker:           d.ticker || '',
      totalAwardedMW:   typeof d.portfolioMW === 'number' ? d.portfolioMW : null,  // portfolio = PPAs+LoAs = awarded
      commissionedMW:   typeof d.commissionedMW === 'number' ? d.commissionedMW : null,
      underConstructionMW: typeof d.ucMW === 'number' ? d.ucMW : null,
      conversionPct:    typeof d.conversionPct === 'number' ? d.conversionPct : null,
      latestQuarter:    d.latestQuarter || '',
      sourceUrls:       d.sourceUrl ? [d.sourceUrl] : [],
      sourceNote:       d.primarySource || '',
    }));
    return { mode: 'seed', asOfDate: DEVELOPER_META.dataAsOf, rows };
  }
  return { mode: 'unavailable', rows: [] };
}

/* ─── Small helpers used by tab-execution.js ─────────────────────────────── */
function execRefreshStatusText() {
  const hasKey = !!(EXEC_API_KEY && EXEC_API_KEY.trim());
  if (EXEC_LAST_REFRESHED) {
    const t = EXEC_LAST_REFRESHED.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const d = EXEC_LAST_REFRESHED.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    const tag = EXEC_REFRESH_MODE === 'live-partial' ? 'Live · partial' : 'Live';
    return `${tag} · refreshed ${d}, ${t}`;
  }
  if (EXEC_LAST_ERROR) return `Seed · last refresh failed: ${EXEC_LAST_ERROR}`;
  if (hasKey)         return `Seed · as of ${EXEC_SEED_AS_OF} — press Refresh for live`;
  return `Seed · as of ${EXEC_SEED_AS_OF} — paste EXEC_API_KEY in real-data-execution-live.js for live`;
}

function execModeChip(mode) {
  // mode: 'live' | 'seed' | 'live-partial' | 'unavailable'
  if (mode === 'live')        return '<span class="source-chip manual" style="background:rgba(34,197,94,0.12);color:#22c55e;border-color:rgba(34,197,94,0.3)"><i class="fa-solid fa-rotate"></i> LIVE · MNRE</span>';
  if (mode === 'live-partial')return '<span class="source-chip manual" style="background:rgba(245,158,11,0.12);color:#f59e0b;border-color:rgba(245,158,11,0.3)"><i class="fa-solid fa-rotate"></i> LIVE · Partial</span>';
  if (mode === 'unavailable') return '<span class="source-chip" style="background:rgba(239,68,68,0.12);color:#ef4444;border-color:rgba(239,68,68,0.3)"><i class="fa-solid fa-ban"></i> UNAVAILABLE</span>';
  return '<span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> SEED · MNRE</span>';
}

/* ── Getters for seed-only blocks (COD timeline, project table) ───────────── */

function execGetCodTimeline() {
  if (typeof COD_TIMELINE_ROWS !== 'undefined' && Array.isArray(COD_TIMELINE_ROWS) && COD_TIMELINE_ROWS.length) {
    return {
      mode:    'seed',
      rows:    COD_TIMELINE_ROWS,
      asOfDate: (typeof COD_TIMELINE_META !== 'undefined') ? COD_TIMELINE_META.cutoffDate : EXEC_SEED_AS_OF,
      meta:    (typeof COD_TIMELINE_META !== 'undefined') ? COD_TIMELINE_META : null,
    };
  }
  return { mode: 'unavailable', rows: [] };
}

function execGetProjectTable() {
  if (typeof PROJECT_TABLE_ROWS !== 'undefined' && Array.isArray(PROJECT_TABLE_ROWS) && PROJECT_TABLE_ROWS.length) {
    return {
      mode:    'seed',
      rows:    PROJECT_TABLE_ROWS,
      asOfDate: (typeof PROJECT_TABLE_META !== 'undefined') ? PROJECT_TABLE_META.cutoffDate : EXEC_SEED_AS_OF,
      meta:    (typeof PROJECT_TABLE_META !== 'undefined') ? PROJECT_TABLE_META : null,
    };
  }
  return { mode: 'unavailable', rows: [] };
}
