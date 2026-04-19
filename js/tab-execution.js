/* ═══════════════════════════════════════════════════════════════════════════
   TAB 4 — Project Execution & Commissioning Tracker
   ═══════════════════════════════════════════════════════════════════════════ */

function initExecutionTab() {
  const el = document.getElementById('tab-execution');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.execution;
  const src = DATA_SOURCES.execution;

  // Effective data (live-first, seed-fallback) for the three wired blocks.
  const kpiComm   = (typeof execGetCommissionedKPI === 'function') ? execGetCommissionedKPI() : null;
  const trend     = (typeof execGetCommissionTrend === 'function') ? execGetCommissionTrend() : null;
  const stateComm = (typeof execGetStateCommission === 'function') ? execGetStateCommission() : null;
  const modeChip  = (m) => (typeof execModeChip === 'function') ? execModeChip(m) : '';
  const refreshLine = (typeof execRefreshStatusText === 'function') ? execRefreshStatusText() : '';

  // Commissioned KPI — live-first, seed-fallback; no mock fallback
  let commissionedCard;
  if (kpiComm && (kpiComm.mode === 'live' || kpiComm.mode === 'seed')) {
    const v = kpiComm.fyYtdMW;
    const unitMW = v >= 10000 ? (v / 1000).toFixed(2) + ' GW' : v.toLocaleString() + ' MW';
    const ctx = kpiComm.mode === 'live'
      ? `${kpiComm.currentFY || 'FY'} YTD · live · as of ${kpiComm.asOfDate || '—'}`
      : `${kpiComm.currentFY || 'FY26'} YTD · seed · as of ${kpiComm.asOfDate || EXEC_SEED_AS_OF}`;
    commissionedCard = Components.kpiCard({
      label:       'Commissioned Capacity (FY YTD)',
      value:       unitMW.split(' ')[0],
      unit:        unitMW.split(' ')[1],
      delta:       kpiComm.mode === 'live' ? 'Live' : 'Seed',
      dir:         'flat',
      context:     ctx,
      icon:        'fa-plug-circle-check',
      accentColor: 'var(--accent-green)',
      iconBg:      'rgba(34,197,94,0.1)',
    });
  } else {
    commissionedCard = Components.kpiCard({
      label:       'Commissioned Capacity (FY YTD)',
      value:       '—',
      unit:        '',
      delta:       'Unavailable',
      dir:         'flat',
      context:     'Primary source unreachable from browser',
      icon:        'fa-plug-circle-check',
      accentColor: 'var(--accent-green)',
      iconBg:      'rgba(34,197,94,0.1)',
    });
  }

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${commissionedCard}
    ${Components.kpiCard({ label:'Under-Construction Pipeline', value: d.kpis.underConstruction.value, unit: 'MW', delta: d.kpis.underConstruction.delta, dir: 'up', context: d.kpis.underConstruction.context, icon:'fa-hard-hat', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)' })}
    ${Components.kpiCard({ label:'Delayed Projects', value: d.kpis.delayed.value, unit: 'MW', delta: d.kpis.delayed.delta, dir: 'down', negativeGood: true, context: d.kpis.delayed.context, icon:'fa-clock', accentColor:'var(--accent-red)', iconBg:'rgba(239,68,68,0.1)' })}
    ${Components.kpiCard({ label:'Avg. Award-to-COD Lag', value: d.kpis.avgLag.value, unit: 'mo', delta: d.kpis.avgLag.delta, dir: 'down', negativeGood: true, context: d.kpis.avgLag.context, icon:'fa-calendar-days', accentColor:'var(--accent-teal)', iconBg:'rgba(20,184,166,0.1)' })}
  </div>

  <!-- Commission Trend + Pipeline -->
  <div class="grid-2 mb-6">
    <!-- Commissioning Trend — LIVE-first, SEED-fallback (MNRE Physical Progress) -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Commissioning Trend</div>
          <div class="card-subtitle">
            Quarterly newly commissioned solar capacity (MW) ·
            ${trend && trend.labels && trend.labels.length ? trend.labels[0] + ' – ' + trend.labels[trend.labels.length - 1] : '—'} ·
            ${trend ? (trend.mode === 'live' ? 'Live' : 'Seed') + ' · as of ' + (trend.asOfDate || '—') : 'Unavailable'}
          </div>
        </div>
        ${modeChip(trend ? trend.mode : 'unavailable')}
      </div>
      <div class="card-body">
        <div class="canvas-wrap" style="height:240px"><canvas id="chartCommission"></canvas></div>
        <div style="margin-top:10px;padding:10px 12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:7px;font-size:10px;color:var(--text-secondary);line-height:1.7">
          <strong style="color:#22c55e">Definition:</strong>
          Quarterly MW = change in MNRE cumulative installed solar capacity between quarter-end dates.
          Includes utility-scale + grid-connected rooftop + hybrid solar component + off-grid.
          ${trend && trend.mode === 'seed' ? `
            FY25 total: ${(COMMISSION_TREND_META.fy25Total/1000).toFixed(1)} GW (official: ${(COMMISSION_TREND_META.fy25Official/1000).toFixed(2)} GW) ·
            FY26 total: ${(COMMISSION_TREND_META.fy26Total/1000).toFixed(1)} GW (official: ${(COMMISSION_TREND_META.fy26Official/1000).toFixed(2)} GW) ·
            Cumulative at Mar 2026: ${(COMMISSION_TREND_META.latestCumulative/1000).toFixed(2)} GW
          ` : `
            ${(trend && trend.commissioned ? trend.commissioned.length : 0)} confirmed quarter(s) from live primary-source fetch.
          `}
        </div>
        <div style="margin-top:8px;padding:6px 0;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          ${modeChip(trend ? trend.mode : 'unavailable')}
          <span class="chart-source">
            <a href="https://mnre.gov.in/en/physical-progress/" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">MNRE Physical Progress</a>
            · PIB official FY releases ·
            Mercom India + JMK Research (citing CEA/MNRE) for interim quarter-end anchors ·
            ${refreshLine}
          </span>
        </div>
      </div>
    </div>
    <!-- Pipeline chart: CEA quarterly under-construction PDFs fully blocked by robots.txt -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Under-Construction Solar Pipeline</div>
          <div class="card-subtitle">Quarterly total solar MW under active construction</div>
        </div>
        <span class="source-chip" style="background:rgba(239,68,68,0.1);color:#ef4444;border-color:rgba(239,68,68,0.25)">
          <i class="fa-solid fa-ban"></i> DATA UNAVAILABLE
        </span>
      </div>
      <div class="card-body">
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:240px;gap:14px;padding:20px">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center">
            <i class="fa-solid fa-lock" style="color:#ef4444;font-size:20px"></i>
          </div>
          <div style="text-align:center;max-width:380px">
            <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:8px">
              Primary source blocked — not wiretable from public access
            </div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.7">
              CEA quarterly under-construction RE reports (cea.nic.in) are the only official source for this
              quarterly solar pipeline series. All CEA paths — pages and direct PDF URLs — return
              ROBOTS_DISALLOWED. Only one confirmed solar-specific under-construction figure exists from
              accessible public sources: MNRE @mnreindia (Jan 2025) — 84,190 MW solar under
              implementation as on 31 Dec 2024. A single point cannot form a quarterly series.
            </div>
          </div>
        </div>
        <div style="padding:10px 12px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2);border-radius:7px;font-size:10px;color:var(--text-secondary);line-height:1.7">
          <strong style="color:#ef4444">Verification log:</strong>
          cea.nic.in/rpm/quarterly-report → ROBOTS_DISALLOWED ·
          cea.nic.in/rpm/ → ROBOTS_DISALLOWED ·
          direct PDF wp-content/uploads/rpm_division/ → ROBOTS_DISALLOWED ·
          Scribd Jun 2025 copy → paywalled, no solar breakdown ·
          CEA snippet data (Mar/Sep 2025) → wind and hybrid MW visible in snippets but solar MW cut off ·
          MNRE PIB annual → total RE pipeline only, not solar-specific ·
          One confirmed solar UC point: 84.19 GW as on 31 Dec 2024 (MNRE @mnreindia)
        </div>
      </div>
    </div>
  </div>

  <!-- State Commissioning + Developer Execution -->
  <div class="grid-2 mb-6">
    <!-- State Commissioning — LIVE-first, SEED-fallback (MNRE state-wise PDFs) -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State-Wise Commissioning (${stateComm ? stateComm.fy || 'FY' : '—'})</div>
          <div class="card-subtitle">
            Solar MW newly commissioned by state ·
            ${stateComm ? (stateComm.priorDate || '—') + ' → ' + (stateComm.latestDate || '—') : '—'} ·
            ${stateComm && stateComm.mw ? stateComm.mw.reduce((a,b)=>a+b,0).toLocaleString() + ' MW total' : '—'} ·
            ${stateComm ? (stateComm.mode === 'live' ? 'Live' : 'Seed') + ' · as of ' + (stateComm.asOfDate || '—') : 'Unavailable'}
          </div>
        </div>
        ${modeChip(stateComm ? stateComm.mode : 'unavailable')}
      </div>
      <div class="card-body">
        <div class="canvas-wrap" style="height:220px">
          <canvas id="chartStateCommission"></canvas>
        </div>
        <div style="margin-top:16px">
          ${stateComm && stateComm.rows ? (
            stateComm.mode === 'live'
              ? stateComm.rows.map((r, i) =>
                  Components.stateBar(r.state, r.fyYtdMW.toLocaleString(), (r.fyYtdMW / stateComm.rows[0].fyYtdMW * 100), stateComm.colors[i] || '#94a3b8', 'MW')
                ).join('')
              : stateComm.rows.map(s =>
                  Components.stateBar(s.state, s.fy26Mw.toLocaleString(), (s.fy26Mw / stateComm.rows[0].fy26Mw * 100), s.color, 'MW')
                ).join('')
          ) : ''}
        </div>
        <div style="margin-top:12px;padding:10px 12px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:7px;font-size:10px;color:var(--text-secondary);line-height:1.7">
          <strong style="color:var(--accent-blue)">Method:</strong>
          ${stateComm && stateComm.mode === 'live' ? `
            Per-state FY YTD = (latest cumulative solar) − (prior FY-end cumulative solar), both per MNRE state-wise publication.
            Only states with both endpoints confirmed from primary source are included.
          ` : `
            FY26 addition = Mar 2026 state solar (exact, MNRE PDF) − Mar 2025 baseline.
            Tier B (${STATE_COMMISSION_META.tierBStates}): Mar 2025 from MNRE RE Statistics 2024-25 solar % of RE total.
            Tier C (${STATE_COMMISSION_META.tierCStates}): Mar 2025 interpolated from MNRE Sep 2024 archive + national FY26/FY25-H2 growth ratio.
            National FY26 total: ${(STATE_COMMISSION_META.fy26Total/1000).toFixed(2)} GW (confirmed).
            State distribution for non-top-5 states carries ±15–25% uncertainty.
          `}
        </div>
        <div style="margin-top:8px;padding:6px 0;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          ${modeChip(stateComm ? stateComm.mode : 'unavailable')}
          <span class="chart-source">
            <a href="https://mnre.gov.in/en/physical-progress/" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">MNRE Physical Progress</a>
            ${stateComm && stateComm.mode === 'seed' ? `· <a href="${STATE_COMMISSION_META.pdfUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">MNRE state-wise PDF (Mar 2026)</a>` : ''}
            · ${refreshLine}
          </span>
        </div>
      </div>
    </div>

    <!-- Developer Commissioning Conversion Ranking — REAL DATA -->
    <div class="card" style="overflow:hidden">
      <div class="card-header">
        <div>
          <div class="card-title">Developer Commissioning Conversion Ranking</div>
          <div class="card-subtitle">
            Commissioned RE capacity vs. contracted portfolio ·
            Sorted by Commissioned MW · ${DEVELOPER_META.developersWithConversion}/4 developers have full conversion data
          </div>
        </div>
        <span class="source-chip manual"
              title="BSE Reg-30 / SEC 6-K mandatory regulatory disclosures. CEA plant-wise (primary source) blocked by robots.txt.">
          <i class="fa-solid fa-file-arrow-down"></i> REAL · BSE/SEC
        </span>
      </div>
      <div class="card-body" style="padding:0">
        <div style="overflow-x:auto">
          <table class="data-table" style="min-width:700px">
            <thead><tr>
              <th style="width:42px">Rank</th>
              <th>Developer</th>
              <th class="number" title="Total contracted portfolio (PPAs+LoAs) per official quarterly disclosure. N/A where not confirmed.">Portfolio MW</th>
              <th class="number" title="Operational/commercially commissioned RE capacity">Commissioned MW</th>
              <th class="number" title="Portfolio MW minus Commissioned MW (derived)">Under Const.</th>
              <th class="number" title="Commissioned / Portfolio × 100. Shown only where both figures confirmed from same official source.">Conv. %</th>
              <th class="number" style="font-size:10px">Latest Quarter</th>
            </tr></thead>
            <tbody>
              ${DEVELOPER_ROWS.map(dev => {
                const portDisp = dev.portfolioMW ? dev.portfolioMW.toLocaleString() + ' MW' : '<span style="color:var(--text-muted)">—</span>';
                const ucDisp   = dev.ucMW ? dev.ucMW.toLocaleString() + ' MW'  : '<span style="color:var(--text-muted)">—</span>';
                const convDisp = dev.conversionPct !== null
                  ? `<span style="font-weight:700;color:${dev.conversionPct>=70?'var(--status-positive)':dev.conversionPct>=50?'var(--status-warning)':'var(--status-negative)'}">${dev.conversionPct.toFixed(1)}%</span>`
                  : '<span style="color:var(--text-muted);font-size:10px">—</span>';
                const solarTag = dev.commissionedSolarMW
                  ? `<div style="font-size:10px;color:var(--text-secondary);margin-top:2px">${(dev.commissionedSolarMW/1000).toFixed(1)} GW solar confirmed</div>`
                  : (dev.commissionedNote.includes('solar-specific') ? '<div style="font-size:10px;color:var(--text-muted);margin-top:2px">solar split not confirmed</div>' : '');
                return `<tr>
                  <td>${Components.rankBadge(dev.rank)}</td>
                  <td>
                    <div style="font-weight:600;color:var(--text-primary)">${dev.developer}</div>
                    <div style="font-size:10px;color:var(--text-muted)">${dev.ticker}</div>
                    ${solarTag}
                  </td>
                  <td class="number mono" style="font-size:11px">${portDisp}</td>
                  <td class="number mono" style="font-weight:700;color:${dev.color}">${(dev.commissionedMW/1000).toFixed(1)} GW</td>
                  <td class="number mono" style="font-size:11px">${ucDisp}</td>
                  <td class="number">${convDisp}</td>
                  <td class="number" style="font-size:10px;color:var(--text-secondary)">${dev.latestQuarter}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div style="padding:10px 16px 12px;background:rgba(59,130,246,0.04);border-top:1px solid var(--border-subtle);font-size:10px;color:var(--text-secondary);line-height:1.7">
          <strong style="color:var(--accent-blue)">Sort basis:</strong> ${DEVELOPER_META.sortBasis} — ${DEVELOPER_META.sortReason}<br>
          <strong style="color:var(--accent-blue)">Coverage:</strong> ${DEVELOPER_META.coverageNote}<br>
          <strong style="color:#ef4444">CEA blocked:</strong> ${DEVELOPER_META.ceaBlockedNote}
        </div>
        <div style="padding:8px 16px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · BSE/SEC</span>
          <span class="chart-source">
            AGEL: <a href="https://www.adani.com/newsroom/media-releases/adani-green-energy-delivers-on-5-gw-commitment-in-fy26" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">official press release (Apr 2026)</a> ·
            ReNew: <a href="https://investor.renew.com" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">SEC 6-K + Q3 FY26 earnings</a> ·
            NTPC Green: BSE filing Q2 FY26 + Reg-30 notices ·
            SJVN: BSE Reg-30 Bikaner commissioning + Q2 FY26 concall ·
            Data cutoff: ${DEVELOPER_META.dataAsOf}
          </span>
        </div>
      </div>
    </div>
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
    // Commission trend — live-first, seed-fallback
    if (trend && trend.labels && trend.commissioned && trend.commissioned.length) {
      Charts.bar('chartCommission', trend.labels, [
        { label: 'Commissioned MW (Solar) · ' + (trend.mode === 'live' ? 'Live' : 'Seed'),
          data: trend.commissioned, color: '#22c55e' }
      ], { yLabel: 'MW' });
    }

    // Pipeline chart — DATA UNAVAILABLE: cea.nic.in fully blocked by robots.txt; no chartPipeline canvas rendered

    // State donut — live-first, seed-fallback
    if (stateComm && stateComm.states && stateComm.mw && stateComm.mw.length) {
      Charts.donut('chartStateCommission',
        stateComm.states,
        stateComm.mw,
        stateComm.colors
      );
    }
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
