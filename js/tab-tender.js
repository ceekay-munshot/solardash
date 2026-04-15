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
    <!-- Tender Flow Chart — REAL DATA -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Tender Announcement vs Award Flow</div>
          <div class="card-subtitle">
            Quarterly MW by issue date (Tendered) and result/LoA date (Awarded) ·
            ${TENDER_FLOW_META.scope.split(' from ')[0]}
          </div>
        </div>
        <span class="source-chip manual" title="SECI: seci.co.in/tenders + results | SJVN: sjvn.nic.in tender page | GUVNL: official result | JMK monthly RE update (citing official results)">
          <i class="fa-solid fa-file-arrow-down"></i> REAL · Official
        </span>
      </div>
      <div class="card-body">
        <div class="canvas-wrap" style="height:240px"><canvas id="chartTenderFlow"></canvas></div>
        <div style="margin-top:10px;padding:10px 12px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:7px;font-size:10px;color:var(--text-secondary);line-height:1.7">
          <strong style="color:var(--accent-blue)">Methodology:</strong>
          MW Tendered = tender publication date quarter ·
          MW Awarded = result/LoA announcement date quarter ·
          Tenders with no confirmed result excluded from Awarded ·
          ${TENDER_FLOW_META.exclusions} excluded ·
          Data cutoff: ${TENDER_FLOW_META.cutoffDate}
        </div>
        <div style="margin-top:8px;padding:6px 0;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · Official</span>
          <span class="chart-source">
            SECI: <a href="https://seci.co.in/tenders/results" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">seci.co.in/tenders/results</a>
            · SJVN: <a href="https://sjvn.nic.in/tender-detail/8545/97" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">sjvn.nic.in</a>
            · GUVNL · RUMSL · JMK monthly RE updates (citing official results)
          </span>
        </div>
      </div>
    </div>
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

  <!-- Tender Table — REAL DATA (SECI official tender pages + GUVNL official results) -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Live Tender Register</div>
          <div class="card-subtitle">
            SECI official tender pages · GUVNL official results · Tariff disclosed only when officially confirmed ·
            Verified: ${TENDER_META.fetchedOn}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="source-chip manual" title="SECI: seci.co.in/tenders + seci.co.in/tenders/results | GUVNL: official result announcement">
            <i class="fa-solid fa-file-arrow-down"></i> REAL · SECI / GUVNL
          </span>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>Tender ID</th>
            <th>Issuer</th>
            <th>Type</th>
            <th class="number">Size (MW)</th>
            <th>Published</th>
            <th class="number">Tariff (₹/kWh)</th>
            <th class="number">Subscription</th>
            <th>Status</th>
          </tr></thead>
          <tbody>
            ${TENDER_ROWS.map(t => {
              const sCfg   = getTenderStatusConfig(t.status);
              const tyCfg  = getTenderTypeConfig(t.type);
              const tariff = t.tariffMin !== null
                ? (t.tariffMax !== null && t.tariffMax !== t.tariffMin
                    ? '₹' + t.tariffMin.toFixed(2) + '–' + t.tariffMax.toFixed(2)
                    : '₹' + t.tariffMin.toFixed(2))
                : '—';
              return `<tr title="${t.sourceNote || ''}">
                <td>
                  <a href="${t.sourceUrl}" target="_blank" rel="noopener"
                     style="color:var(--accent-blue);font-family:'JetBrains Mono',monospace;font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:4px">
                    ${t.id}
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:8px;opacity:0.6"></i>
                  </a>
                  ${t.scheme ? `<div style="font-size:10px;color:var(--text-disabled);margin-top:1px">${t.scheme}</div>` : ''}
                </td>
                <td class="primary">${t.issuer}</td>
                <td><span class="tag tag-${tyCfg.type}">${tyCfg.label}</span></td>
                <td class="number mono">
                  ${t.mwAwarded
                    ? `<span title="${t.mwAwarded} MW awarded of ${t.mw} MW tendered">${t.mwAwarded.toLocaleString()} <span style="color:var(--text-disabled);font-size:10px">/ ${t.mw.toLocaleString()}</span></span>`
                    : t.mw.toLocaleString()}
                </td>
                <td style="color:var(--text-muted);font-size:11px">${t.publishedOn}</td>
                <td class="number mono">
                  ${tariff !== '—'
                    ? `<span title="${t.tariffNote || ''}" style="cursor:default">${tariff}</span>`
                    : `<span style="color:var(--text-disabled)">—</span>`}
                </td>
                <td class="number mono">
                  <span style="color:var(--text-disabled)">—</span>
                </td>
                <td><span class="tag tag-${sCfg.type}">${sCfg.label}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:10px 20px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · SECI / GUVNL</span>
        <span class="chart-source">
          Sources:
          <a href="${TENDER_META.seciLiveUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">SECI Live Tenders</a>
          ·
          <a href="${TENDER_META.seciResultUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">SECI Results</a>
          ·
          <a href="https://www.guvnl.com/" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">GUVNL</a>
          · Verified: ${TENDER_META.fetchedOn}
          · Tariff shown only when officially confirmed in result announcement
          · Subscription not published in structured form by SECI
        </span>
      </div>
    </div>
  </div>
  `;

  requestAnimationFrame(() => {
    // Tender Flow — REAL DATA from TENDER_FLOW_DATA
    Charts.bar('chartTenderFlow', TENDER_FLOW_DATA.labels, [
      { label: 'MW Tendered (issue date)', data: TENDER_FLOW_DATA.tendered, color: '#3b82f6' },
      { label: 'MW Awarded (result date)', data: TENDER_FLOW_DATA.awarded,  color: '#22c55e' },
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
