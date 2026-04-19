/* ═══════════════════════════════════════════════════════════════════════════
   TAB 5 — IPP / Listed Player Monitor
   ═══════════════════════════════════════════════════════════════════════════ */

let activeIPP = 'Adani Green';

function initIPPTab() {
  const el = document.getElementById('tab-ipp');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  // Load data (async) then render. On first visit the cache is cold.
  loadIPPCompanyData(activeIPP).then(() => renderIPPTab());
}

function renderIPPTab(company) {
  company = company || activeIPP;
  activeIPP = company;
  const el = document.getElementById('tab-ipp');

  // If cache is cold for this company, show a brief loader then re-invoke.
  if (!IPP_COMPANY_CACHE[company]) {
    el.innerHTML = `<div style="padding:60px;text-align:center;color:var(--text-muted)">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:18px"></i>
      <div style="margin-top:8px;font-size:12px">Loading ${company}…</div>
    </div>`;
    loadIPPCompanyData(company).then(() => renderIPPTab(company));
    return;
  }

  const cached      = IPP_COMPANY_CACHE[company];
  const d           = MOCK.ipp;       // still needed for cross-company comparison table
  const src         = DATA_SOURCES.ipp;
  const kpi         = cached.data.kpi;
  const fin         = cached.data.fin;
  const color       = cached.data.color;
  const announcements = cached.data.ann;
  const codList       = cached.data.cod;
  const mix           = cached.data.mix;
  const fieldSrc    = cached.data.fieldSources || {};  // per-field 'scraped'|'mock'
  const co          = IPP_COMPANY_BY_NAME[company];
  // Company header chip
  const sourceLabel = cached.source === 'scraped'
    ? `REAL · ${cached.scrapedAt ? cached.scrapedAt.slice(0,10) : 'scraped'}`
    : 'MOCK DATA';
  const sourceClass = cached.source === 'scraped' ? 'manual' : 'mock';
  const sourceIcon  = cached.source === 'scraped' ? 'fa-file-lines' : 'fa-flask';
  // Companies list from canonical registry
  const companies   = IPP_COMPANY_NAMES;
  // Helper — source chip for a specific data field
  const _fChip = (field) => fieldSrc[field] === 'scraped'
    ? `<span class="source-chip manual"><i class="fa-solid fa-file-lines"></i> REAL</span>`
    : `<span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>`;
  // BSE link chip (shown when a field came from BSE scrape)
  const _bseChip = () => co?.bseUrl
    ? `<a href="${co.bseUrl}" target="_blank" rel="noopener" class="source-chip manual" style="text-decoration:none"><i class="fa-solid fa-arrow-up-right-from-square"></i> BSE</a>`
    : '';

  el.innerHTML = `
  <!-- Company Selector -->
  <div class="mb-5">
    <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.07em">Select Company</div>
    <div class="company-selector">
      ${companies.map(c => {
        const cColor = IPP_COMPANY_BY_NAME[c]?.color || '#f59e0b';
        return `<div class="company-pill ${c === company ? 'active' : ''}" onclick="renderIPPTab('${c}')"
             style="${c === company ? `background:${cColor};border-color:${cColor}` : ''}">
          ${c}
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- Company Header -->
  <div class="ipp-company-header mb-5">
    <div class="company-logo-placeholder" style="background:${color}">${company.charAt(0)}</div>
    <div style="flex:1">
      <div class="company-info-name">${company}</div>
      <div class="company-info-meta">Listed Renewable Energy Developer · IPP Monitor</div>
    </div>
    <span class="source-chip ${sourceClass}"><i class="fa-solid ${sourceIcon}"></i> ${sourceLabel}</span>
    <span class="source-chip manual"><i class="fa-solid fa-file-lines"></i> Filings Source</span>
  </div>

  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'Operating Capacity', value: kpi.opCapacity, unit: 'MW', delta: kpi.opCapacityDelta||'', dir: kpi.opCapacityDir||'flat', context: kpi.opCapacityContext||'FY YTD commissioned', icon:'fa-plug-circle-check', accentColor: color, iconBg: color.replace('#','rgba(').replace(')','') + ',0.12)' })}
    ${Components.kpiCard({ label:'Under-Construction', value: kpi.ucCapacity, unit: 'MW', delta: kpi.ucCapacityDelta||'', dir: kpi.ucCapacityDir||'flat', context: kpi.ucCapacityContext||'active pipeline', icon:'fa-hard-hat', accentColor:'var(--accent-solar)' })}
    ${Components.kpiCard({ label:'Signed PPA Pipeline', value: kpi.ppa, unit: 'MW', delta: kpi.ppaDelta||'', dir: kpi.ppaDir||'flat', context: kpi.ppaContext||'contracted but UC/pipeline', icon:'fa-handshake', accentColor:'var(--accent-blue)', iconBg:'rgba(59,130,246,0.1)' })}
    ${Components.kpiCard({ label:'Announced Capex', value: kpi.capex, unit: '', delta: kpi.capexPeriod||'', dir: 'flat', context: kpi.capexContext||'3-year capex guidance', icon:'fa-indian-rupee-sign', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)' })}
  </div>

  <!-- Portfolio Mix + Operating vs Pipeline -->
  <div class="grid-2 mb-6">
    <!-- Portfolio Mix -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Portfolio Technology Mix</div>
          <div class="card-subtitle">% of total contracted capacity by type</div>
        </div>
        ${_fChip('mix')}
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center">
          <div class="canvas-wrap" style="height:180px">
            <canvas id="chartPortfolioMix"></canvas>
          </div>
          <div>
            ${Object.entries(mix).map(([k, v], i) => Components.legendRow(
              ['#f59e0b','#3b82f6','#22c55e','#a855f7'][i], k, v + '%'
            )).join('')}
            <div style="margin-top:12px;padding:10px;background:var(--bg-elevated);border-radius:8px">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:3px">Note</div>
              <div style="font-size:11px;color:var(--text-secondary)">${fieldSrc.mix === 'scraped' ? 'Sourced from AGEL investor presentation' : 'Hybrid/FDRE share rising as SECI pipeline evolves'}</div>
            </div>
          </div>
        </div>
        ${_ippSourceFooter(fieldSrc.mix, co?.irUrl, 'AGEL Investor Presentation', cached.scrapedAt)}
      </div>
    </div>

    <!-- Op vs Pipeline Chart -->
    ${Components.chartCard({ id:'chartOpVsPipeline', title:'Operating vs Under-Construction vs PPA Pipeline', subtitle:'MW — staged capacity view', height:260, source:'Company Disclosures' })}
  </div>

  <!-- COD Timeline + Announcements -->
  <div class="grid-2 mb-6">
    <!-- Upcoming COD -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Upcoming COD Timeline</div>
          <div class="card-subtitle">${company} — projects expected to commission</div>
        </div>
        ${_fChip('cod')}
      </div>
      <div class="card-body">
        ${codList.length ? codList.map(c =>
          Components.codItem(c.date, c.project, `${c.mw} MW`)
        ).join('') : `<div class="empty-state" style="padding:20px"><i class="fa-solid fa-calendar-xmark"></i><div class="empty-title">No near-term CODs</div></div>`}
        <div style="margin-top:16px;padding:12px;background:var(--bg-elevated);border-radius:8px">
          <div style="font-size:11px;font-weight:600;color:var(--text-muted)">Total Near-Term Pipeline</div>
          <div style="font-size:20px;font-weight:800;color:var(--text-primary)">${codList.reduce((a,c)=>a+(c.mw||0),0).toLocaleString()} MW</div>
        </div>
        ${_ippSourceFooter(fieldSrc.cod, co?.irUrl, 'AGEL Investor Presentation', cached.scrapedAt)}
      </div>
    </div>

    <!-- Announcements Feed -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Project Wins & Announcements</div>
          <div class="card-subtitle">${company} · recent material events</div>
        </div>
        ${_fChip('ann')}${_bseChip()}
      </div>
      <div class="card-body">
        ${announcements.map(a => {
          const tagHtml = a.bseUrl
            ? `<a href="${a.bseUrl}" target="_blank" rel="noopener" style="font-size:10px;color:var(--accent-blue);text-decoration:none;margin-left:6px">Filing <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i></a>`
            : '';
          return Components.feedItem(a.date, a.title, a.detail, tagHtml);
        }).join('')}
        <div style="margin-top:12px;text-align:center">
          ${co?.bseUrl ? `<a href="${co.bseUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="text-decoration:none"><i class="fa-solid fa-rss"></i> View BSE filings</a>` : `<button class="btn btn-secondary btn-sm" disabled><i class="fa-solid fa-rss"></i> BSE feed</button>`}
        </div>
        ${_ippSourceFooter(fieldSrc.ann, co?.bseUrl, 'BSE Corporate Announcements · 541450', cached.scrapedAt)}
      </div>
    </div>
  </div>

  <!-- Financials + Company Comparison -->
  <div class="grid-2 mb-6">
    <!-- Capex / Leverage / Monetization -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Capex, Leverage & Yield Summary</div>
          <div class="card-subtitle">${company} — FY24-25 estimates</div>
        </div>
        ${_fChip('fin')}
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          ${buildFinancialMetric('Net Debt', fin.netDebt, 'fa-chart-line', fin.netDebtContext)}
          ${buildFinancialMetric('Net Leverage', fin.leverage, 'fa-scale-balanced')}
          ${buildFinancialMetric('Debt/Equity', fin.debtEquity, 'fa-percent')}
          ${buildFinancialMetric('Revenue / Unit', fin.yield, 'fa-coins')}
          ${buildFinancialMetric('Revenue CAGR', fin.revCGR, 'fa-arrow-trend-up', fin.revCGRContext)}
          ${buildFinancialMetric('Capex Guidance', kpi.capex, 'fa-indian-rupee-sign', kpi.capexContext)}
        </div>
        ${fieldSrc.fin !== 'scraped' ? `
        <div style="margin-top:16px;padding:12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:8px;font-size:11px;color:var(--text-secondary)">
          <strong style="color:var(--accent-solar)">Disclosure Note:</strong> Figures are mock placeholders. Run <code style="background:var(--bg-elevated);padding:1px 4px;border-radius:3px">scripts/scrape-ipp-adani-green.mjs</code> to populate live data.
        </div>` : `
        <div style="margin-top:16px;padding:12px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2);border-radius:8px;font-size:11px;color:var(--text-secondary)">
          <strong style="color:var(--status-positive)">Live data.</strong> Sourced from AGEL quarterly results.
          ${co?.irUrl ? `<a href="${co.irUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);margin-left:6px">AGEL IR <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i></a>` : ''}
        </div>`}
        ${_ippSourceFooter(fieldSrc.fin, co?.irUrl, 'AGEL Quarterly Results', cached.scrapedAt)}
      </div>
    </div>

    <!-- Company Comparison Table -->
    ${buildCompanyComparisonTable(d)}
  </div>
  `;

  requestAnimationFrame(() => {
    // Portfolio Mix
    Charts.donut('chartPortfolioMix',
      Object.keys(mix), Object.values(mix),
      ['#f59e0b','#3b82f6','#22c55e','#a855f7']
    );

    // Op vs Pipeline — uses MOCK for all companies until per-company scrape lands
    Charts.bar('chartOpVsPipeline',
      companies,
      [
        { label:'Operating',          data: companies.map(c => { const k = (IPP_COMPANY_CACHE[c]?.data?.kpi || MOCK.ipp.kpis[c]); return k ? parseInt(String(k.opCapacity).replace(/,/g,'')) || 0 : 0; }), color: '#22c55e' },
        { label:'Under-Construction', data: companies.map(c => { const k = (IPP_COMPANY_CACHE[c]?.data?.kpi || MOCK.ipp.kpis[c]); return k ? parseInt(String(k.ucCapacity).replace(/,/g,'')) || 0 : 0; }), color: '#f59e0b' },
      ],
      { yLabel: 'MW' }
    );
  });
}

function buildFinancialMetric(label, value, icon, context) {
  return `
  <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:14px">
    <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">
      <i class="fa-solid ${icon}" style="margin-right:4px"></i>${label}
    </div>
    <div style="font-size:16px;font-weight:800;color:var(--text-primary)">${value || '—'}</div>
    ${context ? `<div style="font-size:10px;color:var(--text-disabled);margin-top:3px">${context}</div>` : ''}
  </div>`;
}

/* Source footer for IPP blocks — shows real chip+link when scraped, mock chip otherwise. */
function _ippSourceFooter(fieldSource, sourceUrl, sourceLabel, scrapedAt) {
  const isReal = fieldSource === 'scraped';
  const dateStr = scrapedAt ? new Date(scrapedAt).toISOString().slice(0,10) : null;
  const chip = isReal
    ? `<span class="source-chip manual"><i class="fa-solid fa-file-lines"></i> REAL</span>`
    : `<span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>`;
  const srcText = isReal && sourceUrl
    ? `Source: <a href="${sourceUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">${sourceLabel} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i></a>`
    : `Source: ${sourceLabel}`;
  const stamp = isReal && dateStr ? `Scraped ${dateStr}` : (isReal ? 'Scraped' : 'Mock data');
  return `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;margin-top:8px;border-top:1px solid var(--border-subtle);flex-wrap:wrap">
      ${chip}
      <span class="chart-source">${srcText}</span>
      <span class="chart-source" style="margin-left:auto">${stamp}</span>
    </div>`;
}

function buildCompanyComparisonTable(d) {
  return `
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Company Comparison Table</div>
        <div class="card-subtitle">All listed / major IPPs — side-by-side</div>
      </div>
      <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr>
          <th>Company</th>
          <th class="number">Op. (MW)</th>
          <th class="number">UC (MW)</th>
          <th class="number">PPA (MW)</th>
          <th>Net Debt</th>
          <th>Leverage</th>
          <th>Rev CAGR</th>
        </tr></thead>
        <tbody>
          ${IPP_COMPANY_NAMES.map(c => {
            // Use cached scraped data if available, otherwise fall back to mock
            const cached = IPP_COMPANY_CACHE[c];
            const kpi   = (cached?.data?.kpi)   || d.kpis[c]       || { opCapacity:'—', ucCapacity:'—', ppa:'—' };
            const fin   = (cached?.data?.fin)   || d.financials[c]  || { netDebt:'—', leverage:'—', revCGR:'—' };
            const color = IPP_COMPANY_BY_NAME[c]?.color || d.companyColors[c] || '#f59e0b';
            return `<tr>
              <td><span style="color:${color};font-weight:700">${c}</span></td>
              <td class="number mono">${kpi.opCapacity}</td>
              <td class="number mono">${kpi.ucCapacity}</td>
              <td class="number mono">${kpi.ppa}</td>
              <td class="mono">${fin.netDebt}</td>
              <td class="mono" style="color:${parseFloat(fin.leverage) > 6 ? 'var(--status-negative)' : parseFloat(fin.leverage) > 4 ? 'var(--status-warning)' : 'var(--status-positive)'}">${fin.leverage}</td>
              <td class="mono" style="color:var(--status-positive)">${fin.revCGR}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
