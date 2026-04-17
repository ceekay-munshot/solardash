/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — Sector Demand & Power Market Pulse
   ───────────────────────────────────────────────────────────────────────────
   Data sources:
     KPI cards / charts   → MOCK.demand (unchanged — not yet wired)
     State capacity table → MNRE_STATE_CAPACITY  (real · 31 Mar 2026)
     State heatmap        → MNRE_HEATMAP_STATES  (real · 31 Mar 2026)
     State bar chart      → MNRE_TOP10           (real · 31 Mar 2026)
   ═══════════════════════════════════════════════════════════════════════════ */

function initDemandTab() {
  const el = document.getElementById('tab-demand');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d   = MOCK.demand;
  const src = DATA_SOURCES.demand;

  el.innerHTML = `
  <!-- KPI Row — MOCK (not yet wired) -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'Total Installed Solar Base', value: d.kpis.totalSolar.value, unit: d.kpis.totalSolar.unit, delta: d.kpis.totalSolar.delta, dir: d.kpis.totalSolar.dir, context: d.kpis.totalSolar.context, icon:'fa-solar-panel', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)', source:'mnre' })}
    ${Components.kpiCard({ label:'Solar Share in Generation', value: d.kpis.solarShare.value, unit: d.kpis.solarShare.unit, delta: d.kpis.solarShare.delta, dir: d.kpis.solarShare.dir, context: d.kpis.solarShare.context, icon:'fa-chart-pie', accentColor:'var(--accent-blue)', iconBg:'rgba(59,130,246,0.1)', source:'mnre' })}
    ${Components.kpiCard({ label:'Peak Demand (FY YTD High)', value: d.kpis.peakDemand.value, unit: d.kpis.peakDemand.unit, delta: d.kpis.peakDemand.delta, dir: d.kpis.peakDemand.dir, context: d.kpis.peakDemand.context, icon:'fa-bolt', accentColor:'var(--accent-orange)', iconBg:'rgba(249,115,22,0.1)', source:'cea' })}
    ${Components.kpiCard({ label:'Energy Demand Growth YoY', value: d.kpis.demandGrowth.value, unit: d.kpis.demandGrowth.unit, delta: d.kpis.demandGrowth.delta, dir: d.kpis.demandGrowth.dir, context: d.kpis.demandGrowth.context, icon:'fa-arrow-trend-up', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)', source:'cea' })}
  </div>

  <!-- Seasonal Momentum Tracker — LIVE (CEA RE portal primary, GRID-INDIA cross-check) -->
  <div class="mb-6" id="seasonalMomentumRoot"></div>

  <!-- Charts Row 1 — MOCK (not yet wired) -->
  <div class="grid-2 mb-6">
    ${Components.chartCard({ id:'chartDemand', title:'Monthly Power Demand Trend', subtitle:'BU (Billion Units) — National consumption', height:280, source: src.label, footer: `<span class="source-chip mock">MOCK</span>` })}
    ${Components.chartCard({ id:'chartSolarGen', title:'Monthly Solar Generation Trend', subtitle:'BU — Solar generation feed-in', height:280, source: src.label })}
  </div>

  <!-- ── REAL DATA SECTION ──────────────────────────────────────────────────
       State capacity table, heatmap, and bar chart all use MNRE_STATE_CAPACITY
       (real-data-mnre.js).  Source: MNRE Physical Progress PDF · 31 Mar 2026.
       ─────────────────────────────────────────────────────────────────────── -->
  <div class="grid-2-1 mb-6">

    <!-- ── State Ranking Table (REAL DATA) ── -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State-Wise Installed Solar Capacity Ranking</div>
          <div class="card-subtitle">
            Solar Power Total (GMS + RTS + Hybrid + Off-grid) · as of ${MNRE_META.dataAsOf}
          </div>
        </div>
        <!-- Action area: real-data chip + freshness status -->
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="source-chip manual" title="Extracted from MNRE Physical Progress PDF · ${MNRE_META.dataAsOf}">
            <i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE
          </span>
          <span id="mnreUpdateStatus"></span>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>Rank</th>
            <th>State / UT</th>
            <th class="number">Installed (GW)</th>
            <th class="number">National Share</th>
            <th style="width:160px">vs Top State</th>
          </tr></thead>
          <tbody>
            ${MNRE_STATE_CAPACITY.map((s, i) => `
            <tr>
              <td>${Components.rankBadge(s.rank)}</td>
              <td class="primary">${s.state}</td>
              <td class="number mono">${formatCapacity(s.mw)}</td>
              <td class="number">${s.sharePct >= 0.05 ? s.sharePct.toFixed(1) + '%' : '<0.1%'}</td>
              <td>${Components.progressBar(Math.max(s.pct, 0.3), i < 3 ? 'var(--accent-solar)' : 'var(--accent-blue)')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:10px 20px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE</span>
        <span class="chart-source">
          Source: MNRE Physical Progress ·
          <a href="${MNRE_META.pdfUrl}" target="_blank" rel="noopener"
             style="color:var(--accent-blue);text-decoration:none">PDF · ${MNRE_META.dataAsOf}</a>
        </span>
        <span class="chart-source" style="margin-left:auto">
          National Total: ${MNRE_NATIONAL_GW} GW
        </span>
      </div>
    </div>

    <!-- ── State Heatmap Panel (REAL DATA) ── -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Solar Density by State</div>
          <div class="card-subtitle">Relative installed base · ${MNRE_META.dataAsOf}</div>
        </div>
        <span class="source-chip manual" title="MNRE Physical Progress · ${MNRE_META.dataAsOf}">
          <i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE
        </span>
      </div>
      <div class="card-body">
        <div class="india-state-grid">
          ${buildStateHeatmap()}
        </div>
        <div style="margin-top:16px;display:flex;gap:16px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(34,197,94,0.25)"></div> &gt;10 GW</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(245,158,11,0.25)"></div> 5–10 GW</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(59,130,246,0.2)"></div> 2–5 GW</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:var(--bg-elevated)"></div> &lt;2 GW</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;margin-top:8px;border-top:1px solid var(--border-subtle)">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE</span>
          <span class="chart-source">Source: MNRE Physical Progress · ${MNRE_META.dataAsOf}</span>
          <span class="chart-source" style="margin-left:auto">Updated: ${MNRE_META.pdfPostedOn}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ── State Horizontal Bar Chart (REAL DATA — Top 10) ── -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State-Wise Solar Installed Capacity — Top 10</div>
          <div class="card-subtitle">GW · Solar Power Total · ${MNRE_META.dataAsOf}</div>
        </div>
        <span class="source-chip manual" title="MNRE Physical Progress · ${MNRE_META.dataAsOf}">
          <i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE
        </span>
      </div>
      <div class="chart-body">
        <div class="canvas-wrap" style="height:280px">
          <canvas id="chartStateBar"></canvas>
        </div>
      </div>
      <div class="chart-footer">
        <span class="chart-source">
          Source: MNRE Physical Progress ·
          <a href="${MNRE_META.pdfUrl}" target="_blank" rel="noopener"
             style="color:var(--accent-blue);text-decoration:none">PDF · ${MNRE_META.dataAsOf}</a>
        </span>
        <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE</span>
      </div>
    </div>
  </div>
  `;

  // ── Draw charts ────────────────────────────────────────────────────────────
  requestAnimationFrame(() => {

    // Monthly Demand — MOCK
    const demand = d.monthlyDemand;
    Charts.multiLine('chartDemand', demand.labels, [
      { label: 'FY23-24', data: demand.series['FY23-24'], color: '#64748b' },
      { label: 'FY24-25', data: demand.series['FY24-25'], color: '#f59e0b', fill: true },
    ], { yLabel: 'BU' });

    // Solar Generation — MOCK
    const solar = d.solarGeneration;
    Charts.area('chartSolarGen', solar.labels, [
      { label: 'FY23-24', data: solar.series['FY23-24'], color: '#64748b' },
      { label: 'FY24-25', data: solar.series['FY24-25'], color: '#3b82f6' },
    ], { yLabel: 'BU' });

    // State bar chart — REAL DATA (Top 10)
    Charts.horizontalBar(
      'chartStateBar',
      MNRE_TOP10.map(s => s.state),
      MNRE_TOP10.map(s => s.gw),
      MNRE_TOP10.map((_, i) => i < 3 ? '#f59e0b' : i < 6 ? '#3b82f6' : '#6366f1'),
      { xLabel: 'Installed Capacity (GW)', label: 'GW' }
    );

    // Run freshness check after paint (best-effort, fails safely)
    checkMNREDataFreshness();

    // Seasonal Momentum Tracker — live fetch from CEA RE portal, with
    // graceful "Source unavailable" fallback (no mock data).
    if (typeof initSeasonalMomentum === 'function') {
      initSeasonalMomentum('#seasonalMomentumRoot');
    }
  });
}

/* ── State heatmap builder — uses MNRE real data ────────────────────────── */
/* ── Capacity display formatter ─────────────────────────────────────────────
   Switches from GW to MW for states below 100 MW to avoid showing "0.00 GW".
   ─────────────────────────────────────────────────────────────────────────── */
function formatCapacity(mw) {
  if (mw >= 100) return (mw / 1000).toFixed(2) + ' GW';
  if (mw >= 10)  return mw.toFixed(0) + ' MW';
  return mw.toFixed(2) + ' MW';
}

function buildStateHeatmap() {
  return MNRE_HEATMAP_STATES.map(s => {
    let heatStyle;
    if (s.gw >= 10) {
      heatStyle = 'background:rgba(34,197,94,0.2);border-color:rgba(34,197,94,0.3);';
    } else if (s.gw >= 5) {
      heatStyle = 'background:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.3);';
    } else if (s.gw >= 2) {
      heatStyle = 'background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.3);';
    } else {
      heatStyle = 'background:var(--bg-elevated);border-color:var(--border-subtle);';
    }

    // Display GW with appropriate precision
    const gwDisplay = s.gw >= 10
      ? s.gw.toFixed(1) + 'GW'
      : s.gw >= 1
      ? s.gw.toFixed(2) + 'GW'
      : (s.gw * 1000).toFixed(0) + 'MW';

    return `
    <div class="heat-cell" style="${heatStyle}border:1px solid;border-radius:8px;padding:8px 4px;text-align:center"
         title="${s.name}: ${s.gw.toFixed(2)} GW">
      <div class="state-name" style="font-size:10px;font-weight:700;color:var(--text-primary)">${s.name}</div>
      <div class="state-val" style="font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--text-secondary)">${gwDisplay}</div>
    </div>`;
  }).join('');
}
