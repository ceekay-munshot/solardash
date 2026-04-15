/* ═══════════════════════════════════════════════════════════════════════════
   TAB 6 — Policy & Regulation Monitor
   ═══════════════════════════════════════════════════════════════════════════ */

function initPolicyTab() {
  const el = document.getElementById('tab-policy');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.policy;
  const src = DATA_SOURCES.policy;

  el.innerHTML = `
  <!-- KPI Row -->
  <div class="grid-4 mb-6">
    ${Components.kpiCard({ label:'Major Policy Changes (FY YTD)', value: d.kpis.policyChanges.value, delta: d.kpis.policyChanges.delta, dir: 'up', context: d.kpis.policyChanges.context, icon:'fa-gavel', accentColor:'var(--accent-solar)' })}
    ${Components.kpiCard({ label:'ALMM Revision Status', value: d.kpis.almmStatus.value, delta: d.kpis.almmStatus.delta, dir: 'flat', context: d.kpis.almmStatus.context, icon:'fa-list-check', accentColor:'var(--accent-blue)', iconBg:'rgba(59,130,246,0.1)' })}
    ${Components.kpiCard({ label:'PLI Scheme Status', value: d.kpis.pliStatus.value, delta: d.kpis.pliStatus.delta, dir: 'up', context: d.kpis.pliStatus.context, icon:'fa-coins', accentColor:'var(--accent-green)', iconBg:'rgba(34,197,94,0.1)' })}
    ${Components.kpiCard({ label:'Trade / Policy Alert Level', value: d.kpis.alertLevel.value, delta: d.kpis.alertLevel.delta, dir: 'flat', context: d.kpis.alertLevel.context, icon:'fa-triangle-exclamation', accentColor:'var(--accent-orange)', iconBg:'rgba(249,115,22,0.1)' })}
  </div>

  <!-- Policy Timeline + Category Cards -->
  <div class="grid-2-1 mb-6">
    <!-- Timeline -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Policy & Regulation Timeline</div>
          <div class="card-subtitle">Key notifications, circulars, and orders — chronological</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        <div class="timeline">
          ${d.timeline.map(t => Components.timelineItem(
            t.date, t.title, t.detail, t.color,
            Components.tag(t.type.charAt(0).toUpperCase() + t.type.slice(1), t.type === 'positive' ? 'positive' : t.type === 'watchlist' ? 'watchlist' : 'neutral')
          )).join('')}
        </div>
        ${Components.sourceFooter(src.label, 'policy')}
      </div>
    </div>

    <!-- Category Cards -->
    <div>
      ${d.categories.map(cat => `
      <div class="policy-cat-card mb-4">
        <div class="policy-cat-icon" style="background:${cat.iconBg};color:${cat.iconColor}">
          <i class="fa-solid ${cat.icon}"></i>
        </div>
        <div class="policy-cat-name">${cat.name}</div>
        <div class="policy-cat-desc">${cat.desc}</div>
        <div class="policy-cat-status ${cat.statusClass}">${cat.status}</div>
      </div>`).join('')}
      <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK DATA</span>
    </div>
  </div>

  <!-- Deadline Tracker + Impact Matrix -->
  <div class="grid-2 mb-6">
    <!-- Deadline Tracker -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Compliance Deadline Tracker</div>
          <div class="card-subtitle">Upcoming regulatory milestones and deadlines</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        ${d.deadlines.map(dl => {
          const cls = dl.status === 'overdue' ? 'deadline-overdue' : dl.status === 'soon' ? 'deadline-soon' : 'deadline-ok';
          const txt = dl.status === 'overdue' ? 'OVERDUE' : dl.days !== null ? `${dl.days}d away` : 'Active';
          return Components.deadlineRow(dl.date, dl.event, txt, cls);
        }).join('')}
        ${Components.sourceFooter(src.label, 'policy')}
      </div>
    </div>

    <!-- Policy Impact Matrix -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Policy Impact Matrix</div>
          <div class="card-subtitle">Effect of key policies on sector variables</div>
        </div>
        <span class="source-chip mock"><i class="fa-solid fa-flask"></i> MOCK</span>
      </div>
      <div class="card-body">
        ${d.impactMatrix.map(item => `
        <div class="policy-impact-row">
          <div class="policy-area">${item.area}</div>
          <div class="policy-dir ${item.direction === 'positive' ? 'dir-positive' : item.direction === 'negative' ? 'dir-negative' : 'dir-neutral'}">
            ${item.direction === 'positive' ? '▲ Positive' : item.direction === 'negative' ? '▼ Negative' : '→ Neutral'}
          </div>
          <div class="policy-desc">${item.desc}<br><span style="font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text-disabled)">${item.policy}</span></div>
        </div>`).join('')}
        ${Components.sourceFooter(src.label, 'policy')}
      </div>
    </div>
  </div>

  <!-- Regulation Detail Table -->
  <div class="mb-6">
    ${Components.tableCard({
      title: 'Regulation & Notification Detail Table',
      subtitle: 'All key gazette notifications and regulatory orders tracked',
      source: src.label,
      body: `<table class="data-table">
        <thead><tr>
          <th>Notification Ref.</th>
          <th>Date</th>
          <th>Category</th>
          <th>Title</th>
          <th>Impact</th>
          <th>Status</th>
        </tr></thead>
        <tbody>
          ${d.regulationTable.map(r => `
          <tr>
            <td class="mono" style="color:var(--accent-blue);font-size:11px">${r.notification}</td>
            <td class="mono" style="color:var(--text-muted)">${r.date}</td>
            <td>${Components.tag(r.category, 'info')}</td>
            <td class="primary">${r.title}</td>
            <td>${buildImpactTag(r.impact)}</td>
            <td>${buildRegStatusTag(r.status)}</td>
          </tr>`).join('')}
        </tbody>
      </table>`
    })}
  </div>
  `;
}

function buildImpactTag(impact) {
  const map = { 'positive':'positive', 'negative':'negative', 'neutral':'neutral', 'watchlist':'watchlist' };
  const labels = { 'positive':'▲ Positive', 'negative':'▼ Negative', 'neutral':'→ Neutral', 'watchlist':'◆ Watchlist' };
  return `<span class="tag tag-${map[impact] || 'neutral'}">${labels[impact] || impact}</span>`;
}

function buildRegStatusTag(status) {
  const map = { 'In Force':'positive', 'Under Review':'warning', 'Draft':'neutral', 'Superseded':'negative' };
  return Components.tag(status, map[status] || 'neutral');
}
