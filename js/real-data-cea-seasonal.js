/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Seasonal Momentum Tracker (CEA / GRID-INDIA)
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 1 → "Seasonal Momentum Tracker" strip ONLY

   SOURCES (official, in priority order)
     1. CEA RE generation portal         https://gen-re.cea.gov.in/
     2. CEA Daily RE Report              https://cea.nic.in/daily-renewable-generation-report/?lang=en
     3. CEA Monthly RE Report            https://cea.nic.in/renewable-generation-report/?lang=en
     4. CEA Monthly Reports Archive      https://cea.nic.in/monthly-reports-archive/?lang=en
     5. GRID-INDIA Daily VRE report      https://report.grid-india.in/vre_report.php

   FETCH STRATEGY
     Most .gov.in origins do not expose CORS headers, so direct browser
     fetches to the CEA / GRID-INDIA hosts are blocked. To keep the widget
     honestly live:
       (a) The fetcher first looks for a local JSON snapshot at
             data/cea-solar-monthly.json
           produced by the operator's data pipeline. This file is the
           preferred source because it is CORS-free and can carry both the
           completed-months series and the month-to-date figures used for the
           Provisional card.
       (b) If that is absent, the fetcher attempts the CEA RE portal URL
           directly with a short timeout. This will usually fail with a CORS
           or network error in the browser — which is handled by showing
           "Source unavailable" per the tab requirements.
     No mock data is ever used as a fallback.

   KPI FORMULA
     yoy_pct = ((current_month_solar_gen - same_month_last_year_solar_gen)
                / same_month_last_year_solar_gen) * 100
     For the current unfinished month, `current` is MTD-solar-gen and
     `prior` is the prior-year generation summed over the same number of
     calendar days. The card is tagged Provisional.

   EXPECTED JSON SNAPSHOT FORMAT (data/cea-solar-monthly.json)
     {
       "fetchedAt": "2026-04-17T10:15:00+05:30",
       "primarySource": "CEA RE generation portal",
       "primarySourceUrl": "https://gen-re.cea.gov.in/",
       "crossCheckSource": "GRID-INDIA Daily VRE report",
       "units": "GWh",
       "series": [
         { "monthKey": "2025-11", "current": 14500, "prior": 12300 },
         { "monthKey": "2025-12", "current": 13000, "prior": 11100 },
         { "monthKey": "2026-01", "current": 15200, "prior": 12800 },
         { "monthKey": "2026-02", "current": 15800, "prior": 13000 },
         { "monthKey": "2026-03", "current": 18200, "prior": 15100 },
         { "monthKey": "2026-04", "current": 10500, "prior":  8900,
           "provisional": true, "mtdDays": 17 }
       ]
     }
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const CEA_SEASONAL_SOURCES = [
  { label: 'CEA RE Generation Portal',  url: 'https://gen-re.cea.gov.in/' },
  { label: 'CEA Daily RE Report',        url: 'https://cea.nic.in/daily-renewable-generation-report/?lang=en' },
  { label: 'CEA Monthly RE Report',      url: 'https://cea.nic.in/renewable-generation-report/?lang=en' },
  { label: 'CEA Monthly Reports Archive',url: 'https://cea.nic.in/monthly-reports-archive/?lang=en' },
  { label: 'GRID-INDIA Daily VRE Report', url: 'https://report.grid-india.in/vre_report.php' },
];

const CEA_SEASONAL_PRIMARY_URL  = 'https://gen-re.cea.gov.in/';
const CEA_SEASONAL_LOCAL_SNAPSHOT = 'data/cea-solar-monthly.json';
const CEA_SEASONAL_FETCH_TIMEOUT_MS = 8000;

const MONTH_ABBREV = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ── Compute the 6-month rolling window to show ─────────────────────────────
   Last 5 completed months + current (provisional) month, chronological order.
   ─────────────────────────────────────────────────────────────────────────── */
function computeSeasonalWindow(now) {
  const months = [];
  const today = now instanceof Date ? now : new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    months.push({
      monthKey:     `${y}-${String(m + 1).padStart(2, '0')}`,
      monthAbbrev:  MONTH_ABBREV[m],
      year:         y,
      provisional:  i === 0,
    });
  }
  return months;
}

/* ── Auto-generated seasonal + momentum label ──────────────────────────────
   Produces a compact phrase from (month abbreviation + YoY percent).
   Seasonal zones reflect the Indian solar calendar (FY runs Apr-Mar).
   ─────────────────────────────────────────────────────────────────────────── */
function seasonalMomentumLabel(monthAbbrev, yoyPct) {
  if (yoyPct === null || !Number.isFinite(yoyPct)) return '—';

  const zone =
    (monthAbbrev === 'Apr' || monthAbbrev === 'May') ? 'peak'    :
    (monthAbbrev === 'Jun' || monthAbbrev === 'Jul' ||
     monthAbbrev === 'Aug' || monthAbbrev === 'Sep') ? 'monsoon' :
    (monthAbbrev === 'Oct' || monthAbbrev === 'Nov') ? 'autumn'  :
    (monthAbbrev === 'Dec' || monthAbbrev === 'Jan') ? 'winter'  :
                                                        'spring' ; // Feb, Mar

  const momentum =
    yoyPct >=  20 ? 'surge'    :
    yoyPct >=   8 ? 'rise'     :
    yoyPct >=  -3 ? 'plateau'  :
    yoyPct >= -10 ? 'softness' :
                    'decline'  ;

  const LABELS = {
    peak:    { surge:'Peak Solar Surge',       rise:'Peak Solar Momentum',   plateau:'Summer Plateau',      softness:'Summer Softness',     decline:'Summer Decline' },
    monsoon: { surge:'Above-Normal Monsoon',   rise:'Monsoon Resilience',    plateau:'Monsoon Plateau',     softness:'Monsoon Softness',    decline:'Monsoon Dip' },
    autumn:  { surge:'Post-Monsoon Surge',     rise:'Post-Monsoon Rise',     plateau:'Autumn Plateau',      softness:'Post-Monsoon Softness', decline:'Autumn Decline' },
    winter:  { surge:'Winter Momentum',        rise:'Winter Rise',           plateau:'Winter Plateau',      softness:'Winter Softness',     decline:'Winter Decline' },
    spring:  { surge:'Pre-Summer Surge',       rise:'Pre-Summer Rise',       plateau:'Pre-Summer Plateau',  softness:'Pre-Summer Softness', decline:'Pre-Summer Decline' },
  };
  return LABELS[zone][momentum];
}

/* ── Fetch: try local snapshot, then primary CEA URL. Throw on all failures. */
async function fetchSeasonalMomentumData() {
  // (a) local JSON snapshot — CORS-free, preferred when the operator's pipeline
  //     has dropped a fresh snapshot into data/cea-solar-monthly.json.
  try {
    const resp = await fetch(CEA_SEASONAL_LOCAL_SNAPSHOT, { cache: 'no-cache' });
    if (resp.ok) {
      const j = await resp.json();
      if (j && Array.isArray(j.series) && j.series.length > 0) {
        return { ...j, sourcePath: 'local-snapshot' };
      }
    }
  } catch (_e) { /* fall through */ }

  // (b) CEA RE generation portal — may be blocked by CORS; that is handled by
  //     the caller as a "Source unavailable" state.
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), CEA_SEASONAL_FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(CEA_SEASONAL_PRIMARY_URL, {
      signal: ctrl.signal,
      mode:   'cors',
      cache:  'no-cache',
      headers:{ 'Accept': 'application/json, text/html' },
    });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    // gen-re.cea.gov.in serves a PHP page, not a documented JSON API. Without
    // a stable machine-readable contract we cannot safely parse HTML here —
    // so a successful response without a known schema still surfaces as
    // "Source unavailable" via the error path below.
    throw new Error('No machine-readable CEA schema; operator must drop a snapshot at data/cea-solar-monthly.json');
  } catch (e) {
    clearTimeout(timeout);
    throw new Error('CEA RE portal fetch failed: ' + (e && e.message ? e.message : e));
  }
}

/* ── Derive the 6 momentum cards from a data snapshot ───────────────────── */
function deriveMomentumCards(snapshot, now) {
  const window = computeSeasonalWindow(now);
  const byKey = new Map((snapshot.series || []).map(r => [r.monthKey, r]));

  return window.map(w => {
    const row = byKey.get(w.monthKey);
    if (!row || row.current == null || row.prior == null || row.prior === 0) {
      return {
        ...w,
        current:   row ? row.current : null,
        prior:     row ? row.prior   : null,
        yoyPct:    null,
        label:     'Source unavailable',
        available: false,
      };
    }
    const yoyPct = ((row.current - row.prior) / row.prior) * 100;
    return {
      ...w,
      current:     row.current,
      prior:       row.prior,
      yoyPct,
      mtdDays:     row.mtdDays || null,
      provisional: w.provisional || Boolean(row.provisional),
      label:       seasonalMomentumLabel(w.monthAbbrev, yoyPct),
      available:   true,
    };
  });
}

/* ── Markup helpers ─────────────────────────────────────────────────────── */
function formatYoyPct(pct) {
  if (pct === null || !Number.isFinite(pct)) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function yoyColorStyle(pct) {
  if (pct === null || !Number.isFinite(pct)) return 'color:var(--text-secondary)';
  if (pct >=  3) return 'color:var(--status-positive)';
  if (pct <= -3) return 'color:var(--status-negative)';
  return 'color:var(--text-secondary)';
}

function buildSourcesLine() {
  return CEA_SEASONAL_SOURCES.map(s => (
    `<a href="${s.url}" target="_blank" rel="noopener" title="${s.label}"
        style="color:var(--accent-blue);text-decoration:none;display:inline-flex;align-items:center;gap:3px">
       <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px;opacity:0.8"></i>${s.label}
     </a>`
  )).join(' <span style="color:var(--text-disabled)">·</span> ');
}

function renderMomentumCards(cards) {
  return cards.map(c => {
    const tone = yoyColorStyle(c.yoyPct);
    const yoy  = formatYoyPct(c.yoyPct);
    const sub  = c.provisional
      ? `Provisional${c.mtdDays ? ' · ' + c.mtdDays + ' days MTD' : ''}`
      : `${c.monthAbbrev} YoY`;
    return `
      <div class="momentum-item" title="${c.current != null && c.prior != null
          ? `${c.current.toLocaleString()} GWh vs ${c.prior.toLocaleString()} GWh (same month ${c.year - 1})`
          : 'No value available for this month'}">
        <div class="momentum-label">${c.monthAbbrev} ${String(c.year).slice(-2)}${c.provisional ? ' · PROV.' : ''}</div>
        <div class="momentum-val" style="${tone}">${yoy}</div>
        <div class="momentum-trend" style="${tone}">${c.label}</div>
        <div style="font-size:9px;color:var(--text-disabled);margin-top:4px">${sub}</div>
      </div>`;
  }).join('');
}

function renderUnavailableState(errMsg) {
  const safeMsg = (errMsg || '').replace(/[<>]/g, '');
  return `
    <div class="momentum-item" style="flex:1;min-width:100%;background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.25)">
      <div class="momentum-label" style="color:var(--status-negative)">
        <i class="fa-solid fa-triangle-exclamation"></i> Source unavailable
      </div>
      <div style="font-size:12px;color:var(--text-primary);margin-top:4px;line-height:1.5">
        Live fetch from the CEA RE generation portal failed. No mock values are shown.
        Use the source links below to verify the numbers directly on the official pages,
        or drop a fresh snapshot at <code style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--accent-blue)">data/cea-solar-monthly.json</code>.
      </div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:6px;font-family:'JetBrains Mono',monospace">${safeMsg}</div>
    </div>`;
}

/* ── Main initializer ───────────────────────────────────────────────────── */
async function initSeasonalMomentum(containerSelector) {
  const root = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!root) return;

  const windowStart = computeSeasonalWindow(new Date())[0];
  const windowEnd   = computeSeasonalWindow(new Date())[5];

  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;gap:12px;flex-wrap:wrap">
      <div>
        <h3 class="section-title" style="margin:0">Seasonal Momentum Tracker</h3>
        <div class="section-subtitle" style="font-size:11px;color:var(--text-muted)">
          Month-over-same-month-prior-year solar generation (India) ·
          Window: ${windowStart.monthAbbrev} ${String(windowStart.year).slice(-2)} – ${windowEnd.monthAbbrev} ${String(windowEnd.year).slice(-2)} ·
          Formula: ((current − prior) / prior) × 100
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span class="source-chip manual" title="Primary: CEA RE portal · Cross-check: GRID-INDIA VRE">
          <i class="fa-solid fa-file-arrow-down"></i> LIVE · CEA / GRID-INDIA
        </span>
        <a href="#" id="seasonalRefreshBtn" title="Re-fetch from source"
           style="color:var(--accent-blue);font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:4px">
          <i class="fa-solid fa-rotate-right"></i> Refresh
        </a>
      </div>
    </div>
    <div class="momentum-strip" id="seasonalMomentumStrip">
      ${computeSeasonalWindow(new Date()).map(w => `
        <div class="momentum-item" style="opacity:0.55">
          <div class="momentum-label">${w.monthAbbrev} ${String(w.year).slice(-2)}${w.provisional ? ' · PROV.' : ''}</div>
          <div class="momentum-val">…</div>
          <div class="momentum-trend">loading</div>
        </div>`).join('')}
    </div>
    <div style="padding:10px 0 0;margin-top:10px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> LIVE · CEA / GRID-INDIA</span>
      <span class="chart-source" style="display:inline-flex;flex-wrap:wrap;gap:6px;align-items:center">
        <i class="fa-solid fa-link" style="color:var(--text-muted);font-size:10px"></i>
        Sources: ${buildSourcesLine()}
      </span>
      <span class="chart-source" style="margin-left:auto" id="seasonalUpdatedStamp">
        Last updated from source: —
      </span>
    </div>
  `;

  const strip  = root.querySelector('#seasonalMomentumStrip');
  const stamp  = root.querySelector('#seasonalUpdatedStamp');
  const refresh = root.querySelector('#seasonalRefreshBtn');

  async function load() {
    strip.innerHTML = computeSeasonalWindow(new Date()).map(w => `
      <div class="momentum-item" style="opacity:0.55">
        <div class="momentum-label">${w.monthAbbrev} ${String(w.year).slice(-2)}${w.provisional ? ' · PROV.' : ''}</div>
        <div class="momentum-val">…</div>
        <div class="momentum-trend">loading</div>
      </div>`).join('');
    stamp.textContent = 'Last updated from source: fetching…';

    try {
      const snapshot = await fetchSeasonalMomentumData();
      const cards    = deriveMomentumCards(snapshot, new Date());
      strip.innerHTML = renderMomentumCards(cards);
      const stampDate = snapshot.fetchedAt
        ? new Date(snapshot.fetchedAt)
        : new Date();
      stamp.innerHTML = `Last updated from source: <span style="font-family:'JetBrains Mono',monospace">${
        stampDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      }</span>${snapshot.sourcePath === 'local-snapshot' ? ' · local snapshot' : ' · live'}`;
    } catch (err) {
      strip.innerHTML = renderUnavailableState(err && err.message ? err.message : String(err));
      stamp.textContent = 'Last updated from source: never — source unavailable';
    }
  }

  if (refresh) {
    refresh.addEventListener('click', (ev) => { ev.preventDefault(); load(); });
  }
  load();
}
