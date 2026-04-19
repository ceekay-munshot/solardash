/* ═══════════════════════════════════════════════════════════════════════════
   TAB 7 — Grid, DISCOM & Execution Risk Monitor
   ───────────────────────────────────────────────────────────────────────────
   Data: js/real-data-grid-risk.js
         - Seed (qualitative tiers anchored to public sources)
         - Overlaid by data/grid-risk.json when present (Firecrawl scrape)
   ═══════════════════════════════════════════════════════════════════════════ */

function initGridTab() {
  const el = document.getElementById('tab-grid');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  // Load the optional scrape overlay, then render.
  loadGridRiskOverlay().finally(() => _renderGridTab(el));
}

function _renderGridTab(el) {
  const states        = getGridRiskStates();
  const tx            = getGridRiskTxBottlenecks();
  const curtailment   = getGridRiskCurtailmentWatchlist();
  const riskFlags     = getGridRiskFlags();
  const watchlist     = getGridRiskWatchlist();
  const aggregates    = getGridRiskAggregates();

  const sortedStates  = [...states].sort((a, b) => b.score - a.score);
  const heatmapStates = [...states].sort((a, b) => b.score - a.score);

  const praaptiAsOfText = aggregates.praaptiAsOf
    ? `As of ${aggregates.praaptiAsOf} (PRAAPTI)`
    : 'State-wise dues not yet scraped — run scripts/scrape-grid-risk.mjs';
  const scrapedAtText = aggregates.scrapedAt
    ? new Date(aggregates.scrapedAt).toISOString().slice(0, 10)
    : null;

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({
      label: 'DISCOM RE Dues Outstanding',
      value: aggregates.praaptiTotalCr != null ? '₹' + _fmtLakh(aggregates.praaptiTotalCr) : '—',
      unit:  aggregates.praaptiTotalCr != null ? 'Cr' : '',
      delta: '',
      dir:   'flat',
      negativeGood: true,
      context: aggregates.praaptiAsOf ? `PRAAPTI · ${aggregates.praaptiAsOf}` : 'Run scrape to populate',
      icon: 'fa-money-bill-wave', accentColor:'var(--accent-red)', iconBg:'rgba(239,68,68,0.1)',
    })}
    ${Components.kpiCard({
      label: 'Transmission Constraint Zones',
      value: String(tx.filter(t => t.status !== 'green').length),
      unit:  '',
      delta: '',
      dir:   'flat',
      context: 'per CEA RE-integration plan',
      icon: 'fa-tower-broadcast', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)',
    })}
    ${Components.kpiCard({
      label: 'System Curtailment %',
      value: '—',
      unit:  '',
      delta: '',
      dir:   'flat',
      context: 'state-wise % not centrally published — see watchlist',
      icon: 'fa-ban', accentColor:'var(--accent-orange)', iconBg:'rgba(249,115,22,0.1)',
    })}
    ${Components.kpiCard({
      label: 'Composite State Payment Risk',
      value: aggregates.paymentRiskLabel,
      unit:  '',
      delta: `${aggregates.highPlusCount}/${aggregates.totalStates} ≥ High`,
      dir:   'flat',
      context: 'mean composite score across tracked states',
      icon: 'fa-shield-halved', accentColor:'var(--accent-solar)', iconBg:'rgba(245,158,11,0.1)',
    })}
  </div>

  <!-- State Risk Heatmap + DISCOM Dues panel -->
  <div class="grid-3-2 mb-6">
    <!-- State Risk Heatmap -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State Risk Heatmap</div>
          <div class="card-subtitle">PRAAPTI payment stress · CEA evacuation · RBI fiscal stress → composite score</div>
        </div>
        ${_realChip('PRAAPTI + CEA + RBI')}
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
          ${heatmapStates.map(s => _buildRiskCell(s)).join('')}
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px">
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(34,197,94,0.25)"></div> Low (&lt;40)</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(245,158,11,0.25)"></div> Medium (40–59)</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(239,68,68,0.2)"></div> High (60–74)</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-muted)"><div style="width:10px;height:10px;border-radius:2px;background:rgba(239,68,68,0.35)"></div> V.High (≥75)</div>
        </div>
        ${_sourcesFooter([
          ['PRAAPTI',   GRID_RISK_SOURCES.praapti.url],
          ['CEA TX',    GRID_RISK_SOURCES.ceaTx.url],
          ['RBI State Finances', GRID_RISK_SOURCES.rbi.url],
        ], scrapedAtText)}
      </div>
    </div>

    <!-- DISCOM Dues Outstanding (aggregate from PRAAPTI or placeholder) -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">DISCOM RE Dues Outstanding</div>
          <div class="card-subtitle">${praaptiAsOfText}</div>
        </div>
        ${_realChip('PRAAPTI')}
      </div>
      <div class="card-body">
        ${aggregates.praaptiTotalCr != null ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
            <div style="padding:14px;border:1px solid var(--border-subtle);border-radius:10px;background:var(--bg-elevated)">
              <div style="font-size:11px;color:var(--text-muted)">Total Outstanding</div>
              <div style="font-size:22px;font-weight:800;color:var(--text-primary);font-family:'JetBrains Mono',monospace">₹${_fmtLakh(aggregates.praaptiTotalCr)} <span style="font-size:12px;color:var(--text-muted)">Cr</span></div>
            </div>
            <div style="padding:14px;border:1px solid var(--border-subtle);border-radius:10px;background:var(--bg-elevated)">
              <div style="font-size:11px;color:var(--text-muted)">Overdue</div>
              <div style="font-size:22px;font-weight:800;color:var(--status-negative);font-family:'JetBrains Mono',monospace">${aggregates.praaptiOverdueCr != null ? '₹' + _fmtLakh(aggregates.praaptiOverdueCr) + ' <span style=\"font-size:12px;color:var(--text-muted)\">Cr</span>' : '—'}</div>
            </div>
          </div>
          <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:var(--text-secondary)">Top states by outstanding dues (PRAAPTI)</div>
          ${_renderStateDuesList(states)}
        ` : `
          <div class="empty-state" style="padding:32px 20px;text-align:center">
            <i class="fa-solid fa-circle-info" style="font-size:22px;color:var(--accent-blue);margin-bottom:8px"></i>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px">State-wise dues not scraped yet</div>
            <div style="font-size:11px;color:var(--text-secondary);max-width:420px;margin:0 auto">
              Run <code style="background:var(--bg-elevated);padding:1px 5px;border-radius:3px">FIRECRAWL_API_KEY=... node scripts/scrape-grid-risk.mjs</code>
              and commit <code style="background:var(--bg-elevated);padding:1px 5px;border-radius:3px">data/grid-risk.json</code>.
            </div>
            <div style="margin-top:10px"><a href="${GRID_RISK_SOURCES.praapti.url}" target="_blank" rel="noopener" style="font-size:11px;color:var(--accent-blue);text-decoration:none">
              <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i> View live on PRAAPTI
            </a></div>
          </div>
        `}
        ${_sourcesFooter([['PRAAPTI', GRID_RISK_SOURCES.praapti.url]], scrapedAtText)}
      </div>
    </div>
  </div>

  <!-- Transmission Bottlenecks + Curtailment Watchlist -->
  <div class="grid-2 mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Transmission Bottleneck Tracker</div>
          <div class="card-subtitle">Publicly documented RE evacuation / green-corridor zones</div>
        </div>
        ${_realChip('CEA')}
      </div>
      <div class="card-body">
        ${tx.map(t => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
          <div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:4px;background:${t.status === 'green' ? '#22c55e' : t.status === 'amber' ? '#f59e0b' : '#ef4444'}"></div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${t.region}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${t.capacity} · ${t.issues}</div>
          </div>
          ${Components.tag(t.status === 'green' ? 'Clear' : t.status === 'amber' ? 'At Risk' : 'Constraint', t.status === 'green' ? 'positive' : t.status === 'amber' ? 'warning' : 'negative')}
        </div>`).join('')}
        ${_sourcesFooter([['CEA Transmission', GRID_RISK_SOURCES.ceaTx.url]], scrapedAtText)}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Solar Curtailment Risk — Watchlist</div>
          <div class="card-subtitle">State-wise curtailment % is not centrally published · qualitative watchlist only</div>
        </div>
        ${_realChip('GRID-India + CEA')}
      </div>
      <div class="card-body">
        ${curtailment.map(c => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--accent-orange);flex-shrink:0"></div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${c.scope}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${c.flag}</div>
          </div>
          <a href="${c.sourceUrl}" target="_blank" rel="noopener" style="font-size:10px;color:var(--accent-blue);text-decoration:none">
            source <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i>
          </a>
        </div>`).join('')}
        <div style="margin-top:12px;padding:10px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.2);border-radius:8px;font-size:11px;color:var(--text-secondary)">
          <strong style="color:var(--accent-blue)">Why no % column:</strong>
          GRID-India and CEA publish system-wide or corridor-level curtailment data; a clean state-wise % series is not centrally published. A fabricated % would mislead.
        </div>
        ${_sourcesFooter([['GRID-India', GRID_RISK_SOURCES.gridIndia.url], ['CEA TX', GRID_RISK_SOURCES.ceaTx.url]], scrapedAtText)}
      </div>
    </div>
  </div>

  <!-- State-Wise Risk Comparison Table -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State-Wise Risk Comparison Table</div>
          <div class="card-subtitle">Composite risk = PRAAPTI (40) + CEA evacuation (35) + RBI fiscal (25) = max 100</div>
        </div>
        ${_realChip('PRAAPTI + CEA + RBI')}
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>State</th>
            <th class="number">Risk Score</th>
            <th>Risk Level</th>
            <th class="number">DISCOM Dues (₹Cr)</th>
            <th>TX Evacuation</th>
            <th>Fiscal (RBI)</th>
          </tr></thead>
          <tbody>
            ${sortedStates.map(s => `
            <tr>
              <td class="primary">${s.state}</td>
              <td class="number mono" style="color:${s.risk === 'vhigh' || s.risk === 'high' ? 'var(--status-negative)' : s.risk === 'medium' ? 'var(--status-warning)' : 'var(--status-positive)'};font-weight:700">${s.score}</td>
              <td>${_buildRiskLevelTag(s.risk)}</td>
              <td class="number mono" style="color:${_duesColor(s.discomDuesCr)}">${s.discomDuesCr != null ? '₹' + s.discomDuesCr.toLocaleString() : '<span style="color:var(--text-muted)">—</span>'}</td>
              <td>${_buildTxConstraintTag(s.txConstraint)}</td>
              <td>${_buildRbiTierTag(s.rbiFiscalTier)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:10px 20px;border-top:1px solid var(--border-subtle)">
        ${_sourcesFooter([
          ['PRAAPTI',   GRID_RISK_SOURCES.praapti.url],
          ['CEA TX',    GRID_RISK_SOURCES.ceaTx.url],
          ['RBI State Finances', GRID_RISK_SOURCES.rbi.url],
        ], scrapedAtText)}
      </div>
    </div>
  </div>

  <!-- Risk Flags + Watchlist -->
  <div class="grid-2 mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Risk Flags</div>
          <div class="card-subtitle">Active themes anchored to public sources</div>
        </div>
        ${_realChip('Multi-source')}
      </div>
      <div class="card-body">
        ${riskFlags.map(f => `
          <div class="risk-flag ${f.level}">
            <div class="risk-flag-icon"><i class="fa-solid ${f.icon}"></i></div>
            <div class="risk-flag-body">
              <div class="risk-flag-title">${f.title}
                <a href="${f.sourceUrl}" target="_blank" rel="noopener" style="margin-left:6px;font-size:10px;color:var(--accent-blue);text-decoration:none;font-weight:500">
                  source <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i>
                </a>
              </div>
              <div class="risk-flag-detail">${f.detail}</div>
            </div>
          </div>`).join('')}
        ${_sourcesFooter([
          ['PRAAPTI',   GRID_RISK_SOURCES.praapti.url],
          ['CEA',       GRID_RISK_SOURCES.ceaTx.url],
          ['GRID-India',GRID_RISK_SOURCES.gridIndia.url],
          ['CERC',      GRID_RISK_SOURCES.cerc.url],
          ['RBI',       GRID_RISK_SOURCES.rbi.url],
        ], scrapedAtText)}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">State Watchlist & Alerts</div>
          <div class="card-subtitle">Publicly-sourced monitoring priorities</div>
        </div>
        ${_realChip('PRAAPTI + RBI')}
      </div>
      <div class="card-body">
        ${watchlist.map(w => `
        <div style="padding:12px;margin-bottom:8px;border-radius:10px;background:var(--bg-elevated);border:1px solid ${w.severity === 'critical' ? 'rgba(239,68,68,0.3)' : w.severity === 'high' ? 'rgba(245,158,11,0.25)' : 'var(--border-subtle)'}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:13px;font-weight:700;color:var(--text-primary)">${w.state}</span>
            ${Components.tag(w.severity.charAt(0).toUpperCase() + w.severity.slice(1), w.severity === 'critical' ? 'negative' : w.severity === 'high' ? 'warning' : 'neutral')}
            <a href="${w.sourceUrl}" target="_blank" rel="noopener" style="margin-left:auto;font-size:10px;color:var(--accent-blue);text-decoration:none">
              source <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i>
            </a>
          </div>
          <div style="font-size:11px;color:var(--text-secondary)">${w.alert}</div>
        </div>`).join('')}
        <div style="margin-top:12px;padding:12px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.2);border-radius:8px;font-size:11px;color:var(--text-secondary)">
          <strong style="color:var(--accent-blue)">Data basis:</strong>
          Watchlist combines PRAAPTI payment-stress tier, CEA evacuation-constraint classification, and RBI State-Finances fiscal-stress tier.
          Current scrape: ${scrapedAtText ? 'committed ' + scrapedAtText : '<em>not yet run — only seed tiers shown</em>'}.
        </div>
        ${_sourcesFooter([
          ['PRAAPTI', GRID_RISK_SOURCES.praapti.url],
          ['RBI',     GRID_RISK_SOURCES.rbi.url],
        ], scrapedAtText)}
      </div>
    </div>
  </div>
  `;
}

/* ─── helpers ──────────────────────────────────────────────────────────── */

function _realChip(label) {
  return `<span class="source-chip manual" title="Public sources — ${label}"><i class="fa-solid fa-file-arrow-down"></i> REAL · ${label}</span>`;
}

function _sourcesFooter(pairs, scrapedDate) {
  const links = pairs.map(([label, url]) =>
    `<a href="${url}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">${label} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i></a>`
  ).join(' · ');
  const stamp = scrapedDate ? `Scraped ${scrapedDate}` : 'Seed data · run scrape to refresh';
  return `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;margin-top:8px;border-top:1px solid var(--border-subtle);flex-wrap:wrap">
      <span class="chart-source">Sources: ${links}</span>
      <span class="chart-source" style="margin-left:auto">${stamp}</span>
    </div>`;
}

function _fmtLakh(cr) {
  // ₹ Cr → ₹ Lakh Cr when ≥ 100000 (i.e. ≥ 1 Lakh Cr).
  if (cr == null) return '—';
  if (cr >= 100000) return (cr / 100000).toFixed(2) + 'L';
  return cr.toLocaleString('en-IN');
}

function _buildRiskCell(s) {
  const bg = s.risk === 'vhigh' ? 'rgba(239,68,68,0.25)' : s.risk === 'high' ? 'rgba(239,68,68,0.15)' : s.risk === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)';
  const bc = s.risk === 'vhigh' ? 'rgba(239,68,68,0.4)' : s.risk === 'high' ? 'rgba(239,68,68,0.3)' : s.risk === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)';
  const tc = s.risk === 'vhigh' || s.risk === 'high' ? 'var(--status-negative)' : s.risk === 'medium' ? 'var(--status-warning)' : 'var(--status-positive)';
  return `
  <div style="background:${bg};border:1px solid ${bc};border-radius:8px;padding:10px 8px;text-align:center" title="PRAAPTI tier: ${s.praaptiTier} · TX: ${s.txConstraint} · RBI: ${s.rbiFiscalTier}">
    <div style="font-size:10px;font-weight:700;color:var(--text-primary)">${s.abbr || s.state}</div>
    <div style="font-size:14px;font-weight:800;font-family:'JetBrains Mono',monospace;color:${tc}">${s.score}</div>
    <div style="font-size:9px;color:var(--text-muted);margin-top:1px">${s.risk.toUpperCase()}</div>
  </div>`;
}

function _buildRiskLevelTag(risk) {
  const map    = { vhigh:'negative', high:'negative', medium:'warning', low:'positive' };
  const labels = { vhigh:'Very High', high:'High', medium:'Medium', low:'Low' };
  return Components.tag(labels[risk] || risk, map[risk] || 'neutral');
}

function _buildTxConstraintTag(tx) {
  const map    = { 'critical':'negative', 'active-buildout':'warning', 'adequate':'positive', 'unknown':'neutral' };
  const labels = { 'critical':'Constraint', 'active-buildout':'Build-out', 'adequate':'Adequate', 'unknown':'—' };
  return Components.tag(labels[tx] || tx, map[tx] || 'neutral');
}

function _buildRbiTierTag(tier) {
  const map    = { high:'negative', moderate:'warning', low:'positive', unknown:'neutral' };
  const labels = { high:'High stress', moderate:'Moderate', low:'Low', unknown:'—' };
  return Components.tag(labels[tier] || tier, map[tier] || 'neutral');
}

function _duesColor(cr) {
  if (cr == null) return 'var(--text-muted)';
  if (cr >  12000) return 'var(--status-negative)';
  if (cr >   5000) return 'var(--status-warning)';
  return 'var(--status-positive)';
}

function _renderStateDuesList(states) {
  const withDues = states.filter(s => s.discomDuesCr != null).sort((a, b) => b.discomDuesCr - a.discomDuesCr).slice(0, 8);
  if (!withDues.length) {
    return `<div style="font-size:11px;color:var(--text-muted)">State-wise dues not present in scrape.</div>`;
  }
  const max = withDues[0].discomDuesCr || 1;
  return withDues.map(s => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="min-width:120px;font-size:11px;color:var(--text-secondary)">${s.state}</span>
      <div style="flex:1;background:var(--bg-elevated);border-radius:999px;height:7px;overflow:hidden">
        <div style="height:100%;border-radius:999px;background:${_duesColor(s.discomDuesCr)};width:${Math.min(100, (s.discomDuesCr/max)*100).toFixed(1)}%"></div>
      </div>
      <span style="min-width:70px;text-align:right;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:${_duesColor(s.discomDuesCr)}">₹${s.discomDuesCr.toLocaleString('en-IN')} Cr</span>
    </div>`).join('');
}
