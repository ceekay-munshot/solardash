/* ═══════════════════════════════════════════════════════════════════════════
   TAB 4 — EXECUTION-TAB DATA ORCHESTRATOR
   ───────────────────────────────────────────────────────────────────────────
   Scope: Project Execution & COD Tracker tab ONLY. This file does NOT touch
   any other tab.

   Purpose (this step — step 1 / 5):
     • Register every block on the execution tab with its current status
       (real / mock / unavailable) and the source-of-truth file it reads from.
     • Provide a single entry point — refreshExecutionTab() — that can be
       called by the global refresh button when the execution tab is active.
     • Provide the block-by-block loader slots that later steps (2-5) will
       fill in. Right now every loader is either null (block has no live
       fetch path yet) or a synchronous self-check that re-asserts the data
       already in memory is consistent.
     • Do NOT implement any new network fetches yet.
     • Do NOT redesign UI. Re-render is a full-tab re-init (reset the
       dataset.initialized flag + call initExecutionTab again); Charts.js
       already destroys stale chart instances before re-creating them, so
       repeated renders are safe.

   Runtime reachability of the public sources named in the task:
     MNRE Physical Progress      (mnre.gov.in)       — blocked by browser CORS
     CEA plant-wise RE projects  (cea.nic.in)        — blocked by robots.txt
     CEA quarterly UC reports    (cea.nic.in)        — blocked by robots.txt
     BSE announcements            (bseindia.com)      — blocked by CORS + WAF
     NSE corp filings             (nseindia.com)      — blocked by CORS + WAF
     SECI tenders                 (seci.co.in)        — blocked by CORS
   None of these is directly fetchable from a static-hosted browser client.
   Any live refresh in later steps must either (a) go through an
   API-keyed server-side search path (the pattern tab-policy.js already
   uses via the Claude API), or (b) consume a pre-built JSON snapshot
   produced by a scheduled job outside the browser. This orchestrator is
   neutral to both choices — a loader is just an async function.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Block status constants ─────────────────────────────────────────────── */
const EXEC_BLOCK_STATUS = {
  REAL:        'real',         // wired to verified public data
  MOCK:        'mock',         // still reads MOCK.execution.*
  UNAVAILABLE: 'unavailable',  // intentionally blocked — primary source not public-reachable
};

/* ── Block registry ───────────────────────────────────────────────────────
   Ordered top-to-bottom, left-to-right, matching the visible layout of the
   execution tab. Every block on the tab must appear here exactly once.
   ─────────────────────────────────────────────────────────────────────── */
const EXEC_BLOCKS = [
  {
    id:     'kpi-row',
    title:  'Execution KPIs (4 cards)',
    status: EXEC_BLOCK_STATUS.MOCK,   // partial: only "Commissioned" is wired in step 2
    dataFile: 'js/mock-data.js (MOCK.execution.kpis) + js/real-data-execution-live.js (commissioned only)',
    sources: [
      'https://mnre.gov.in/en/physical-progress/',
    ],
    loader: execLoadCommissionedKPI,  // covers the Commissioned KPI only
    notes:  'Only the "Commissioned Capacity (FY YTD)" card is live-wired in step 2. UC / Delayed / Avg-Lag KPIs remain MOCK for later steps.',
  },
  {
    id:     'chart-commission-trend',
    title:  'Commissioning Trend',
    status: EXEC_BLOCK_STATUS.REAL,
    dataFile: 'js/real-data-commission-trend.js (COMMISSION_TREND_DATA)',
    sources: [
      'https://mnre.gov.in/en/physical-progress/',
    ],
    loader: execLoadCommissionTrend,
    notes:  'Quarterly solar additions Q1 FY25–Q4 FY26; derived from MNRE cumulative anchors.',
  },
  {
    id:     'chart-uc-pipeline',
    title:  'Under-Construction Solar Pipeline',
    status: EXEC_BLOCK_STATUS.REAL,    // attempted via live path; falls back to truthful UNAVAILABLE state
    dataFile: 'js/real-data-execution-live.js (live ucPipeline; no seed fallback)',
    sources: [
      'https://cea.nic.in/rpm/quarterly-report-on-under-construction-renewable-energy-projects/?lang=en',
      'https://cea.nic.in/rpm/plant-wise-details-of-renewable-energy-projects/?lang=en',
    ],
    loader: execLoadUcPipeline,
    notes:  'Live path: Claude API web_search against CEA UC reports / CEA plant-wise. Validator rejects single-point series to prevent a faked trend. If CEA stays robots-disallowed in runtime, the UI shows the truthful UNAVAILABLE state (the single confirmed anchor 84.19 GW @ 31 Dec 2024 is disclosed but no chart is drawn).',
  },
  {
    id:     'chart-state-commission',
    title:  'State-Wise Commissioning (FY26)',
    status: EXEC_BLOCK_STATUS.REAL,
    dataFile: 'js/real-data-state-commission.js (STATE_COMMISSION_DATA)',
    sources: [
      'https://mnre.gov.in/en/physical-progress/',
    ],
    loader: execLoadStateCommission,
    notes:  'Mar 2026 exact from MNRE state-wise PDF; Mar 2025 baseline derived per tier (RE Stats 2024-25 for top-5 RE states; Sep 2024 archive + growth ratio for the rest).',
  },
  {
    id:     'table-developer-ranking',
    title:  'Developer Commissioning Conversion Ranking',
    status: EXEC_BLOCK_STATUS.REAL,
    dataFile: 'js/real-data-developer-commission.js (DEVELOPER_ROWS — seed) + js/real-data-execution-live.js (live developerRanking)',
    sources: [
      'https://cea.nic.in/rpm/plant-wise-details-of-renewable-energy-projects/?lang=en',
      'https://www.seci.co.in/tenders',
      'https://www.bseindia.com/corporates/ann.html',
      'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
    ],
    loader: execLoadDeveloperRanking,
    notes:  'Live path: Claude API web_search against CEA plant-wise + SECI awards + BSE/NSE filings + official IR pages. No Mercom/JMK. Seed (4 developers) used when live unavailable. 6 columns: Rank, Developer, Total Awarded MW, Commissioned MW, Under Construction MW, Conversion %, Latest Quarter. conversionPct never computed from mixed sources — null where inconsistent.',
  },
  {
    id:     'block-delay-reasons',
    title:  'Delay Reason Analysis',
    status: EXEC_BLOCK_STATUS.MOCK,
    dataFile: 'js/mock-data.js (MOCK.execution.delayReasons)',
    sources: [
      'https://mnre.gov.in/en/physical-progress/',
      'https://www.bseindia.com/corporates/ann.html',
    ],
    loader: null,  // step 5 — likely cannot be fully sourced; candidate to mark UNAVAILABLE.
    notes:  'No structured public taxonomy of delay reasons at quarterly cadence. Expected lowest-yield block.',
  },
  {
    id:     'block-upcoming-cod',
    title:  'Upcoming COD Timeline',
    status: EXEC_BLOCK_STATUS.MOCK,
    dataFile: 'js/mock-data.js (MOCK.execution.upcomingCOD)',
    sources: [
      'https://www.bseindia.com/corporates/ann.html',
      'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
      'https://www.seci.co.in/tenders',
    ],
    loader: null,  // step 3 — curate from BSE Reg-30 commissioning notices + SECI award schedule.
    notes:  'Buildable from Reg-30 "intimation of commissioning" notices on BSE/NSE and known SECI award dates.',
  },
  {
    id:     'table-project-detail',
    title:  'Project Execution Detail Table',
    status: EXEC_BLOCK_STATUS.MOCK,
    dataFile: 'js/mock-data.js (MOCK.execution.projectTable)',
    sources: [
      'https://cea.nic.in/rpm/plant-wise-details-of-renewable-energy-projects/?lang=en',
      'https://www.bseindia.com/corporates/ann.html',
      'https://www.seci.co.in/tenders',
    ],
    loader: null,  // step 4 — rebuild from BSE Reg-30 + SECI award records already in repo.
    notes:  'CEA plant-wise is the ideal source but blocked; use BSE Reg-30 project notices + existing SECI award records (real-data-tenders-flow.js).',
  },
];

/* ── Per-block refresh state (updated by the orchestrator) ─────────────── */
const EXEC_REFRESH_STATE = {
  lastRunStartedAt: null,
  lastRunFinishedAt: null,
  lastRunDurationMs: null,
  byBlock: Object.fromEntries(EXEC_BLOCKS.map(b => [b.id, {
    lastRefreshedAt: null,
    lastError:       null,
    lastStatus:      'idle',   // 'idle' | 'running' | 'ok' | 'error' | 'skipped'
  }])),
};

/* ───────────────────────────────────────────────────────────────────────────
   LOADERS (step 2)
   The three REAL blocks share ONE live API call per refresh click
   (run-scoped cache in real-data-execution-live.js → execLiveOnce()).
   If EXEC_API_KEY is empty, the call throws NO_API_KEY and the loader
   records "error"; the block stays on SEED without pretending to be live.
   ─────────────────────────────────────────────────────────────────────── */

async function execLoadCommissionTrend() {
  if (typeof COMMISSION_TREND_DATA !== 'object' || !Array.isArray(COMMISSION_TREND_DATA.labels)) {
    throw new Error('COMMISSION_TREND_DATA (seed) not loaded');
  }
  if (typeof execLiveOnce === 'function' && EXEC_API_KEY && EXEC_API_KEY.trim()) {
    const live = await execLiveOnce();
    const n = live && live.commissionTrend && live.commissionTrend.quarters
      ? live.commissionTrend.quarters.length : 0;
    return { source: 'live', quarters: n, asOf: live && live.asOfDate };
  }
  return { source: 'seed', quarters: COMMISSION_TREND_DATA.labels.length, asOf: COMMISSION_TREND_META.cutoffDate };
}

async function execLoadStateCommission() {
  if (typeof STATE_COMMISSION_DATA !== 'object' || !Array.isArray(STATE_COMMISSION_DATA.states)) {
    throw new Error('STATE_COMMISSION_DATA (seed) not loaded');
  }
  if (typeof execLiveOnce === 'function' && EXEC_API_KEY && EXEC_API_KEY.trim()) {
    const live = await execLiveOnce();
    const n = live && live.stateCommission && live.stateCommission.states
      ? live.stateCommission.states.length : 0;
    return { source: 'live', states: n, asOf: live && live.stateCommission && live.stateCommission.latestDate };
  }
  return { source: 'seed', states: STATE_COMMISSION_DATA.states.length, asOf: STATE_COMMISSION_META.cutoffDate };
}

async function execLoadDeveloperRanking() {
  if (!Array.isArray(DEVELOPER_ROWS) || DEVELOPER_ROWS.length === 0) {
    throw new Error('DEVELOPER_ROWS (seed) not loaded');
  }
  if (typeof execLiveOnce === 'function' && EXEC_API_KEY && EXEC_API_KEY.trim()) {
    const live = await execLiveOnce();
    const n = live && live.developerRanking && live.developerRanking.developers
      ? live.developerRanking.developers.length : 0;
    return { source: n > 0 ? 'live' : 'seed', developers: n || DEVELOPER_ROWS.length,
             asOf: (live && live.developerRanking && live.developerRanking.asOfDate) || DEVELOPER_META.dataAsOf };
  }
  return { source: 'seed', developers: DEVELOPER_ROWS.length, asOf: DEVELOPER_META.dataAsOf };
}

async function execLoadUcPipeline() {
  if (typeof execLiveOnce !== 'function' || !EXEC_API_KEY || !EXEC_API_KEY.trim()) {
    // No key ⇒ no live attempt. UI shows truthful UNAVAILABLE state.
    return { source: 'unavailable', reason: 'no-api-key', quarters: 0 };
  }
  const live = await execLiveOnce();
  const qs = live && live.ucPipeline && Array.isArray(live.ucPipeline.quarters)
    ? live.ucPipeline.quarters : [];
  if (qs.length < 2) {
    return { source: 'unavailable', reason: 'cea-blocked-or-insufficient', quarters: qs.length };
  }
  return { source: 'live', quarters: qs.length, asOf: qs[qs.length - 1].periodEnd };
}

/* Commissioned-KPI derivation — same live bundle, no extra call */
async function execLoadCommissionedKPI() {
  if (typeof execLiveOnce === 'function' && EXEC_API_KEY && EXEC_API_KEY.trim()) {
    const live = await execLiveOnce();
    if (live && live.commissioned) {
      return { source: 'live', fyYtdMW: live.commissioned.fyYtdMW, asOf: live.asOfDate };
    }
  }
  if (typeof COMMISSION_TREND_META === 'undefined') throw new Error('seed unavailable');
  return { source: 'seed', fyYtdMW: COMMISSION_TREND_META.fy26Total, asOf: COMMISSION_TREND_META.cutoffDate };
}

/* ───────────────────────────────────────────────────────────────────────────
   ORCHESTRATOR
   Call site: main.js global refresh button when currentTab === 'execution'.
   ─────────────────────────────────────────────────────────────────────── */

async function refreshExecutionTab(opts = {}) {
  const log = opts.log !== false;
  const t0 = performance.now();
  EXEC_REFRESH_STATE.lastRunStartedAt = new Date();

  // Share a single live API call across the 3 real-block loaders.
  if (typeof execResetLiveRun === 'function') execResetLiveRun();

  const tasks = EXEC_BLOCKS.map(async (block) => {
    const state = EXEC_REFRESH_STATE.byBlock[block.id];
    if (!block.loader) {
      state.lastStatus = 'skipped';
      return { id: block.id, status: 'skipped', reason: block.status };
    }
    state.lastStatus = 'running';
    state.lastError  = null;
    try {
      const result = await block.loader();
      state.lastStatus      = 'ok';
      state.lastRefreshedAt = new Date();
      return { id: block.id, status: 'ok', result };
    } catch (err) {
      state.lastStatus = 'error';
      state.lastError  = err && err.message ? err.message : String(err);
      return { id: block.id, status: 'error', error: state.lastError };
    }
  });

  const results = await Promise.all(tasks);

  const t1 = performance.now();
  EXEC_REFRESH_STATE.lastRunFinishedAt = new Date();
  EXEC_REFRESH_STATE.lastRunDurationMs = Math.round(t1 - t0);

  // Re-render the execution tab so any updated in-memory data propagates.
  // Blocks whose loader was a no-op still re-render from the same arrays —
  // cheap and keeps the code path uniform.
  execTabRerender();

  const summary = {
    ok:        results.filter(r => r.status === 'ok').length,
    errored:   results.filter(r => r.status === 'error').length,
    skipped:   results.filter(r => r.status === 'skipped').length,
    durationMs: EXEC_REFRESH_STATE.lastRunDurationMs,
  };

  if (log && typeof console !== 'undefined') {
    console.info('[exec] refresh done', summary, results);
  }
  return { summary, results };
}

/* ── Full-tab re-render trigger ────────────────────────────────────────── */
function execTabRerender() {
  const el = document.getElementById('tab-execution');
  if (!el) return;
  if (typeof initExecutionTab !== 'function') return;
  // Clearing initialized flag is the minimal, redesign-free way to re-run the
  // existing init. Chart.js instances are replaced by destroy-then-create
  // inside the Charts.* wrappers.
  delete el.dataset.initialized;
  initExecutionTab();
}

/* ── Small helper for tests / devtools ─────────────────────────────────── */
function execAuditBlocks() {
  return EXEC_BLOCKS.map(b => ({
    id: b.id,
    title: b.title,
    status: b.status,
    hasLoader: typeof b.loader === 'function',
    lastRefreshedAt: EXEC_REFRESH_STATE.byBlock[b.id].lastRefreshedAt,
    lastStatus: EXEC_REFRESH_STATE.byBlock[b.id].lastStatus,
    lastError: EXEC_REFRESH_STATE.byBlock[b.id].lastError,
  }));
}
