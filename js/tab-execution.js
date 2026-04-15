/* ═══════════════════════════════════════════════════════════════════════════
   TAB 4 — Project Execution & Commissioning Tracker
   ═══════════════════════════════════════════════════════════════════════════ */

function initExecutionTab() {
  const el = document.getElementById('tab-execution');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.execution;
  const src = DATA_SOURCES.execution;

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'Commissioned Capacity (FY YTD)', value: d.kpis.commissioned.value, unit: 'MW', delta: d.kpis.commissioned.delta, dir: 'up', context: d.kpis.commissioned.context, icon:'fa-plug-circle-check', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)' })}
    ${Components.kpiCard({ label:'Under-Construction Pipeline', value: d.kpis.underConstruction.value, unit: 'MW', delta: d.kpis.underConstruction.delta, dir: 'up', context: d.kpis.underConstruction.context, icon:'fa-hard-hat', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)' })}
    ${Components.kpiCard({ label:'Delayed Projects', value: d.kpis.delayed.value, unit: 'MW', delta: d.kpis.delayed.delta, dir: 'down', negativeGood: true, context: d.kpis.delayed.context, icon:'fa-clock', accentColor:'var(--accent-red)', iconBg:'rgba(239,68,68,0.1)' })}
    ${Components.kpiCard({ label:'Avg. Award-to-COD Lag', value: d.kpis.avgLag.value, unit: 'mo', delta: d.kpis.avgLag.delta, dir: 'down', negativeGood: true, context: d.kpis.avgLag.context, icon:'fa-calendar-days', accentColor:'var(--accent-teal)', iconBg:'rgba(20,184,166,0.1)' })}
  </div>

  <!-- Commission Trend + Pipeline -->
  <div class="grid-2 mb-6">
    ${Components.chartCard({ id:'chartCommission', title:'Commissioning Trend', subtitle:'Quarterly MW additions — new commissioned capacity', height:280, source: src.label })}
    ${Components.chartCard({ id:'chartPipeline', title:'Under-Construction Pipeline', subtitle:'Quarterly MW under active construction', height:280, source: src.label })}
  </div>

  <!-- State Commissioning + Developer Execution -->
  <div class="grid-2 mb-6">
    <!-- State Panel -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State-Wise Commissioning (FY YTD)</div>
          <div class="card-subtitle">MW newly commissioned by state</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div class="canvas-wrap" style="height:220px">
          <canvas id="chartStateCommission"></canvas>
        </div>
        <div style="margin-top:16px">
          ${d.stateCommission.map(s =>
            Components.stateBar(s.state, s.mw.toLocaleString(), (s.mw / d.stateCommission[0].mw * 100), s.color, 'MW')
          ).join('')}
        </div>
        ${Components.sourceFooter(src.label, 'execution')}
      </div>
    </div>

    <!-- Developer Execution Ranking -->
    ${Components.tableCard({
      title: 'Developer Execution Performance Ranking',
      subtitle: 'On-time commissioning rate and lag analysis',
      source: src.label,
      body: `<table class="data-table">
        <thead><tr>
          <th>Rank</th><th>Developer</th>
          <th class="number">Total (MW)</th>
          <th class="number">Commissioned</th>
          <th class="number">On-Time %</th>
          <th class="number">Avg Lag (mo)</th>
        </tr></thead>
        <tbody>
          ${d.developerExec.map(dev => `
          <tr>
            <td>${Components.rankBadge(dev.rank)}</td>
            <td class="primary">${dev.dev}</td>
            <td class="number mono">${dev.total.toLocaleString()}</td>
            <td class="number mono">${dev.commissioned.toLocaleString()}</td>
            <td class="number">${buildOnTimeBar(dev.onTime)}</td>
            <td class="number mono" style="color:${dev.avgLag > 16 ? 'var(--status-negative)' : dev.avgLag > 13 ? 'var(--status-warning)' : 'var(--status-positive)'}">${dev.avgLag}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    })}
  </div>

  <!-- Delay Tracker + COD Timeline -->
  <div class="grid-2 mb-6">
    <!-- Delay Tracker -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Delay Reason Analysis</div>
          <div class="card-subtitle">MW delayed by root cause category</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        ${d.delayReasons.map(dr => `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="delay-tag ${dr.type}">${dr.reason}</span>
            </div>
            <div style="font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--text-primary)">${dr.mw.toLocaleString()} MW</div>
          </div>
          ${Components.progressBar(dr.pct, dr.type === 'delay-land' ? '#ef4444' : dr.type === 'delay-grid' ? '#f59e0b' : dr.type === 'delay-finance' ? '#3b82f6' : dr.type === 'delay-approval' ? '#a855f7' : '#f97316')}
          <div style="font-size:10px;color:var(--text-muted);margin-top:3px">${dr.pct}% of delayed portfolio</div>
        </div>`).join('')}
        ${Components.sourceFooter(src.label, 'execution')}
      </div>
    </div>

    <!-- Upcoming COD Timeline -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Upcoming COD Timeline</div>
          <div class="card-subtitle">Projects expected to commission in next 6 months</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        ${d.upcomingCOD.map(c =>
          Components.codItem(c.date, c.project, `${c.dev} · ${c.mw} MW`)
        ).join('')}
        ${Components.sourceFooter(src.label, 'execution')}
      </div>
    </div>
  </div>

  <!-- Project Execution Table -->
  <div class="mb-6">
    ${Components.tableCard({
      title: 'Project Execution Detail Table',
      subtitle: 'Key projects under monitoring — status, lag, and issue flags',
      source: src.label,
      body: `<table class="data-table">
        <thead><tr>
          <th>Project</th><th>State</th><th>Developer</th>
          <th class="number">MW</th><th>Status</th>
          <th>Award Date</th><th>Plan COD</th>
          <th class="number">Lag (mo)</th><th>Issue</th>
        </tr></thead>
        <tbody>
          ${d.projectTable.map(p => `
          <tr>
            <td class="primary">${p.project}</td>
            <td>${p.state}</td>
            <td>${p.dev}</td>
            <td class="number mono">${p.mw.toLocaleString()}</td>
            <td>${buildExecStatusTag(p.status)}</td>
            <td class="mono" style="color:var(--text-muted)">${p.awardDate}</td>
            <td class="mono" style="color:var(--text-muted)">${p.planCOD}</td>
            <td class="number mono" style="color:${p.lag > 30 ? 'var(--status-negative)' : p.lag > 24 ? 'var(--status-warning)' : 'var(--status-positive)'}">${p.lag}</td>
            <td>${p.issue === 'None' ? Components.tag('None','positive') : `<span class="tag tag-warning">${p.issue}</span>`}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    })}
  </div>
  `;

  requestAnimationFrame(() => {
    const ct = d.commissioningTrend;
    // Commission trend
    Charts.bar('chartCommission', ct.labels, [
      { label:'Commissioned MW', data: ct.commissioned, color: '#22c55e' }
    ], { yLabel: 'MW' });

    // Pipeline trend
    Charts.multiLine('chartPipeline', ct.labels, [
      { label:'Under-Construction MW', data: ct.pipeline, color: '#f59e0b', fill: true }
    ], { yLabel: 'MW' });

    // State donut
    Charts.donut('chartStateCommission',
      d.stateCommission.map(s => s.state),
      d.stateCommission.map(s => s.mw),
      d.stateCommission.map(s => s.color)
    );
  });
}

function buildOnTimeBar(pct) {
  const color = pct >= 85 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#ef4444';
  return `<div style="display:flex;align-items:center;gap:6px">
    <div style="flex:1;background:var(--bg-elevated);border-radius:999px;height:6px;overflow:hidden">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:999px"></div>
    </div>
    <span style="font-size:11px;font-weight:600;color:${color};min-width:30px">${pct}%</span>
  </div>`;
}

function buildExecStatusTag(status) {
  const map = { 'Commissioned':'positive', 'Under Construction':'info', 'Partial COD':'warning', 'Delayed':'negative' };
  return Components.tag(status, map[status] || 'neutral');
}
