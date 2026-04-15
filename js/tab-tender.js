/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3 — Tender Flow & Tariff Discovery
   ═══════════════════════════════════════════════════════════════════════════ */

function initTenderTab() {
  const el = document.getElementById('tab-tender');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.tender;
  const src = DATA_SOURCES.tender;

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'MW Tendered (FY YTD)', value: d.kpis.mwTendered.value, unit: 'MW', delta: d.kpis.mwTendered.delta, dir: 'up', context: d.kpis.mwTendered.context, icon:'fa-file-pen', accentColor:'var(--accent-solar)' })}
    ${Components.kpiCard({ label:'MW Awarded (FY YTD)', value: d.kpis.mwAwarded.value, unit: 'MW', delta: d.kpis.mwAwarded.delta, dir: 'up', context: d.kpis.mwAwarded.context, icon:'fa-circle-check', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)' })}
    ${Components.kpiCard({ label:'Avg. Discovered Tariff', value: d.kpis.avgTariff.value, unit: '₹/kWh', delta: d.kpis.avgTariff.delta, dir: 'down', negativeGood: true, context: d.kpis.avgTariff.context, icon:'fa-tags', accentColor:'var(--accent-blue)', iconBg:'rgba(59,130,246,0.1)' })}
    ${Components.kpiCard({ label:'Tender Subscription Intensity', value: d.kpis.subscription.value, unit: 'x', delta: d.kpis.subscription.delta, dir: 'up', context: d.kpis.subscription.context, icon:'fa-users', accentColor:'var(--accent-purple)', iconBg:'rgba(168,85,247,0.1)' })}
  </div>

  <!-- Tender & Award Trends -->
  <div class="grid-2 mb-6">
    ${Components.chartCard({ id:'chartTenderFlow', title:'Tender Announcement vs Award Flow', subtitle:'Quarterly MW — tendered and awarded', height:280, source: src.label })}
    ${Components.chartCard({ id:'chartTariffTrend', title:'Tariff Discovery Trend', subtitle:'Quarterly average L1 discovered tariff (₹/kWh)', height:280, source: src.label })}
  </div>

  <!-- Tender Type Mix + Issuer Comparison -->
  <div class="grid-2 mb-6">
    <!-- Tender Type Mix Donut -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Tender Type Mix (FY YTD)</div>
          <div class="card-subtitle">% share by technology type</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center">
          <div class="canvas-wrap" style="height:180px">
            <canvas id="chartTenderMix"></canvas>
          </div>
          <div class="donut-legend">
            ${d.tenderTypeMix.labels.map((l, i) => Components.legendRow(
              ['#f59e0b','#3b82f6','#22c55e','#a855f7','#f97316','#14b8a6'][i],
              l, d.tenderTypeMix.values[i] + '%'
            )).join('')}
          </div>
        </div>
        <div style="margin-top:16px;padding:12px;background:var(--bg-elevated);border-radius:8px;border:1px solid var(--border-subtle)">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Trend Signal</div>
          <div style="font-size:12px;color:var(--text-primary)">Hybrid & storage-linked tenders rising as % of pipeline. Pure-play solar share contracting from 68% (FY22) to 44% (FY25 YTD).</div>
        </div>
        ${Components.sourceFooter(src.label, 'tender')}
      </div>
    </div>

    <!-- Issuer Comparison -->
    ${Components.chartCard({ id:'chartIssuerComp', title:'Issuer-Wise Tender Volume', subtitle:'Total MW tendered by issuing entity (FY YTD)', height:240, source: src.label })}
  </div>

  <!-- Cancelled / Reissued Tender Panel -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Cancelled & Reissued Tender Tracker</div>
          <div class="card-subtitle">Monitoring tender withdrawals, revisions, and reissuances</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          ${d.cancelledTenders.map(t => `
          <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${t.issuer}</div>
              ${buildCancelledTag(t.status)}
            </div>
            <div style="font-size:20px;font-weight:800;color:var(--text-primary);font-family:'JetBrains Mono',monospace;margin-bottom:4px">${t.mw.toLocaleString()} <span style="font-size:12px;font-weight:500;color:var(--text-secondary)">MW</span></div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">${t.reason}</div>
            <div style="font-size:10px;color:var(--text-disabled);font-family:'JetBrains Mono',monospace">${t.date}</div>
          </div>`).join('')}
        </div>
        ${Components.sourceFooter(src.label, 'tender')}
      </div>
    </div>
  </div>

  <!-- Tender Table -->
  <div class="mb-6">
    ${Components.tableCard({
      title: 'Live Tender Register',
      subtitle: 'Active, recent, and upcoming tenders — all figures illustrative',
      source: src.label,
      body: `<table class="data-table">
        <thead><tr>
          <th>Tender ID</th>
          <th>Issuer</th>
          <th>Type</th>
          <th class="number">Size (MW)</th>
          <th>Date</th>
          <th class="number">Tariff (₹/kWh)</th>
          <th class="number">Subscription</th>
          <th>Status</th>
        </tr></thead>
        <tbody>
          ${d.tenderTable.map(t => `
          <tr>
            <td class="mono" style="color:var(--accent-blue)">${t.id}</td>
            <td class="primary">${t.issuer}</td>
            <td>${buildTypeTag(t.type)}</td>
            <td class="number mono">${t.mw.toLocaleString()}</td>
            <td style="color:var(--text-muted)">${t.date}</td>
            <td class="number mono">${t.tariff ? '₹' + t.tariff.toFixed(2) : '—'}</td>
            <td class="number mono">${t.sub ? t.sub.toFixed(1) + 'x' : '—'}</td>
            <td>${buildTenderStatusTag(t.status)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    })}
  </div>
  `;

  requestAnimationFrame(() => {
    // Tender Flow
    const tf = d.tendersOverTime;
    Charts.bar('chartTenderFlow', tf.labels, [
      { label:'MW Tendered', data: tf.tendered, color: '#3b82f6' },
      { label:'MW Awarded',  data: tf.awarded,  color: '#22c55e' },
    ], { yLabel: 'MW' });

    // Tariff Trend
    const tt = d.tariffTrend;
    Charts.multiLine('chartTariffTrend', tt.labels, [
      { label:'Avg L1 Tariff', data: tt.tariff, color: '#f59e0b', fill: true }
    ], { yLabel: '₹/kWh' });

    // Tender Mix Donut
    Charts.donut('chartTenderMix',
      d.tenderTypeMix.labels,
      d.tenderTypeMix.values,
      ['#f59e0b','#3b82f6','#22c55e','#a855f7','#f97316','#14b8a6']
    );

    // Issuer Comparison
    const ic = d.issuerComparison;
    Charts.horizontalBar('chartIssuerComp',
      ic.labels, ic.mw,
      ['#f59e0b','#3b82f6','#22c55e','#a855f7','#f97316','#14b8a6','#6366f1'],
      { xLabel: 'MW', label: 'MW Tendered' }
    );
  });
}

function buildTenderStatusTag(status) {
  const map = { 'Open':'info', 'Awarded':'positive', 'Upcoming':'neutral', 'Evaluation':'warning', 'Cancelled':'negative' };
  return Components.tag(status, map[status] || 'neutral');
}

function buildTypeTag(type) {
  const map = { 'Solar':'info', 'Hybrid':'warning', 'FDRE':'positive', 'BESS+S':'purple', 'RTC':'teal' };
  return `<span class="tag tag-${map[type] || 'neutral'}">${type}</span>`;
}

function buildCancelledTag(status) {
  const map = { 'Reissued':'info', 'Revised & Open':'warning', 'Cancelled':'negative', 'Deferred':'neutral' };
  return Components.tag(status, map[status] || 'neutral');
}
