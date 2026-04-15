/* ═══════════════════════════════════════════════════════════════════════════
   TAB 7 — Grid, DISCOM & Execution Risk Monitor
   ═══════════════════════════════════════════════════════════════════════════ */

function initGridTab() {
  const el = document.getElementById('tab-grid');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.grid;
  const src = DATA_SOURCES.grid;

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'DISCOM RE Dues Outstanding', value: d.kpis.discomDues.value, unit: 'Cr', delta: d.kpis.discomDues.delta, dir: 'down', negativeGood: true, context: d.kpis.discomDues.context, icon:'fa-money-bill-wave', accentColor:'var(--accent-red)', iconBg:'rgba(239,68,68,0.1)' })}
    ${Components.kpiCard({ label:'Transmission Readiness', value: d.kpis.txReadiness.value, unit: '%', delta: d.kpis.txReadiness.delta, dir: 'up', context: d.kpis.txReadiness.context, icon:'fa-tower-broadcast', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)' })}
    ${Components.kpiCard({ label:'System Curtailment Rate', value: d.kpis.curtailment.value, unit: '%', delta: d.kpis.curtailment.delta, dir: 'down', negativeGood: true, context: d.kpis.curtailment.context, icon:'fa-ban', accentColor:'var(--accent-orange)', iconBg:'rgba(249,115,22,0.1)' })}
    ${Components.kpiCard({ label:'State Payment Risk Index', value: d.kpis.paymentRisk.value, unit: '', delta: d.kpis.paymentRisk.delta, dir: 'flat', context: d.kpis.paymentRisk.context, icon:'fa-shield-halved', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)' })}
  </div>

  <!-- State Risk Heatmap + DISCOM Dues Trend -->
  <div class="grid-3-2 mb-6">
    <!-- State Risk Heatmap -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State Risk Heatmap</div>
          <div class="card-subtitle">Composite payment + grid + curtailment risk score</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
          ${d.stateRisk.map(s => buildRiskCell(s)).join('')}
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px">
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(34,197,94,0.25)"></div> Low (&lt;40)</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(245,158,11,0.25)"></div> Medium (40–60)</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(239,68,68,0.2)"></div> High (60–75)</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(239,68,68,0.35)"></div> V.High (&gt;75)</div>
        </div>
        ${Components.sourceFooter(src.label, 'grid')}
      </div>
    </div>

    <!-- DISCOM Dues Trend -->
    ${Components.chartCard({ id:'chartDiscomDues', title:'DISCOM RE Dues Outstanding Trend', subtitle:'₹ Crore — improving but still elevated', height:280, source: src.label })}
  </div>

  <!-- Transmission Bottlenecks + Curtailment Risk -->
  <div class="grid-2 mb-6">
    <!-- Transmission Readiness -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Transmission Bottleneck Tracker</div>
          <div class="card-subtitle">Key green corridor / evacuation status</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        ${d.txBottlenecks.map(t => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
          <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:4px;background:${t.status === 'green' ? '#22c55e' : t.status === 'amber' ? '#f59e0b' : '#ef4444'}"></div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${t.region}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Capacity: ${t.capacity} · ${t.issues}</div>
          </div>
          ${Components.tag(t.status === 'green' ? 'Clear' : t.status === 'amber' ? 'At Risk' : 'Bottleneck', t.status === 'green' ? 'positive' : t.status === 'amber' ? 'warning' : 'negative')}
        </div>`).join('')}
        ${Components.sourceFooter(src.label, 'grid')}
      </div>
    </div>

    <!-- Curtailment Risk -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Solar Curtailment Risk by State</div>
          <div class="card-subtitle">Estimated curtailment % — Q3 FY24-25</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div class="canvas-wrap" style="height:220px">
          <canvas id="chartCurtailment"></canvas>
        </div>
        <div style="margin-top:16px">
          ${d.curtailmentRisk.map(c => `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:600;color:var(--text-secondary);min-width:80px">${c.state}</span>
            <div style="flex:1;background:var(--bg-elevated);border-radius:999px;height:7px;overflow:hidden">
              <div style="width:${(c.pct/10)*100}%;height:100%;border-radius:999px;background:${c.risk === 'high' ? '#ef4444' : c.risk === 'medium' ? '#f59e0b' : '#22c55e'}"></div>
            </div>
            <span style="font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;min-width:36px;color:${c.risk === 'high' ? 'var(--status-negative)' : c.risk === 'medium' ? 'var(--status-warning)' : 'var(--status-positive)'}">${c.pct}%</span>
            ${Components.tag(c.risk.charAt(0).toUpperCase()+c.risk.slice(1), c.risk === 'high' ? 'negative' : c.risk === 'medium' ? 'warning' : 'positive')}
          </div>`).join('')}
        </div>
        ${Components.sourceFooter(src.label, 'grid')}
      </div>
    </div>
  </div>

  <!-- State Risk Table -->
  <div class="mb-6">
    ${Components.tableCard({
      title: 'State-Wise Risk Comparison Table',
      subtitle: 'Payment risk, DISCOM dues, curtailment, and transmission readiness',
      source: src.label,
      body: `<table class="data-table">
        <thead><tr>
          <th>State</th>
          <th class="number">Risk Score</th>
          <th>Risk Level</th>
          <th class="number">DISCOM Dues (₹Cr)</th>
          <th class="number">Curtailment %</th>
          <th>TX Readiness</th>
        </tr></thead>
        <tbody>
          ${d.stateRisk.sort((a,b)=>b.score-a.score).map(s => `
          <tr>
            <td class="primary">${s.state}</td>
            <td class="number mono" style="color:${s.risk === 'vhigh' || s.risk === 'high' ? 'var(--status-negative)' : s.risk === 'medium' ? 'var(--status-warning)' : 'var(--status-positive)'};font-weight:700">${s.score}</td>
            <td>${buildRiskLevelTag(s.risk)}</td>
            <td class="number mono" style="color:${s.discomDues > 12000 ? 'var(--status-negative)' : s.discomDues > 8000 ? 'var(--status-warning)' : 'var(--status-positive)'}">₹${s.discomDues.toLocaleString()}</td>
            <td class="number mono" style="color:${s.curtail > 6 ? 'var(--status-negative)' : s.curtail > 4 ? 'var(--status-warning)' : 'var(--status-positive)'}">${s.curtail}%</td>
            <td>${buildTXTag(s.txReady)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    })}
  </div>

  <!-- Risk Flags + Watchlist -->
  <div class="grid-2 mb-6">
    <!-- Risk Flags -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Risk Flags</div>
          <div class="card-subtitle">Active risk conditions requiring investor attention</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        ${d.riskFlags.map(f =>
          Components.riskFlag(f.level, f.icon, f.title, f.detail)
        ).join('')}
        ${Components.sourceFooter(src.label, 'grid')}
      </div>
    </div>

    <!-- Watchlist -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State Watchlist & Alerts</div>
          <div class="card-subtitle">Active monitoring priorities</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        ${d.watchlist.map(w => `
        <div style="padding:12px;margin-bottom:8px;border-radius:10px;background:var(--bg-elevated);border:1px solid ${w.severity === 'critical' ? 'rgba(239,68,68,0.3)' : w.severity === 'high' ? 'rgba(245,158,11,0.25)' : 'var(--border-subtle)'}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:13px;font-weight:700;color:var(--text-primary)">${w.state}</span>
            ${Components.tag(w.severity.charAt(0).toUpperCase()+w.severity.slice(1), w.severity === 'critical' ? 'negative' : w.severity === 'high' ? 'warning' : 'neutral')}
          </div>
          <div style="font-size:11px;color:var(--text-secondary)">${w.alert}</div>
        </div>`).join('')}
        <div style="margin-top:12px;padding:12px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.2);border-radius:8px;font-size:11px;color:var(--text-secondary)">
          <strong style="color:var(--accent-blue)">Data Note:</strong> Watchlist is based on PRAAPTI portal dues, CERC data, and RBI state fiscal reports (illustrative mock data in this build).
        </div>
        ${Components.sourceFooter(src.label, 'grid')}
      </div>
    </div>
  </div>
  `;

  requestAnimationFrame(() => {
    // DISCOM dues trend
    const dd = d.discomDuesTrend;
    Charts.area('chartDiscomDues', dd.labels, [
      { label:'DISCOM RE Dues (₹ Cr)', data: dd.dues, color: '#ef4444' }
    ], { yLabel: '₹ Crore' });

    // Curtailment
    Charts.horizontalBar('chartCurtailment',
      d.curtailmentRisk.map(c => c.state),
      d.curtailmentRisk.map(c => c.pct),
      d.curtailmentRisk.map(c => c.risk === 'high' ? '#ef4444' : c.risk === 'medium' ? '#f59e0b' : '#22c55e'),
      { xLabel: 'Curtailment %', label: 'Curtailment %' }
    );
  });
}

function buildRiskCell(s) {
  const bg = s.risk === 'vhigh' ? 'rgba(239,68,68,0.25)' : s.risk === 'high' ? 'rgba(239,68,68,0.15)' : s.risk === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)';
  const bc = s.risk === 'vhigh' ? 'rgba(239,68,68,0.4)' : s.risk === 'high' ? 'rgba(239,68,68,0.3)' : s.risk === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)';
  const tc = s.risk === 'vhigh' || s.risk === 'high' ? 'var(--status-negative)' : s.risk === 'medium' ? 'var(--status-warning)' : 'var(--status-positive)';
  return `
  <div style="background:${bg};border:1px solid ${bc};border-radius:8px;padding:10px 8px;text-align:center">
    <div style="font-size:10px;font-weight:700;color:var(--text-primary)">${s.state}</div>
    <div style="font-size:14px;font-weight:800;font-family:'JetBrains Mono',monospace;color:${tc}">${s.score}</div>
    <div style="font-size:9px;color:var(--text-muted);margin-top:1px">${s.risk.toUpperCase()}</div>
  </div>`;
}

function buildRiskLevelTag(risk) {
  const map = { 'vhigh':'negative', 'high':'negative', 'medium':'warning', 'low':'positive' };
  const labels = { 'vhigh':'Very High', 'high':'High', 'medium':'Medium', 'low':'Low' };
  return Components.tag(labels[risk] || risk, map[risk] || 'neutral');
}

function buildTXTag(status) {
  const map = { 'Yes':'positive', 'Partial':'warning', 'No':'negative' };
  return Components.tag(status, map[status] || 'neutral');
}
