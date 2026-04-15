/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS — KPI cards, tables, panels, etc.
   ═══════════════════════════════════════════════════════════════════════════ */

const Components = {

  /* ── KPI Card ── */
  kpiCard(opts = {}) {
    const {
      label = 'Metric',
      value = '—',
      unit = '',
      delta = '',
      dir = 'flat',    // 'up' | 'down' | 'flat'
      context = '',
      icon = 'fa-chart-line',
      accentColor = 'var(--accent-solar)',
      iconBg = 'rgba(245,158,11,0.1)',
      negativeGood = false,
      source = '',
    } = opts;

    const deltaClass = dir === 'flat' ? 'flat' : (
      (dir === 'up' && !negativeGood) || (dir === 'down' && negativeGood) ? 'up' : 'down'
    );
    const deltaIcon = dir === 'up' ? 'fa-arrow-up' : dir === 'down' ? 'fa-arrow-down' : 'fa-minus';

    return `
    <div class="kpi-card" style="--kpi-accent:${accentColor}; --kpi-icon-bg:${iconBg}">
      <div class="kpi-header">
        <div class="kpi-label">${label}</div>
        <div class="kpi-icon"><i class="fa-solid ${icon}"></i></div>
      </div>
      <div class="kpi-value">${value}${unit ? `<span class="kpi-unit">${unit}</span>` : ''}</div>
      <div class="kpi-footer">
        ${delta ? `<span class="kpi-delta ${deltaClass}"><i class="fa-solid ${deltaIcon}"></i> ${delta}</span>` : ''}
        ${context ? `<span class="kpi-context">${context}</span>` : ''}
      </div>
      ${source ? `<div style="margin-top:8px"><span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span></div>` : ''}
    </div>`;
  },

  /* ── Chart Card Wrapper ── */
  chartCard(opts = {}) {
    const { id, title, subtitle = '', height = 280, source = '', controls = '', footer = '', extraClass = '' } = opts;
    return `
    <div class="chart-card ${extraClass}">
      <div class="chart-header">
        <div>
          <div class="chart-title">${title}</div>
          ${subtitle ? `<div class="chart-subtitle">${subtitle}</div>` : ''}
        </div>
        ${controls ? `<div class="chart-controls">${controls}</div>` : ''}
      </div>
      <div class="chart-body">
        <div class="canvas-wrap" style="position:relative;height:${height}px">
          <canvas id="${id}"></canvas>
        </div>
      </div>
      <div class="chart-footer">
        <span class="chart-source">${source ? `Source: ${source}` : 'Source: Mock Data'}</span>
        ${footer}
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
    </div>`;
  },

  /* ── Table Card Wrapper ── */
  tableCard(opts = {}) {
    const { title, subtitle = '', source = '', actions = '', body = '' } = opts;
    return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${title}</div>
          ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${actions}
          <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
        </div>
      </div>
      <div class="data-table-wrap">
        ${body}
      </div>
      ${source ? `<div style="padding:10px 20px;border-top:1px solid var(--border-subtle)">
        <span class="chart-source">Source: ${source}</span>
      </div>` : ''}
    </div>`;
  },

  /* ── Info Panel ── */
  infoPanel(opts = {}) {
    const { type = '', title = '', content = '' } = opts;
    return `
    <div class="info-panel ${type ? 'panel-'+type : ''}">
      ${title ? `<div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:8px">${title}</div>` : ''}
      ${content}
    </div>`;
  },

  /* ── Section Header ── */
  sectionHeader(title, subtitle = '', actions = '') {
    return `
    <div class="section-header">
      <div>
        <div class="section-title">${title}</div>
        ${subtitle ? `<div class="section-subtitle">${subtitle}</div>` : ''}
      </div>
      ${actions ? `<div class="section-actions">${actions}</div>` : ''}
    </div>`;
  },

  /* ── State Bar Row ── */
  stateBar(state, val, pct, color = 'var(--accent-solar)', unit = 'GW') {
    return `
    <div class="state-bar-item">
      <span class="state-bar-label">${state}</span>
      <div class="state-bar-track">
        <div class="state-bar-fill" style="--bar-color:${color};width:${pct}%"></div>
      </div>
      <span class="state-bar-val">${val} ${unit}</span>
    </div>`;
  },

  /* ── Progress Bar ── */
  progressBar(pct, color = 'var(--accent-solar)') {
    return `
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="--pb-color:${color};width:${pct}%"></div>
    </div>`;
  },

  /* ── Tag ── */
  tag(text, type = 'neutral') {
    return `<span class="tag tag-${type}">${text}</span>`;
  },

  /* ── Delta ── */
  delta(text, dir = 'flat') {
    const icon = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
    return `<span class="delta delta-${dir}">${icon} ${text}</span>`;
  },

  /* ── Feed Item ── */
  feedItem(date, title, detail, tagHtml = '') {
    return `
    <div class="feed-item">
      <div class="feed-date">${date} ${tagHtml}</div>
      <div class="feed-title">${title}</div>
      ${detail ? `<div class="feed-detail">${detail}</div>` : ''}
    </div>`;
  },

  /* ── COD Item ── */
  codItem(date, project, meta) {
    return `
    <div class="cod-item">
      <div class="cod-date">${date}</div>
      <div class="cod-body">
        <div class="cod-project">${project}</div>
        <div class="cod-meta">${meta}</div>
      </div>
    </div>`;
  },

  /* ── Timeline Item ── */
  timelineItem(date, title, detail, color = 'var(--accent-solar)', tagHtml = '') {
    return `
    <div class="timeline-item">
      <div class="timeline-dot" style="--dot-color:${color}"></div>
      <div class="timeline-date">${date}</div>
      <div class="timeline-content">${title} ${tagHtml}</div>
      ${detail ? `<div class="timeline-detail">${detail}</div>` : ''}
    </div>`;
  },

  /* ── Risk Flag ── */
  riskFlag(level, icon, title, detail) {
    return `
    <div class="risk-flag ${level}">
      <div class="risk-flag-icon"><i class="fa-solid ${icon}"></i></div>
      <div class="risk-flag-body">
        <div class="risk-flag-title">${title}</div>
        <div class="risk-flag-detail">${detail}</div>
      </div>
    </div>`;
  },

  /* ── Donut Legend Row ── */
  legendRow(color, label, val) {
    return `
    <div class="legend-row">
      <div class="legend-dot" style="background:${color}"></div>
      <span class="legend-label">${label}</span>
      <span class="legend-val">${val}</span>
    </div>`;
  },

  /* ── Deadline Row ── */
  deadlineRow(date, event, daysText, statusClass) {
    return `
    <div class="deadline-row">
      <div class="deadline-date">${date}</div>
      <div class="deadline-event">${event}</div>
      <div class="deadline-days ${statusClass}">${daysText}</div>
    </div>`;
  },

  /* ── Source Footer ── */
  sourceFooter(source, tab) {
    const meta = DATA_SOURCES[tab] || {};
    return `
    <div style="display:flex;align-items:center;gap:12px;padding:10px 0;margin-top:8px;border-top:1px solid var(--border-subtle)">
      <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      <span class="chart-source">Source: ${source || meta.label || 'Mock Data'}</span>
      <span class="chart-source" style="margin-left:auto">Updated: ${meta.updated || '14 Apr 2025'}</span>
    </div>`;
  },

  /* ── Rank Badge ── */
  rankBadge(n) {
    const cls = n === 1 ? 'r1' : n === 2 ? 'r2' : n === 3 ? 'r3' : '';
    return `<span class="rank-badge ${cls}">${n}</span>`;
  },

  /* ── Unavailable Placeholder ── */
  unavailable(msg = 'Data unavailable in mock mode') {
    return `
    <div class="empty-state" style="padding:40px 20px">
      <i class="fa-solid fa-circle-xmark"></i>
      <div class="empty-title">Data Not Connected</div>
      <div class="empty-desc">${msg}</div>
    </div>`;
  }
};
