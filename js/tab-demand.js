/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — Sector Demand & Power Market Pulse
   ═══════════════════════════════════════════════════════════════════════════ */

function initDemandTab() {
  const el = document.getElementById('tab-demand');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.demand;
  const src = DATA_SOURCES.demand;

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'Total Installed Solar Base', value: d.kpis.totalSolar.value, unit: d.kpis.totalSolar.unit, delta: d.kpis.totalSolar.delta, dir: d.kpis.totalSolar.dir, context: d.kpis.totalSolar.context, icon:'fa-solar-panel', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)', source:'mnre' })}
    ${Components.kpiCard({ label:'Solar Share in Generation', value: d.kpis.solarShare.value, unit: d.kpis.solarShare.unit, delta: d.kpis.solarShare.delta, dir: d.kpis.solarShare.dir, context: d.kpis.solarShare.context, icon:'fa-chart-pie', accentColor:'var(--accent-blue)', iconBg:'rgba(59,130,246,0.1)', source:'mnre' })}
    ${Components.kpiCard({ label:'Peak Demand (FY YTD High)', value: d.kpis.peakDemand.value, unit: d.kpis.peakDemand.unit, delta: d.kpis.peakDemand.delta, dir: d.kpis.peakDemand.dir, context: d.kpis.peakDemand.context, icon:'fa-bolt', accentColor:'var(--accent-orange)', iconBg:'rgba(249,115,22,0.1)', source:'cea' })}
    ${Components.kpiCard({ label:'Energy Demand Growth YoY', value: d.kpis.demandGrowth.value, unit: d.kpis.demandGrowth.unit, delta: d.kpis.demandGrowth.delta, dir: d.kpis.demandGrowth.dir, context: d.kpis.demandGrowth.context, icon:'fa-arrow-trend-up', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)', source:'cea' })}
  </div>

  <!-- Seasonality Strip -->
  <div class="mb-6">
    ${Components.sectionHeader('Seasonal Momentum Tracker', 'Month-over-prior-year solar generation momentum')}
    <div class="momentum-strip">
      ${d.seasonality.map(s => `
        <div class="momentum-item">
          <div class="momentum-label">${s.month}</div>
          <div class="momentum-val">${s.val}</div>
          <div class="momentum-trend ${s.trend === 'up' ? 'text-green' : 'text-secondary'}">${s.label}</div>
        </div>`).join('')}
    </div>
  </div>

  <!-- Charts Row 1 -->
  <div class="grid-2 mb-6">
    ${Components.chartCard({ id:'chartDemand', title:'Monthly Power Demand Trend', subtitle:'BU (Billion Units) — National consumption', height:280, source: src.label, footer: `<span class="source-chip mock">MOCK</span>` })}
    ${Components.chartCard({ id:'chartSolarGen', title:'Monthly Solar Generation Trend', subtitle:'BU — Solar generation feed-in', height:280, source: src.label })}
  </div>

  <!-- State Capacity Section -->
  <div class="grid-2-1 mb-6">
    <!-- State ranked table -->
    ${Components.tableCard({
      title: 'State-Wise Installed Solar Capacity Ranking',
      subtitle: 'Cumulative GW as of Mar 2025 (estimated)',
      source: src.label,
      body: `<table class="data-table">
        <thead><tr>
          <th>Rank</th><th>State</th><th>Installed (GW)</th><th>National Share</th><th>Capacity Bar</th>
        </tr></thead>
        <tbody>
          ${d.stateCapacity.map((s, i) => `
          <tr>
            <td>${Components.rankBadge(s.rank)}</td>
            <td class="primary">${s.state}</td>
            <td class="mono number">${s.gw.toFixed(1)}</td>
            <td>${((s.gw / 82.6) * 100).toFixed(1)}%</td>
            <td style="width:160px">${Components.progressBar(s.pct, i < 3 ? 'var(--accent-solar)' : 'var(--accent-blue)')}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    })}

    <!-- State Heatmap Panel -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Solar Density by State</div>
          <div class="card-subtitle">Relative installed base — color coded</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
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
        ${Components.sourceFooter(src.label, 'demand')}
      </div>
    </div>
  </div>

  <!-- State Horizontal Bar -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State-Wise Solar Installed Capacity</div>
          <div class="card-subtitle">Top 10 states — GW basis</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="chart-body">
        <div class="canvas-wrap" style="height:260px">
          <canvas id="chartStateBar"></canvas>
        </div>
      </div>
      <div class="chart-footer">
        <span class="chart-source">Source: ${src.label}</span>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
    </div>
  </div>
  `;

  // Draw charts after DOM is ready
  requestAnimationFrame(() => {
    // Monthly Demand
    const demand = d.monthlyDemand;
    Charts.multiLine('chartDemand', demand.labels, [
      { label: 'FY23-24', data: demand.series['FY23-24'], color: '#64748b' },
      { label: 'FY24-25', data: demand.series['FY24-25'], color: '#f59e0b', fill: true },
    ], { yLabel: 'BU' });

    // Solar Generation
    const solar = d.solarGeneration;
    Charts.area('chartSolarGen', solar.labels, [
      { label: 'FY23-24', data: solar.series['FY23-24'], color: '#64748b' },
      { label: 'FY24-25', data: solar.series['FY24-25'], color: '#3b82f6' },
    ], { yLabel: 'BU' });

    // State horizontal bar
    const states = d.stateCapacity;
    Charts.horizontalBar(
      'chartStateBar',
      states.map(s => s.state),
      states.map(s => s.gw),
      states.map((_, i) => i < 3 ? '#f59e0b' : i < 6 ? '#3b82f6' : '#6366f1'),
      { xLabel: 'Installed Capacity (GW)', label: 'GW' }
    );
  });
}

function buildStateHeatmap() {
  const states = [
    { name:'RJ', gw:21.4 }, { name:'GJ', gw:14.2 }, { name:'TN', gw:9.1 },
    { name:'KA', gw:8.4 },  { name:'AP', gw:7.6 },  { name:'MP', gw:5.8 },
    { name:'MH', gw:4.9 },  { name:'TS', gw:4.1 },  { name:'UP', gw:2.9 },
    { name:'PB', gw:1.2 },  { name:'OD', gw:0.8 },  { name:'HP', gw:0.6 },
    { name:'HR', gw:0.7 },  { name:'UK', gw:0.4 },  { name:'JH', gw:0.3 },
    { name:'CG', gw:0.9 },  { name:'BR', gw:0.2 },  { name:'WB', gw:0.4 },
  ];

  return states.map(s => {
    let cls, val;
    if (s.gw >= 10) { cls = 'heat-low'; }
    else if (s.gw >= 5) { cls = 'heat-medium'; }
    else if (s.gw >= 2) { cls = 'heat-high'; }
    else { cls = 'heat-vhigh'; }
    // Reuse the heat colors but repurpose for capacity (high capacity = green)
    const heatStyle = s.gw >= 10
      ? 'background:rgba(34,197,94,0.2);border-color:rgba(34,197,94,0.3);'
      : s.gw >= 5
      ? 'background:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.3);'
      : s.gw >= 2
      ? 'background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.3);'
      : 'background:var(--bg-elevated);border-color:var(--border-subtle);';

    return `
    <div class="heat-cell" style="${heatStyle}border:1px solid;border-radius:8px;padding:8px 4px;text-align:center">
      <div class="state-name" style="font-size:10px;font-weight:700;color:var(--text-primary)">${s.name}</div>
      <div class="state-val" style="font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--text-secondary)">${s.gw}GW</div>
    </div>`;
  }).join('');
}
