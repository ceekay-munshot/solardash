/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2 — Manufacturing & Domestic Supply Chain
   ═══════════════════════════════════════════════════════════════════════════ */

function initManufacturingTab() {
  const el = document.getElementById('tab-manufacturing');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.manufacturing;
  const src = DATA_SOURCES.manufacturing;

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'ALMM Module Capacity (Listed)', value: d.kpis.almmModule.value, unit: d.kpis.almmModule.unit, delta: d.kpis.almmModule.delta, dir: 'up', context: d.kpis.almmModule.context, icon:'fa-microchip', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)' })}
    ${Components.kpiCard({ label:'ALMM Cell Capacity (Listed)', value: d.kpis.almmCell.value, unit: d.kpis.almmCell.unit, delta: d.kpis.almmCell.delta, dir: 'up', context: d.kpis.almmCell.context, icon:'fa-memory', accentColor:'var(--accent-blue)', iconBg:'rgba(59,130,246,0.1)' })}
    ${Components.kpiCard({ label:'PLI-Linked Capacity', value: d.kpis.pliCapacity.value, unit: d.kpis.pliCapacity.unit, delta: d.kpis.pliCapacity.delta, dir: 'up', context: d.kpis.pliCapacity.context, icon:'fa-coins', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)' })}
    ${Components.kpiCard({ label:'Import Dependence (Cell+Module)', value: d.kpis.importDep.value, unit: d.kpis.importDep.unit, delta: d.kpis.importDep.delta, dir: 'down', negativeGood: true, context: d.kpis.importDep.context, icon:'fa-ship', accentColor:'var(--accent-orange)', iconBg:'rgba(249,115,22,0.1)' })}
  </div>

  <!-- Capacity Mix + Import Trend -->
  <div class="grid-2 mb-6">
    <!-- Capacity Split Donut -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Domestic Capacity Stack</div>
          <div class="card-subtitle">Module / Cell / Wafer / Ingot breakdown (GW)</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center">
          <div class="canvas-wrap" style="height:200px">
            <canvas id="chartCapMix"></canvas>
          </div>
          <div class="donut-legend">
            ${Components.legendRow('#f59e0b', 'Module Manufacturing', '62.4 GW')}
            ${Components.legendRow('#3b82f6', 'Cell Manufacturing', '24.8 GW')}
            ${Components.legendRow('#22c55e', 'Wafer Manufacturing', '9.2 GW')}
            ${Components.legendRow('#a855f7', 'Ingot Manufacturing', '6.0 GW')}
          </div>
        </div>
        <div style="margin-top:16px">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Backward Integration Gap</div>
          ${buildIntegrationBars()}
        </div>
        ${Components.sourceFooter(src.label, 'manufacturing')}
      </div>
    </div>

    <!-- Domestic vs Import -->
    ${Components.chartCard({ id:'chartImportDomestic', title:'Domestic vs Import Supply Volume', subtitle:'GW equivalent — module/cell supply to India', height:260, source: src.label })}
  </div>

  <!-- Import-Export Trend -->
  <div class="mb-6">
    ${Components.chartCard({ id:'chartImportTrend', title:'Import vs Domestic Supply Trend', subtitle:'Half-yearly GW equivalent — market share evolution', height:240, source: src.label, extraClass:'w-full' })}
  </div>

  <!-- Manufacturer Ranking Table -->
  <div class="mb-6">
    ${Components.tableCard({
      title: 'Manufacturer Ranking — Capacity & Backward Integration',
      subtitle: 'ALMM-registered manufacturers sorted by module capacity',
      source: src.label,
      body: `<table class="data-table">
        <thead><tr>
          <th>Rank</th>
          <th>Manufacturer</th>
          <th class="number">Module (GW)</th>
          <th class="number">Cell (GW)</th>
          <th class="number">Wafer (GW)</th>
          <th class="number">Ingot (GW)</th>
          <th>Integration Level</th>
          <th>PLI</th>
          <th>Listed</th>
        </tr></thead>
        <tbody>
          ${d.manufacturers.map(m => `
          <tr>
            <td>${Components.rankBadge(m.rank)}</td>
            <td class="primary">${m.name}</td>
            <td class="number mono">${m.module.toFixed(1)}</td>
            <td class="number mono">${m.cell > 0 ? m.cell.toFixed(1) : '—'}</td>
            <td class="number mono">${m.wafer > 0 ? m.wafer.toFixed(1) : '—'}</td>
            <td class="number mono">${m.ingot > 0 ? m.ingot.toFixed(1) : '—'}</td>
            <td>${buildIntegrationTag(m.backward)}</td>
            <td>${m.pli ? Components.tag('PLI', 'positive') : Components.tag('No', 'neutral')}</td>
            <td>${m.listed ? Components.tag('Listed', 'info') : Components.tag('Private', 'neutral')}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    })}
  </div>

  <!-- Expansion Tracker -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Announced Capacity Expansion Tracker</div>
          <div class="card-subtitle">Planned additions — subject to execution risk</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${d.expansions.map(e => `
          <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${e.company}</div>
              ${buildExpansionStatusTag(e.status)}
            </div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px"><strong>${e.capacity}</strong> ${e.type} capacity</div>
            <div style="font-size:11px;color:var(--text-muted)">Target: ${e.target}</div>
          </div>`).join('')}
        </div>
        ${Components.sourceFooter(src.label, 'manufacturing')}
      </div>
    </div>
  </div>
  `;

  requestAnimationFrame(() => {
    // Capacity Mix Donut
    Charts.donut('chartCapMix',
      ['Module','Cell','Wafer','Ingot'],
      [d.capacityMix.module, d.capacityMix.cell, d.capacityMix.wafer, d.capacityMix.ingot],
      ['#f59e0b','#3b82f6','#22c55e','#a855f7']
    );

    // Import vs Domestic
    const it = d.importTrend;
    Charts.stackedBar('chartImportDomestic', it.labels, [
      { label: 'Domestic Supply', data: it.domestic, color: '#22c55e' },
      { label: 'Imports',         data: it.imports,  color: '#ef4444' },
    ], { yLabel: 'GW equiv.' });

    // Import Trend Line
    Charts.multiLine('chartImportTrend', it.labels, [
      { label: 'Imports',         data: it.imports,  color: '#ef4444' },
      { label: 'Domestic Supply', data: it.domestic, color: '#22c55e', fill: true },
    ], { yLabel: 'GW equiv.' });
  });
}

function buildIntegrationBars() {
  const items = [
    { label:'Module → Cell', pct: Math.round((24.8/62.4)*100), color:'#3b82f6' },
    { label:'Cell → Wafer',  pct: Math.round((9.2/24.8)*100),  color:'#22c55e' },
    { label:'Wafer → Ingot', pct: Math.round((6.0/9.2)*100),   color:'#a855f7' },
  ];
  return items.map(i => `
  <div style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
      <span style="font-size:11px;color:var(--text-secondary)">${i.label}</span>
      <span style="font-size:11px;font-weight:600;font-family:'JetBrains Mono',monospace;color:var(--text-primary)">${i.pct}%</span>
    </div>
    ${Components.progressBar(i.pct, i.color)}
  </div>`).join('');
}

function buildIntegrationTag(level) {
  if (level.includes('Full')) return `<span class="tag tag-positive">${level}</span>`;
  if (level.includes('Cell')) return `<span class="tag tag-info">${level}</span>`;
  return `<span class="tag tag-neutral">${level}</span>`;
}

function buildExpansionStatusTag(status) {
  const map = { 'on-track':'positive', 'delayed':'warning', 'planned':'neutral', 'complete':'positive' };
  return Components.tag(status.charAt(0).toUpperCase() + status.slice(1), map[status] || 'neutral');
}
