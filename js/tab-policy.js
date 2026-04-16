/* ═══════════════════════════════════════════════════════════════════════════
   TAB 5 — Policy & Regulation Monitor
   All 5 blocks driven by a single normalized POLICY_DATASET.
   Live refresh via Anthropic Claude API (only CORS-enabled path for static host).
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Authority config ──────────────────────────────────────────────────── */
const POLICY_AUTH = {
  MNRE:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'MNRE'  },
  CERC:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'CERC'  },
  MoP:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'MoP'   },
  DGTR:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'DGTR'  },
  CBIC:  { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  label: 'CBIC'  },
};

const POLICY_IMPACT_CFG = {
  High:    { cls: 'tag-watchlist', label: '▲ High',    dot: '#ef4444' },
  Medium:  { cls: 'tag-warning',   label: '◆ Medium',  dot: '#f59e0b' },
  Low:     { cls: 'tag-info',      label: '▼ Low',     dot: '#3b82f6' },
  Neutral: { cls: 'tag-neutral',   label: '→ Neutral', dot: '#6b7280' },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function _fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'UTC' });
}
function _daysFromNow(iso) {
  if (!iso) return null;
  const diff = new Date(iso + 'T00:00:00Z') - Date.now();
  return Math.round(diff / 86400000);
}
function _authBadge(auth) {
  const c = POLICY_AUTH[auth] || { color:'#6b7280', bg:'rgba(107,114,128,0.1)', label: auth };
  return `<span style="display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;background:${c.bg};color:${c.color}">${c.label}</span>`;
}
function _impactTag(tag) {
  const c = POLICY_IMPACT_CFG[tag] || POLICY_IMPACT_CFG.Neutral;
  return `<span class="tag ${c.cls}">${c.label}</span>`;
}
function _docTypeBadge(dt) {
  return `<span style="font-size:10px;color:var(--text-muted);font-style:italic">${dt}</span>`;
}

/* ─── Derived metrics from dataset ─────────────────────────────────────── */
function _derive(dataset) {
  const now = Date.now();
  const sorted = [...dataset].sort((a, b) => b.date.localeCompare(a.date));
  const byAuth = {};
  for (const n of sorted) byAuth[n.authority] = (byAuth[n.authority] || 0) + 1;
  const highImpact  = sorted.filter(n => n.impactTag === 'High');
  const upcoming    = sorted.filter(n => {
    const d = n.complianceDeadline || n.effectiveDate;
    if (!d) return false;
    const diff = new Date(d + 'T00:00:00Z') - now;
    return diff > 0 && diff < 180 * 86400000;  // next 180 days
  }).sort((a, b) => {
    const da = a.complianceDeadline || a.effectiveDate;
    const db = b.complianceDeadline || b.effectiveDate;
    return da.localeCompare(db);
  });
  const recent90    = sorted.filter(n => {
    const diff = now - new Date(n.date + 'T00:00:00Z');
    return diff < 90 * 86400000;
  });
  return { sorted, byAuth, highImpact, upcoming, recent90 };
}

/* ─── Refresh state UI ──────────────────────────────────────────────────── */
function _refreshStatusHtml() {
  const hasKey = !!(POLICY_API_KEY && POLICY_API_KEY.trim());
  const isLive = POLICY_REFRESH_MODE === 'live';
  if (POLICY_LAST_REFRESHED) {
    const t = POLICY_LAST_REFRESHED.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const d = POLICY_LAST_REFRESHED.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    return `<span style="color:var(--status-positive);font-size:11px"><i class="fa-solid fa-circle-check"></i> Live · refreshed ${d}, ${t}</span>`;
  }
  if (hasKey) {
    return `<span style="color:var(--text-secondary);font-size:11px"><i class="fa-solid fa-key"></i> API key set · seed data shown · click Refresh for live data</span>`;
  }
  return `<span style="color:var(--text-muted);font-size:11px"><i class="fa-solid fa-clock"></i> Seed data · as of ${POLICY_SEED_AS_OF}</span>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCK 1 — Policy & Regulation Timeline
   ══════════════════════════════════════════════════════════════════════════ */
function _renderTimeline(sorted) {
  const items = sorted.slice(0, 12);
  const rows  = items.map(n => {
    const a  = POLICY_AUTH[n.authority] || { color:'#6b7280' };
    const ed = n.effectiveDate   ? `<div style="font-size:10px;color:var(--text-muted);margin-top:3px"><i class="fa-regular fa-calendar-check" style="color:${a.color};margin-right:4px"></i>Effective ${_fmtDate(n.effectiveDate)}</div>` : '';
    const dl = n.complianceDeadline ? `<div style="font-size:10px;color:var(--status-warning);margin-top:2px"><i class="fa-solid fa-hourglass-half" style="margin-right:4px"></i>Deadline ${_fmtDate(n.complianceDeadline)}</div>` : '';
    return `
    <div class="timeline-item">
      <div class="timeline-marker" style="background:${a.color}"></div>
      <div class="timeline-content">
        <div class="timeline-date">${_fmtDate(n.date)}</div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px">
          ${_authBadge(n.authority)}
          ${_impactTag(n.impactTag)}
          ${_docTypeBadge(n.documentType)}
        </div>
        <div class="timeline-title">
          <a href="${n.sourceUrl}" target="_blank" rel="noopener"
             style="color:var(--text-primary);text-decoration:none;font-weight:600;font-size:13px;line-height:1.4">
            ${n.title}
          </a>
        </div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;line-height:1.5">${n.summary}</div>
        ${ed}${dl}
      </div>
    </div>`;
  }).join('');
  return `
  <div class="card" style="grid-column:span 2">
    <div class="card-header">
      <div>
        <div class="card-title">Policy &amp; Regulation Timeline</div>
        <div class="card-subtitle">Latest ${items.length} notices — chronological, newest first · click any title to open official source</div>
      </div>
      <span id="policy-source-chip" class="source-chip ${POLICY_REFRESH_MODE === 'live' ? 'manual' : 'mock'}"
            style="cursor:default">
        <i class="fa-solid ${POLICY_REFRESH_MODE === 'live' ? 'fa-rotate' : 'fa-database'}"></i>
        ${POLICY_REFRESH_MODE === 'live' ? 'LIVE' : 'SEED'}
      </span>
    </div>
    <div class="card-body">
      <div class="timeline" style="max-height:520px;overflow-y:auto;padding-right:4px">${rows}</div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCK 2 — Regulation Detail Table
   ══════════════════════════════════════════════════════════════════════════ */
function _renderTable(sorted) {
  const rows = sorted.map(n => `
    <tr>
      <td>${_authBadge(n.authority)}</td>
      <td class="mono" style="font-size:11px;color:var(--text-muted);white-space:nowrap">${_fmtDate(n.date)}</td>
      <td><span class="tag tag-info" style="font-size:10px">${n.category}</span></td>
      <td style="font-size:12px;font-weight:500;color:var(--text-primary);max-width:260px">
        <a href="${n.sourceUrl}" target="_blank" rel="noopener"
           style="color:var(--text-primary);text-decoration:none;line-height:1.4">${n.title}</a>
      </td>
      <td style="font-size:10px;color:var(--text-secondary);max-width:180px;line-height:1.4">${_docTypeBadge(n.documentType)}</td>
      <td style="white-space:nowrap;font-size:11px;color:var(--text-muted)">${n.effectiveDate   ? _fmtDate(n.effectiveDate)   : '—'}</td>
      <td style="white-space:nowrap;font-size:11px;color:${n.complianceDeadline ? 'var(--status-warning)' : 'var(--text-muted)'}">${n.complianceDeadline ? _fmtDate(n.complianceDeadline) : '—'}</td>
      <td>${_impactTag(n.impactTag)}</td>
    </tr>`).join('');
  return `
  <div class="card mb-6">
    <div class="card-header">
      <div>
        <div class="card-title">Regulation &amp; Notice Detail Table</div>
        <div class="card-subtitle">All ${sorted.length} tracked notices — click any title to open official source</div>
      </div>
      <span class="source-chip ${POLICY_REFRESH_MODE === 'live' ? 'manual' : 'mock'}">
        <i class="fa-solid ${POLICY_REFRESH_MODE === 'live' ? 'fa-rotate' : 'fa-database'}"></i>
        ${POLICY_REFRESH_MODE === 'live' ? 'LIVE · API' : 'SEED · REAL'}
      </span>
    </div>
    <div class="card-body" style="padding:0;overflow-x:auto">
      <table class="data-table" style="min-width:860px">
        <thead><tr>
          <th>Authority</th>
          <th>Date</th>
          <th>Category</th>
          <th>Title</th>
          <th>Doc Type</th>
          <th>Effective</th>
          <th>Deadline</th>
          <th>Impact</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCK 3 — Category Cards (grouped by authority × category)
   ══════════════════════════════════════════════════════════════════════════ */
function _renderCategoryCards(dataset) {
  const byAuth = {};
  for (const n of dataset) {
    if (!byAuth[n.authority]) byAuth[n.authority] = [];
    byAuth[n.authority].push(n);
  }

  const authOrder = ['MNRE','CERC','MoP','DGTR','CBIC'];
  const cards = authOrder.filter(a => byAuth[a]).map(auth => {
    const notices = byAuth[auth];
    const ac = POLICY_AUTH[auth] || { color:'#6b7280', bg:'rgba(107,114,128,0.1)' };
    const cats = [...new Set(notices.map(n => n.category))];
    const high = notices.filter(n => n.impactTag === 'High').length;
    const latest = notices.reduce((a, b) => a.date > b.date ? a : b);
    return `
    <div class="card" style="border-top:3px solid ${ac.color}">
      <div class="card-header" style="padding-bottom:8px">
        <div>
          <div class="card-title" style="font-size:15px">${_authBadge(auth)}</div>
          <div class="card-subtitle" style="margin-top:4px">${notices.length} notice${notices.length !== 1 ? 's' : ''} tracked</div>
        </div>
        ${high > 0 ? `<span class="tag tag-watchlist" style="font-size:10px">${high} High</span>` : ''}
      </div>
      <div class="card-body" style="padding-top:0">
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
          ${cats.map(c => `<span class="tag tag-info" style="font-size:10px">${c}</span>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;border-top:1px solid var(--border-subtle);padding-top:8px">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:3px;font-size:12px">Latest: ${_fmtDate(latest.date)}</div>
          <div style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${latest.title}</div>
          <div style="margin-top:6px">${_impactTag(latest.impactTag)}</div>
        </div>
      </div>
    </div>`;
  });

  return `
  <div class="mb-6">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--text-primary)">Regulation Category Cards</div>
        <div style="font-size:12px;color:var(--text-secondary)">Grouped by authority — latest notice per authority</div>
      </div>
      <span class="source-chip ${POLICY_REFRESH_MODE === 'live' ? 'manual' : 'mock'}">
        <i class="fa-solid ${POLICY_REFRESH_MODE === 'live' ? 'fa-rotate' : 'fa-database'}"></i>
        ${POLICY_REFRESH_MODE === 'live' ? 'LIVE' : 'SEED'}
      </span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">
      ${cards.join('')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCK 4 — Deadline / Compliance Tracker
   ══════════════════════════════════════════════════════════════════════════ */
function _renderDeadlineTracker(sorted) {
  const now = Date.now();
  const withDates = sorted.filter(n => n.complianceDeadline || n.effectiveDate)
    .map(n => ({
      ...n,
      _ref:  n.complianceDeadline || n.effectiveDate,
      _type: n.complianceDeadline ? 'Compliance Deadline' : 'Effective Date',
    }))
    .sort((a, b) => a._ref.localeCompare(b._ref));

  const rows = withDates.map(n => {
    const days = _daysFromNow(n._ref);
    const ac   = POLICY_AUTH[n.authority] || { color: '#6b7280' };
    let statusCls, statusLabel, icon;
    if (days === null)       { statusCls = ''; statusLabel = ''; icon = ''; }
    else if (days < 0)       { statusCls = 'deadline-overdue'; statusLabel = `${Math.abs(days)}d ago`;    icon = '⏰'; }
    else if (days <= 30)     { statusCls = 'deadline-overdue'; statusLabel = `${days}d`;     icon = '🔴'; }
    else if (days <= 90)     { statusCls = 'deadline-soon';    statusLabel = `${days}d`;     icon = '🟡'; }
    else                     { statusCls = 'deadline-ok';      statusLabel = `${days}d`;     icon = '🟢'; }

    return `
    <div class="deadline-row ${statusCls}" style="display:grid;grid-template-columns:120px 1fr 100px;gap:12px;align-items:start;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
      <div>
        <div style="font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--text-primary)">${_fmtDate(n._ref)}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${n._type}</div>
      </div>
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          ${_authBadge(n.authority)}
          <span style="font-size:10px;color:var(--text-muted)">${n.category}</span>
        </div>
        <div style="font-size:11px;color:var(--text-primary);font-weight:500;line-height:1.4">${n.title}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;font-weight:700;color:${days !== null && days <= 30 ? 'var(--status-negative)' : days !== null && days <= 90 ? 'var(--status-warning)' : 'var(--status-positive)'}">${icon} ${statusLabel}</div>
        ${_impactTag(n.impactTag)}
      </div>
    </div>`;
  }).join('');

  const empty = withDates.length === 0 ? '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No notices with stated deadlines or effective dates in current dataset.</div>' : '';

  return `
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Deadline / Compliance Tracker</div>
        <div class="card-subtitle">${withDates.length} notices with stated deadlines or effective dates</div>
      </div>
      <span class="source-chip ${POLICY_REFRESH_MODE === 'live' ? 'manual' : 'mock'}">
        <i class="fa-solid fa-calendar-days"></i> TRACKER
      </span>
    </div>
    <div class="card-body" style="max-height:380px;overflow-y:auto">
      ${rows || empty}
    </div>
    <div style="padding:8px 16px;border-top:1px solid var(--border-subtle);font-size:10px;color:var(--text-muted)">
      🔴 ≤30 days &nbsp;·&nbsp; 🟡 31–90 days &nbsp;·&nbsp; 🟢 >90 days &nbsp;·&nbsp; ⏰ Past &nbsp;·&nbsp; Only dates explicitly stated in official documents shown.
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCK 5 — Watchlist / Impact Panel
   ══════════════════════════════════════════════════════════════════════════ */
function _renderWatchlist(sorted) {
  const high   = sorted.filter(n => n.impactTag === 'High');
  const medium = sorted.filter(n => n.impactTag === 'Medium');

  const rows = (high.length ? high : medium.slice(0, 5)).map(n => {
    const ac = POLICY_AUTH[n.authority] || { color:'#6b7280', bg:'rgba(107,114,128,0.1)' };
    const dl = n.complianceDeadline
      ? `<div style="font-size:10px;margin-top:4px;color:var(--status-warning)"><i class="fa-solid fa-hourglass-half"></i> Deadline: ${_fmtDate(n.complianceDeadline)}</div>`
      : (n.effectiveDate ? `<div style="font-size:10px;margin-top:4px;color:var(--text-muted)"><i class="fa-regular fa-calendar-check"></i> Effective: ${_fmtDate(n.effectiveDate)}</div>` : '');
    return `
    <div style="border-left:3px solid ${ac.color};padding:10px 12px;margin-bottom:10px;background:${ac.bg};border-radius:0 6px 6px 0">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
        ${_authBadge(n.authority)}
        ${_impactTag(n.impactTag)}
        <span style="font-size:10px;color:var(--text-muted)">${_fmtDate(n.date)}</span>
      </div>
      <div style="font-size:12px;font-weight:600;color:var(--text-primary);line-height:1.4;margin-bottom:4px">
        <a href="${n.sourceUrl}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${n.title}</a>
      </div>
      <div style="font-size:11px;color:var(--text-secondary);line-height:1.5">${n.summary}</div>
      ${dl}
    </div>`;
  }).join('');

  const empty = !high.length && !medium.length
    ? '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No high or medium impact notices in current dataset.</div>'
    : '';

  return `
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">Watchlist / Impact Panel</div>
        <div class="card-subtitle">${high.length} High-impact · ${medium.length} Medium-impact notices</div>
      </div>
      <span class="tag tag-watchlist" style="font-size:11px">${high.length} High</span>
    </div>
    <div class="card-body" style="max-height:380px;overflow-y:auto">
      ${rows || empty}
    </div>
    <div style="padding:8px 16px;border-top:1px solid var(--border-subtle);font-size:10px;color:var(--text-muted)">
      ${high.length ? 'Showing High-impact notices only.' : 'No High-impact notices; showing Medium-impact.'} &nbsp;·&nbsp; Click any title to open the official source.
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════════════════
   RENDER FULL TAB
   ══════════════════════════════════════════════════════════════════════════ */
function renderPolicyTab() {
  const el = document.getElementById('tab-policy');
  if (!el) return;

  const { sorted, highImpact, upcoming, recent90, byAuth } = _derive(POLICY_DATASET);

  /* ── KPI row ── */
  const kpiHtml = `
  <div class="grid-4 mb-6">
    ${Components.kpiCard({
      label: 'Total Notices Tracked',
      value: sorted.length,
      delta: `${Object.keys(byAuth).length} authorities`,
      dir: 'flat',
      context: 'Across MNRE, CERC, MoP, DGTR, CBIC',
      icon: 'fa-gavel', accentColor: 'var(--accent-solar)',
    })}
    ${Components.kpiCard({
      label: 'High-Impact Notices',
      value: highImpact.length,
      delta: highImpact.length > 0 ? 'Require attention' : 'None flagged',
      dir: highImpact.length > 0 ? 'up' : 'flat',
      context: 'Immediate compliance obligations or duty changes',
      icon: 'fa-triangle-exclamation', accentColor: 'var(--status-negative)', iconBg: 'rgba(239,68,68,0.1)',
    })}
    ${Components.kpiCard({
      label: 'Upcoming Deadlines',
      value: upcoming.length,
      delta: upcoming.length > 0 ? `Next: ${_fmtDate(upcoming[0]._ref || upcoming[0].complianceDeadline || upcoming[0].effectiveDate)}` : 'None in 180 days',
      dir: upcoming.length > 0 ? 'up' : 'flat',
      context: 'Effective dates & compliance deadlines in next 180 days',
      icon: 'fa-calendar-days', accentColor: 'var(--status-warning)', iconBg: 'rgba(245,158,11,0.1)',
    })}
    ${Components.kpiCard({
      label: 'Notices (Last 90 Days)',
      value: recent90.length,
      delta: POLICY_REFRESH_MODE === 'live' ? 'Live data' : `Seed · ${POLICY_SEED_AS_OF}`,
      dir: 'flat',
      context: 'Recent regulatory activity in India solar sector',
      icon: 'fa-rotate', accentColor: 'var(--accent-blue)', iconBg: 'rgba(59,130,246,0.1)',
    })}
  </div>`;

  /* ── Refresh header bar ── */
  const hasKey = !!(POLICY_API_KEY && POLICY_API_KEY.trim());
  const refreshBar = `
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px;padding:12px 16px;background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:10px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <div style="font-weight:700;color:var(--text-primary);font-size:14px">
        <i class="fa-solid fa-shield-halved" style="color:var(--accent-solar);margin-right:6px"></i>
        Policy &amp; Regulation Monitor
      </div>
      <div id="policy-refresh-status">${_refreshStatusHtml()}</div>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <button id="policy-refresh-btn"
        style="display:flex;align-items:center;gap:6px;padding:7px 16px;border-radius:7px;border:1px solid var(--accent-blue);background:rgba(59,130,246,0.1);color:var(--accent-blue);font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s"
        onmouseover="this.style.background='rgba(59,130,246,0.2)'"
        onmouseout="this.style.background='rgba(59,130,246,0.1)'">
        <i class="fa-solid fa-rotate"></i> Refresh Live
      </button>
      ${!hasKey ? `<span style="font-size:10px;color:var(--text-muted);max-width:200px;line-height:1.3">
        Set <code style="background:var(--bg-tertiary);padding:1px 4px;border-radius:3px">POLICY_API_KEY</code> in
        <code style="background:var(--bg-tertiary);padding:1px 4px;border-radius:3px">real-data-policy.js</code>
        to enable live refresh
      </span>` : ''}
    </div>
  </div>`;

  const upcomingForDeadline = sorted.filter(n => n.complianceDeadline || n.effectiveDate)
    .map(n => ({
      ...n,
      _ref:  n.complianceDeadline || n.effectiveDate,
      _type: n.complianceDeadline ? 'Compliance Deadline' : 'Effective Date',
    })).sort((a, b) => a._ref.localeCompare(b._ref));

  el.innerHTML = `
  ${refreshBar}
  ${kpiHtml}

  <!-- Timeline spans full width -->
  <div class="mb-6" style="display:grid;gap:16px">
    ${_renderTimeline(sorted)}
  </div>

  <!-- Category Cards -->
  ${_renderCategoryCards(sorted)}

  <!-- Deadline Tracker + Watchlist -->
  <div class="grid-2 mb-6">
    ${_renderDeadlineTracker(upcomingForDeadline.length ? null : sorted)}
    ${_renderWatchlist(sorted)}
  </div>

  <!-- Detail Table -->
  ${_renderTable(sorted)}
  `;

  // Fix deadline tracker: pass sorted array
  _patchDeadlineTracker(sorted);

  // Bind refresh
  _bindRefresh();
}

/* Patch: re-render deadline tracker with correct args */
function _patchDeadlineTracker(sorted) {
  const now = Date.now();
  const withDates = sorted.filter(n => n.complianceDeadline || n.effectiveDate)
    .map(n => ({
      ...n,
      _ref:  n.complianceDeadline || n.effectiveDate,
      _type: n.complianceDeadline ? 'Compliance Deadline' : 'Effective Date',
    })).sort((a, b) => a._ref.localeCompare(b._ref));

  // Find and re-render just the deadline tracker card body
  const tracker = document.querySelector('[data-block="deadlines"]');
  if (tracker) {
    tracker.innerHTML = withDates.length ? withDates.map(n => {
      const days = _daysFromNow(n._ref);
      const ac   = POLICY_AUTH[n.authority] || { color: '#6b7280' };
      let statusLabel, icon;
      if (days === null)   { statusLabel = ''; icon = ''; }
      else if (days < 0)   { statusLabel = `${Math.abs(days)}d ago`; icon = '⏰'; }
      else if (days <= 30) { statusLabel = `${days}d`;  icon = '🔴'; }
      else if (days <= 90) { statusLabel = `${days}d`;  icon = '🟡'; }
      else                 { statusLabel = `${days}d`;  icon = '🟢'; }
      const dl = n.complianceDeadline
        ? `<div style="font-size:10px;margin-top:4px;color:var(--status-warning)">⚠ Deadline: ${_fmtDate(n.complianceDeadline)}</div>`
        : `<div style="font-size:10px;margin-top:4px;color:var(--text-muted)">Effective: ${_fmtDate(n.effectiveDate)}</div>`;
      return `<div style="display:grid;grid-template-columns:110px 1fr 80px;gap:10px;align-items:start;padding:8px 0;border-bottom:1px solid var(--border-subtle)">
        <div>
          <div style="font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace">${_fmtDate(n._ref)}</div>
          <div style="font-size:9px;color:var(--text-muted);margin-top:2px">${n._type}</div>
        </div>
        <div>
          <div style="display:flex;gap:5px;margin-bottom:3px;flex-wrap:wrap">${_authBadge(n.authority)}<span style="font-size:10px;color:var(--text-muted)">${n.category}</span></div>
          <div style="font-size:11px;color:var(--text-primary);font-weight:500;line-height:1.3">${n.title}</div>
          ${dl}
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;font-weight:700;color:${days !== null && days <= 30 ? 'var(--status-negative)' : days !== null && days <= 90 ? 'var(--status-warning)' : 'var(--status-positive)'}">${icon} ${statusLabel}</div>
          ${_impactTag(n.impactTag)}
        </div>
      </div>`;
    }).join('') : '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:12px">No notices with stated deadlines in current dataset.</div>';
  }
}

/* ── Refresh button binding ─────────────────────────────────────────────── */
function _bindRefresh() {
  const btn = document.getElementById('policy-refresh-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const hasKey = !!(POLICY_API_KEY && POLICY_API_KEY.trim());

    if (!hasKey) {
      _showRefreshToast(
        '⚙ API key not configured',
        'Paste your Anthropic API key into POLICY_API_KEY in js/real-data-policy.js, then redeploy. See console.anthropic.com to obtain a key.',
        'warn',
      );
      return;
    }

    // Loading state
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Searching official sources…';
    btn.style.opacity = '0.7';

    const statusEl = document.getElementById('policy-refresh-status');
    if (statusEl) statusEl.innerHTML = '<span style="color:var(--accent-blue);font-size:11px"><i class="fa-solid fa-rotate fa-spin"></i> Searching MNRE, CERC, MoP, DGTR, CBIC…</span>';

    try {
      const fresh = await policyLiveRefresh();
      POLICY_DATASET      = fresh;
      POLICY_LAST_REFRESHED = new Date();
      POLICY_REFRESH_MODE   = 'live';

      // Re-render
      renderPolicyTab();
      _showRefreshToast('✓ Live data loaded', `${fresh.length} notices fetched from official sources.`, 'ok');
    } catch (err) {
      const isNoKey = err.message === 'NO_API_KEY';
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Refresh Live';
      btn.style.opacity = '1';
      if (statusEl) statusEl.innerHTML = _refreshStatusHtml();
      _showRefreshToast(
        isNoKey ? '⚙ API key missing' : '✗ Refresh failed',
        isNoKey ? 'Set POLICY_API_KEY in real-data-policy.js.' : `Error: ${err.message}`,
        'err',
      );
    }
  });
}

function _showRefreshToast(title, body, type) {
  const existing = document.getElementById('policy-toast');
  if (existing) existing.remove();

  const colors = { ok:'#22c55e', warn:'#f59e0b', err:'#ef4444' };
  const color  = colors[type] || '#6b7280';
  const toast  = document.createElement('div');
  toast.id = 'policy-toast';
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:var(--bg-secondary);border:1px solid ${color};
    border-left:4px solid ${color};border-radius:8px;
    padding:14px 20px;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.3);
    animation:fadeIn 0.2s ease`;
  toast.innerHTML = `
    <div style="font-weight:700;color:${color};margin-bottom:4px;font-size:13px">${title}</div>
    <div style="font-size:12px;color:var(--text-secondary);line-height:1.5">${body}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 7000);
}

/* ══════════════════════════════════════════════════════════════════════════
   ENTRY POINT
   ══════════════════════════════════════════════════════════════════════════ */
function initPolicyTab() {
  const el = document.getElementById('tab-policy');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';
  renderPolicyTab();
}
