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
    <!-- Tender Type Mix Donut — REAL DATA (FY26 confirmed tender notices) -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Tender Type Mix (${TYPE_MIX_META.fy})</div>
          <div class="card-subtitle">
            % share of MW tendered by technology · ${TYPE_MIX_META.period} ·
            ${TYPE_MIX_META.totalMW.toLocaleString()} MW total · ${TYPE_MIX_META.recordCount} tenders tracked
          </div>
        </div>
        <span class="source-chip manual"
              title="SECI: seci.co.in/tenders + results | SJVN: sjvn.nic.in | GUVNL: official result; JMK May 2025 RE Update">
          <i class="fa-solid fa-file-arrow-down"></i> REAL · Official
        </span>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center">
          <div class="canvas-wrap" style="height:180px">
            <canvas id="chartTenderMix"></canvas>
          </div>
          <div class="donut-legend">
            ${TYPE_MIX_DATA.categories.map(c => Components.legendRow(
              c.color,
              c.label,
              c.mw > 0 ? c.pct + '% (' + (c.mw/1000).toFixed(1) + ' GW)' : '0% — none in FY26'
            )).join('')}
          </div>
        </div>
        <div style="margin-top:16px;padding:12px;background:var(--bg-elevated);border-radius:8px;border:1px solid var(--border-subtle)">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">FY26 Signal</div>
          <div style="font-size:12px;color:var(--text-primary)">
            Storage-linked tenders (BESS + Solar ${TYPE_MIX_DATA.categories.find(c=>c.label==='BESS + Solar').pct}% + FDRE ${TYPE_MIX_DATA.categories.find(c=>c.label==='FDRE').pct}%) dominate at ${Math.round(TYPE_MIX_DATA.categories.filter(c=>['BESS + Solar','FDRE'].includes(c.label)).reduce((s,c)=>s+c.pct,0))}% of FY26 MW.
            Pure-play solar fell to ${TYPE_MIX_DATA.categories.find(c=>c.label==='Solar (Utility)').pct}%.
            Hybrid tenders: 0 MW in FY26 — procurement shifted toward FDRE and BESS+Solar structures.
          </div>
        </div>
        <div style="margin-top:8px;padding:6px 0;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · Official</span>
          <span class="chart-source">
            Sources: <a href="https://seci.co.in/tenders/results" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">SECI tenders/results</a>
            · <a href="https://sjvn.nic.in/" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">SJVN</a>
            · GUVNL · ${TYPE_MIX_META.period} · Tender publication date used for all classification
          </span>
        </div>
      </div>
    </div>

    <!-- Issuer Comparison — REAL DATA from ISSUER_VOLUME_DATA -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Issuer-Wise Tender Volume (${ISSUER_VOLUME_META.fy})</div>
          <div class="card-subtitle">
            Total MW tendered by issuing entity ·
            ${ISSUER_VOLUME_META.period} ·
            ${ISSUER_VOLUME_META.totalMW.toLocaleString()} MW tracked
          </div>
        </div>
        <span class="source-chip manual"
              title="Derived from same 10 tender records as Type Mix chart. Same scope, period, date field.">
          <i class="fa-solid fa-file-arrow-down"></i> REAL · Official
        </span>
      </div>
      <div class="card-body">
        <div class="canvas-wrap" style="height:240px">
          <canvas id="chartIssuerComp"></canvas>
        </div>
        <div style="margin-top:12px;padding:10px 12px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:7px;font-size:10px;color:var(--text-secondary);line-height:1.7">
          <strong style="color:var(--accent-blue)">Coverage:</strong>
          Issuers searched: SECI, NTPC/REL, NHPC, SJVN, GUVNL, RUMSL, MSEDCL, TANTRANSCO ·
          Not found in FY26 scope (≥100 MW BOO/TBCB generation-capacity selection):
          ${ISSUER_VOLUME_META.notFound}
        </div>
        <div style="margin-top:8px;padding:6px 0;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · Official</span>
          <span class="chart-source">
            Aggregated from SECI, GUVNL, SJVN tender notices (same records as Type Mix) ·
            ${ISSUER_VOLUME_META.period} · tender publication date
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancelled / Reissued Tender Panel — REAL DATA (SECI official notices) -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Cancelled & Reissued Tender Tracker</div>
          <div class="card-subtitle">
            Official SECI tender lifecycle notices · Reason shown only when explicitly stated in the cancellation document ·
            Verified: ${CANCELLED_TENDER_META.cutoffDate}
          </div>
        </div>
        <span class="source-chip manual" title="SECI official notices and tender documents. No inference from news.">
          <i class="fa-solid fa-file-arrow-down"></i> REAL · SECI
        </span>
      </div>
      <div class="card-body">
        ${CANCELLED_TENDER_DATA.length === 0 ? `
        <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">
          No explicitly documented tender cancellations, reissuances, revisions, or deferrals within the tracked period.
        </div>` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
          ${CANCELLED_TENDER_DATA.map(t => {
            const mwDisplay = t.mw >= 1
              ? `${t.mw.toLocaleString()} <span style="font-size:12px;font-weight:500;color:var(--text-secondary)">MW</span>`
              : `${(t.mw * 1000).toLocaleString()} <span style="font-size:12px;font-weight:500;color:var(--text-secondary)">kW</span>`;
            const reasonText = t.reasonExplicit
              ? t.reason
              : `<span style="font-style:italic;color:var(--text-disabled)">Reason unspecified in official notice</span>`;
            const registerLink = t.relatedRegisterId
              ? `<span style="font-size:10px;color:var(--text-disabled)"> · in register: <span style="font-family:'JetBrains Mono',monospace;color:var(--accent-blue)">${t.relatedRegisterId}</span></span>`
              : '';
            return `
          <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${t.issuer}</div>
                <div style="font-size:10px;color:var(--text-disabled);font-family:'JetBrains Mono',monospace;margin-top:1px">${t.scheme || ''}</div>
              </div>
              ${buildCancelledTag(t.status)}
            </div>
            <div style="font-size:20px;font-weight:800;color:var(--text-primary);font-family:'JetBrains Mono',monospace">${mwDisplay}</div>
            <div style="font-size:11px;color:var(--text-muted);line-height:1.4">${reasonText}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:auto">
              <div style="font-size:10px;color:var(--text-disabled);font-family:'JetBrains Mono',monospace">
                Notice: ${t.noticeDate || '—'}${registerLink}
              </div>
              ${t.sourceUrl ? `<a href="${t.sourceUrl}" target="_blank" rel="noopener"
                   title="${t.sourceLabel || 'Official source'}"
                   style="color:var(--accent-blue);font-size:10px;text-decoration:none;display:inline-flex;align-items:center;gap:3px">
                source <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:8px;opacity:0.7"></i>
              </a>` : ''}
            </div>
          </div>`;
          }).join('')}
        </div>`}
        <div style="padding:10px 0 0;border-top:1px solid var(--border-subtle);margin-top:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · SECI</span>
          <span class="chart-source">
            Sources:
            <a href="${CANCELLED_TENDER_META.seciNoticesUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">SECI Tenders</a>
            · Linked to Live Tender Register (any TENDER_ROWS row with status
            "Cancelled / Reissued" auto-surfaces here)
            · Reason only when explicitly stated in official lifecycle document
            · Cancellation/reissue never inferred from missing updates
            · Verified: ${CANCELLED_TENDER_META.cutoffDate}
          </span>
        </div>
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

    // Tender Mix Donut — REAL DATA from TYPE_MIX_DATA (FY26)
    // Filter out zero-MW categories so donut doesn't show an invisible Hybrid slice
    const nonZeroCategories = TYPE_MIX_DATA.categories.filter(c => c.mw > 0);
    Charts.donut('chartTenderMix',
      nonZeroCategories.map(c => c.label),
      nonZeroCategories.map(c => c.pct),
      nonZeroCategories.map(c => c.color)
    );

    // Issuer Comparison — REAL DATA from ISSUER_VOLUME_DATA
    Charts.horizontalBar('chartIssuerComp',
      ISSUER_VOLUME_DATA.labels,
      ISSUER_VOLUME_DATA.mw,
      ISSUER_VOLUME_DATA.colors,
      { xLabel: 'MW', label: 'MW Tendered (FY26)' }
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
