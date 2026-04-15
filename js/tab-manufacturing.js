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
    <!-- Capacity Split Donut — REAL DATA (ALMM List-I/II + PLI Parliament) -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Domestic Capacity Stack</div>
          <div class="card-subtitle">
            ALMM-enlisted + PLI-declared · Module: ${ALMM_META.moduleAsOf} · Cell: ${ALMM_META.cellAsOf}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="source-chip manual" title="ALMM List-I (01 Mar 2026) + List-II (13 Feb 2026) + PLI Parliament statement (30 Jun 2025)">
            <i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE/PLI
          </span>
        </div>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center">
          <div class="canvas-wrap" style="height:200px">
            <canvas id="chartCapMix"></canvas>
          </div>
          <div class="donut-legend">
            ${Components.legendRow('#f59e0b', 'Module (ALMM List-I)', ALMM_CAPACITY.moduleGW + ' GW')}
            ${Components.legendRow('#3b82f6', 'Cell (ALMM List-II)', '≥' + ALMM_CAPACITY.cellGW + ' GW')}
            ${Components.legendRow('#22c55e', 'Wafer (PLI-declared)', ALMM_CAPACITY.waferGW + ' GW')}
            ${Components.legendRow('#a855f7', 'Ingot (PLI-declared)', ALMM_CAPACITY.ingotGW + ' GW')}
          </div>
        </div>
        <!-- Source notes for wafer/ingot -->
        <div style="margin-top:10px;padding:10px 12px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:8px;font-size:10px;color:var(--text-muted);line-height:1.6">
          <strong style="color:var(--accent-blue)">Data notes —</strong>
          Module: ALMM List-I Rev.XLVII enlisted capacity (gov't-approved manufacturers only; total market ~210 GW). ·
          Cell: ALMM List-II Rev.5 aggregate; Rev.6 (Apr 2026) adds ≥Reliance 1.24 GW pending MNRE summary. ·
          Wafer/Ingot: PLI-installed capacity per parliamentary statement (MoS Naik, Aug 2025) as of 30 Jun 2025.
          ALMM List-III for wafers not yet published (effective Jun 2028, threshold: ≥15 GW operational).
        </div>
        <div style="margin-top:16px">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Backward Integration Coverage</div>
          ${buildIntegrationBars()}
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;margin-top:8px;border-top:1px solid var(--border-subtle)">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · MNRE/PLI</span>
          <span class="chart-source">
            Sources:
            <a href="${ALMM_META.moduleSourcePage}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">MNRE ALMM</a>
            ·
            <a href="${ALMM_META.modulePdfUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">Module PDF (${ALMM_META.moduleAsOf})</a>
            ·
            <a href="${ALMM_META.cellPdfUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">Cell PDF (${ALMM_META.cellAsOf})</a>
            · Parliament Q&A Aug 2025 (wafer/ingot)
          </span>
        </div>
      </div>
    </div>

    <!-- Domestic vs Import -->
    ${Components.chartCard({ id:'chartImportDomestic', title:'Domestic vs Import Supply Volume', subtitle:'GW equivalent — module/cell supply to India', height:260, source: src.label })}
  </div>

  <!-- Import-Export Trend -->
  <div class="mb-6">
    ${Components.chartCard({ id:'chartImportTrend', title:'Import vs Domestic Supply Trend', subtitle:'Half-yearly GW equivalent — market share evolution', height:240, source: src.label, extraClass:'w-full' })}
  </div>

  <!-- Manufacturer Ranking Table — REAL DATA (ALMM + PLI + Public Disclosures) -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Manufacturer Ranking — Capacity &amp; Backward Integration</div>
          <div class="card-subtitle">
            ALMM List-I module · ALMM List-II cell · PLI + corporate disclosures for wafer/ingot ·
            Ranked by ALMM-enlisted module GW · ${MFG_META.cutoffDate}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="source-chip manual" title="${MFG_META.moduleSource} | ${MFG_META.cellSource}">
            <i class="fa-solid fa-file-arrow-down"></i> REAL · ALMM/PLI
          </span>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>Rank</th>
            <th>Manufacturer</th>
            <th class="number">Module GW</th>
            <th class="number">Cell GW</th>
            <th class="number">Wafer GW</th>
            <th class="number">Ingot GW</th>
            <th>Integration</th>
            <th>PLI</th>
            <th>Listed</th>
          </tr></thead>
          <tbody>
            ${MFG_ROWS.map(r => {
              const intTag = getMfgIntegrationTag(r);
              const modChip = getMfgConfidenceChip(r.moduleConf);
              const cellChip = r.cellConf ? getMfgConfidenceChip(r.cellConf) : '';
              return `<tr title="Module: ${r.moduleNote || ''}">
                <td>${Components.rankBadge(r.rank)}</td>
                <td>
                  <div class="primary" style="font-weight:600">${r.name}</div>
                  <div style="font-size:10px;color:var(--text-disabled);margin-top:2px">${r.ticker}</div>
                </td>
                <td class="number">
                  <span class="mono">${r.moduleGW.toFixed(1)}</span>
                  <div style="margin-top:2px">${modChip}</div>
                </td>
                <td class="number">
                  ${r.cellGW !== null
                    ? `<span class="mono">${r.cellGW.toFixed(2)}</span><div style="margin-top:2px">${cellChip}</div>`
                    : `<span style="color:var(--text-disabled)">—</span>`}
                </td>
                <td class="number">
                  ${r.waferGW !== null
                    ? `<span class="mono">${r.waferGW.toFixed(1)}</span><div style="margin-top:2px">${getMfgConfidenceChip('stated')}</div>`
                    : `<span style="color:var(--text-disabled)">—</span>`}
                </td>
                <td class="number">
                  ${r.ingotGW !== null
                    ? `<span class="mono">${r.ingotGW.toFixed(1)}</span><div style="margin-top:2px">${getMfgConfidenceChip('stated')}</div>`
                    : `<span style="color:var(--text-disabled)">—</span>`}
                </td>
                <td><span class="tag tag-${intTag.type}">${intTag.label}</span></td>
                <td>${r.pli ? Components.tag('PLI', 'positive') : Components.tag('—', 'neutral')}</td>
                <td>${r.listed ? Components.tag('Listed', 'info') : Components.tag('Private', 'neutral')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:10px 20px;border-top:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · ALMM/PLI</span>
        <span class="chart-source">
          Module: <a href="${MFG_META.sourceUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">MNRE ALMM</a> Rev XLVII (01 Mar 2026) ·
          Cell: ALMM List-II Rev 6 (13 Apr 2026) ·
          Wafer/Ingot: PLI parliament + Adani corporate disclosure ·
          <span style="background:rgba(59,130,246,0.1);color:var(--accent-blue);padding:1px 5px;border-radius:4px;font-size:9px;font-weight:700">ALMM</span> = MNRE List-I/II enlisted ·
          <span style="background:rgba(245,158,11,0.1);color:var(--status-warning);padding:1px 5px;border-radius:4px;font-size:9px;font-weight:700">STATED</span> = company/MNRE stated ·
          <span style="background:rgba(168,85,247,0.1);color:var(--accent-purple);padding:1px 5px;border-radius:4px;font-size:9px;font-weight:700">DERIVED</span> = aggregated units
        </span>
      </div>
    </div>
  </div>

  <!-- Expansion Tracker — REAL DATA (BSE/NSE Reg-30, Official Press Releases, AGM) -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Announced Capacity Expansion Tracker</div>
          <div class="card-subtitle">
            Public disclosures only — BSE/NSE Reg-30 filings, official press releases, and AGM statements ·
            Status reflects only explicit company disclosure, not inference
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="source-chip manual" title="BSE/NSE Reg-30 filings + official company press releases + AGM statements">
            <i class="fa-solid fa-file-arrow-down"></i> REAL · Filings/PR
          </span>
        </div>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
          ${EXPANSIONS.map(e => {
            const cfg = getExpansionStatusConfig(e.status);
            const borderColor = {
              positive: 'rgba(34,197,94,0.25)',
              info:     'rgba(59,130,246,0.2)',
              warning:  'rgba(245,158,11,0.2)',
              negative: 'rgba(239,68,68,0.2)',
              neutral:  'var(--border-subtle)',
            }[cfg.type] || 'var(--border-subtle)';
            return `
            <div style="background:var(--bg-elevated);border:1px solid ${borderColor};border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:0">
              <!-- Header row -->
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px">
                <div style="font-size:13px;font-weight:700;color:var(--text-primary);line-height:1.3">${e.company}</div>
                <span class="tag tag-${cfg.type}" style="flex-shrink:0;white-space:nowrap">
                  <i class="fa-solid ${cfg.icon}" style="font-size:9px"></i> ${cfg.label}
                </span>
              </div>
              <!-- Capacity + type -->
              <div style="font-size:12px;color:var(--text-primary);font-weight:600;margin-bottom:3px">${e.capacity}</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px">${e.type} · ${e.location}</div>
              <!-- Timeline -->
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">
                <i class="fa-regular fa-calendar" style="font-size:9px;margin-right:3px"></i>${e.targetDate}
              </div>
              <!-- Source footer -->
              <div style="border-top:1px solid var(--border-subtle);padding-top:8px;margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap">
                <span style="font-size:10px;color:var(--text-disabled);font-family:'JetBrains Mono',monospace">${e.sourceDate}</span>
                <a href="${e.sourceUrl}" target="_blank" rel="noopener"
                   style="font-size:10px;color:var(--accent-blue);text-decoration:none;display:inline-flex;align-items:center;gap:3px;flex-shrink:0"
                   title="${e.sourceName}">
                  <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:8px"></i> Source
                </a>
              </div>
            </div>`;
          }).join('')}
        </div>
        <!-- Notes panel -->
        <div style="margin-top:14px;padding:12px 14px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:8px;font-size:11px;color:var(--text-secondary);line-height:1.7">
          <strong style="color:var(--accent-blue)">Disclosure standards —</strong>
          <span class="tag tag-positive" style="font-size:9px;margin:0 3px"><i class="fa-solid fa-circle-check" style="font-size:8px"></i> Commissioned</span> = company confirmed commissioning in exchange notice or press release ·
          <span class="tag tag-info" style="font-size:9px;margin:0 3px"><i class="fa-solid fa-hard-hat" style="font-size:8px"></i> Under Execution</span> = physical work confirmed (groundbreaking, first production, civil works) ·
          <span class="tag tag-neutral" style="font-size:9px;margin:0 3px"><i class="fa-solid fa-calendar-check" style="font-size:8px"></i> Planned</span> = board approval received; work not yet confirmed as physically underway ·
          Timelines are company-stated targets, not verified actuals.
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;margin-top:8px;border-top:1px solid var(--border-subtle);flex-wrap:wrap">
          <span class="source-chip manual"><i class="fa-solid fa-file-arrow-down"></i> REAL · Filings/PR</span>
          <span class="chart-source">Sources: BSE/NSE Regulation 30 (LODR) filings · Official company press releases · AGM shareholder statements · IPO DRHP filings · Data as of ${EXP_META.cutoffDate}</span>
        </div>
      </div>
    </div>
  </div>
  `;

  requestAnimationFrame(() => {
    // Capacity Mix Donut — REAL DATA (ALMM + PLI)
    Charts.donut('chartCapMix',
      ALMM_DONUT.labels,
      ALMM_DONUT.values,
      ALMM_DONUT.colors
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

/* ── buildIntegrationBars — REAL DATA (ALMM_INTEGRATION) ───────────────────
   Backward integration coverage ratios derived from ALMM List-I, List-II,
   and PLI Parliamentary statement. See real-data-almm.js for full sourcing.
   ─────────────────────────────────────────────────────────────────────────── */
function buildIntegrationBars() {
  const items = [
    {
      label:  'Module → Cell  (ALMM List-II / List-I)',
      pct:    ALMM_INTEGRATION.moduleToCellPct,
      color:  '#3b82f6',
      note:   `${ALMM_CAPACITY.cellGW} GW cell vs ${ALMM_CAPACITY.moduleGW} GW module · ${ALMM_INTEGRATION.moduleToCellGap}% gap (imports / non-ALMM)`,
      warn:   true,  // significant gap
    },
    {
      label:  'Cell → Wafer  (PLI-declared / ALMM List-II)',
      pct:    ALMM_INTEGRATION.cellToWaferPct,
      color:  '#22c55e',
      note:   `${ALMM_CAPACITY.waferGW} GW wafer vs ${ALMM_CAPACITY.cellGW} GW cell · ${ALMM_INTEGRATION.cellToWaferGap}% reliant on imported wafers`,
      warn:   true,  // severe gap
    },
    {
      label:  'Wafer → Ingot  (PLI-structure: ingot = wafer)',
      pct:    ALMM_INTEGRATION.waferToIngotPct,
      color:  '#a855f7',
      note:   'ALMM List-III mandates ingot capacity ≡ wafer capacity — effectively 1:1 for PLI manufacturers',
      warn:   false,
    },
  ];

  return items.map(item => `
  <div style="margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
      <span style="font-size:11px;color:var(--text-secondary)">${item.label}</span>
      <span style="font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;
            color:${item.warn && item.pct < 20 ? 'var(--status-negative)' : item.pct === 100 ? 'var(--status-positive)' : 'var(--text-primary)'}">
        ${item.pct}%
      </span>
    </div>
    ${Components.progressBar(Math.max(item.pct, 1), item.color)}
    <div style="font-size:10px;color:var(--text-disabled);margin-top:3px;line-height:1.4">${item.note}</div>
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
