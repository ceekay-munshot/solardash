/* ═══════════════════════════════════════════════════════════════════════════
   TAB 8 — Paid / Login / Restricted Data Sources
   ═══════════════════════════════════════════════════════════════════════════ */

function initRestrictedTab() {
  const el = document.getElementById('tab-restricted');
  if (!el || el.dataset.initialized) return;
  el.dataset.initialized = 'true';

  const d = MOCK.restricted;

  el.innerHTML = `
  <!-- Hero Banner -->
  <div class="restricted-hero mb-6">
    <i class="fa-solid fa-lock-open"></i>
    <h2>Paid, Login-Required & Restricted Data Sources</h2>
    <p>This tab documents high-value data sources that are not included in the public-data engine of this dashboard. These are paid subscriptions, portal logins, or manual-only sources. They are catalogued here so analysts can evaluate procurement priorities and future integration potential.</p>
    <div style="margin-top:20px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
      <span class="tag tag-paid"><i class="fa-solid fa-credit-card"></i> Paid Subscription</span>
      <span class="tag tag-restricted"><i class="fa-solid fa-user-lock"></i> Login Required</span>
      <span class="tag tag-neutral"><i class="fa-solid fa-file-arrow-down"></i> Manual Download</span>
      <span class="tag tag-positive"><i class="fa-solid fa-circle-check"></i> Free Access</span>
    </div>
  </div>

  <!-- Vendor Cards -->
  <div class="mb-6">
    ${Components.sectionHeader('Data Source Vendor Cards', 'Ranked by usefulness score for buy-side solar investment research')}
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
      ${d.vendors.map(v => buildVendorCard(v)).join('')}
    </div>
  </div>

  <!-- Comparison Table -->
  <div class="mb-6">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Restricted Source Comparison Table</div>
          <div class="card-subtitle">Side-by-side evaluation for procurement decision</div>
        </div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>Source</th>
            <th>Access Type</th>
            <th>Pricing (Est.)</th>
            <th>Usefulness Score</th>
            <th>Key Data</th>
            <th>Key Gap</th>
            <th>Priority</th>
          </tr></thead>
          <tbody>
            ${d.vendors.sort((a,b) => b.score - a.score).map(v => `
            <tr>
              <td class="primary">${v.name}</td>
              <td>${buildAccessTag(v.tags)}</td>
              <td class="mono" style="font-size:11px">${v.pricing}</td>
              <td>${buildScoreBar(v.score)}</td>
              <td style="font-size:11px;color:var(--text-muted);max-width:200px">${v.shows.substring(0,80) + '...'}</td>
              <td style="font-size:11px;color:var(--text-muted);max-width:180px">${v.notShows.substring(0,70) + '...'}</td>
              <td>${buildPriorityTag(v.score)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Why Not Included + Upgrade Panel -->
  <div class="grid-2 mb-6">
    <!-- Not Included Explainer -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Why Not Included in Live Dashboard?</div>
          <div class="card-subtitle">Technical and licensing constraints explained</div>
        </div>
      </div>
      <div class="card-body">
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;line-height:1.7">
          The SolarIQ live engine ingests only sources with <strong style="color:var(--text-primary)">structured API access, no-login public portals, or official data files</strong> that can be connected automatically. The following high-value datasets remain outside the live engine for the technical/legal reasons listed.
        </div>
        ${d.notIncluded.map(n => `
        <div class="not-included-item">
          <div class="not-included-icon"><i class="fa-solid fa-xmark"></i></div>
          <div class="not-included-body">
            <div class="not-included-title">${n.title}</div>
            <div class="not-included-reason">${n.reason}</div>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Integration Roadmap Panel -->
    <div>
      <!-- Upgrade Panel -->
      <div class="upgrade-panel mb-4">
        <div style="display:flex;align-items:flex-start;gap:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(245,158,11,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--accent-solar);flex-shrink:0">
            <i class="fa-solid fa-rocket"></i>
          </div>
          <div>
            <div style="font-size:15px;font-weight:800;color:var(--text-primary);margin-bottom:6px">Future Integration Roadmap</div>
            <div style="font-size:12px;color:var(--text-secondary);line-height:1.7;margin-bottom:12px">
              The SolarIQ architecture is designed as a modular, source-by-source data pipeline. Each tab and card can be wired individually to live data sources without rebuilding the UI. Priority integration queue below:
            </div>
            ${buildIntegrationQueue()}
          </div>
        </div>
      </div>

      <!-- Data Architecture Note -->
      <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);border-radius:14px;padding:20px">
        <div style="font-size:13px;font-weight:700;color:var(--accent-indigo);margin-bottom:8px"><i class="fa-solid fa-sitemap"></i> Data Architecture</div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.8">
          Each dashboard card exposes a <code style="background:var(--bg-elevated);padding:1px 5px;border-radius:4px;font-size:11px">data-source</code> slot that accepts:
          <ul style="margin:10px 0 10px 20px;color:var(--text-muted);font-size:12px;line-height:1.8">
            <li>REST API endpoint + auth header</li>
            <li>Static JSON file (manual upload)</li>
            <li>Webhook / push event stream</li>
            <li>CSV scraper (scheduled)</li>
          </ul>
          Switching from mock → live requires only one config change per card. No UI rebuild needed.
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Note -->
  <div style="padding:20px;background:rgba(168,85,247,0.04);border:1px dashed rgba(168,85,247,0.25);border-radius:14px;text-align:center;color:var(--text-muted);font-size:12px;line-height:1.7">
    <i class="fa-solid fa-circle-info" style="color:var(--accent-purple);margin-right:6px"></i>
    This tab is for <strong style="color:var(--text-primary)">analyst reference only</strong> and is not part of the public-data live engine. All vendor descriptions, pricing, and usefulness scores are analyst estimates. Contact the relevant vendors for current commercial terms.
  </div>
  `;
}

function buildVendorCard(v) {
  const isPaid = v.tags.includes('paid');
  const stars = Math.round(v.score / 20);
  return `
  <div class="vendor-card" style="${isPaid ? 'border-color:rgba(239,68,68,0.2)' : ''}">
    <div class="vendor-header">
      <div>
        <div class="vendor-name">${v.name}</div>
        <div class="vendor-type">${v.type}</div>
      </div>
      <div class="vendor-score">
        <span class="score-val">${v.score}</span>
        <span style="font-size:11px;color:var(--text-muted)">/100</span>
        <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</div>
      </div>
    </div>
    <div class="vendor-row">
      <span class="vendor-row-label">Access type</span>
      <span class="vendor-row-val">${buildAccessTag(v.tags)}</span>
    </div>
    <div class="vendor-row">
      <span class="vendor-row-label">Shows</span>
      <span class="vendor-row-val" style="color:var(--status-positive)">${v.shows}</span>
    </div>
    <div class="vendor-row">
      <span class="vendor-row-label">Does not show</span>
      <span class="vendor-row-val" style="color:var(--text-muted)">${v.notShows}</span>
    </div>
    <div class="vendor-row">
      <span class="vendor-row-label">Pricing (est.)</span>
      <span class="vendor-row-val" style="font-weight:700;color:${isPaid ? 'var(--status-negative)' : 'var(--status-positive)'}">${v.pricing}</span>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${v.tags.map(t => `<span class="tag ${t === 'paid' ? 'tag-paid' : t === 'premium' ? 'tag-watchlist' : t === 'gov' ? 'tag-info' : 'tag-neutral'}">${t.toUpperCase()}</span>`).join('')}
      </div>
      ${buildPriorityTag(v.score)}
    </div>
  </div>`;
}

function buildAccessTag(tags) {
  if (tags.includes('paid')) return `<span class="tag tag-paid"><i class="fa-solid fa-credit-card"></i> Paid</span>`;
  if (tags.includes('login')) return `<span class="tag tag-watchlist"><i class="fa-solid fa-user-lock"></i> Login</span>`;
  if (tags.includes('manual')) return `<span class="tag tag-neutral"><i class="fa-solid fa-file-arrow-down"></i> Manual</span>`;
  return `<span class="tag tag-positive"><i class="fa-solid fa-circle-check"></i> Free</span>`;
}

function buildScoreBar(score) {
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#6366f1';
  return `<div style="display:flex;align-items:center;gap:8px">
    <div style="flex:1;background:var(--bg-elevated);border-radius:999px;height:6px;overflow:hidden">
      <div style="width:${score}%;height:100%;background:${color};border-radius:999px"></div>
    </div>
    <span style="font-size:11px;font-weight:700;min-width:28px;font-family:'JetBrains Mono',monospace;color:${color}">${score}</span>
  </div>`;
}

function buildPriorityTag(score) {
  if (score >= 85) return Components.tag('High Priority', 'positive');
  if (score >= 70) return Components.tag('Medium Priority', 'warning');
  return Components.tag('Low Priority', 'neutral');
}

function buildIntegrationQueue() {
  const items = [
    { src:'Bloomberg NEF India',  status:'Evaluate Q2 FY26', priority:'high' },
    { src:'IEX Market Data API',  status:'In Procurement',   priority:'high' },
    { src:'MNRE Portal Scraper',  status:'Under Development',priority:'medium' },
    { src:'PRAAPTI API',          status:'Requested',        priority:'medium' },
    { src:'Mercom India Tracker', status:'Evaluate Q3 FY26', priority:'low' },
  ];
  return items.map(i => `
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:8px;background:var(--bg-elevated);border-radius:8px">
    <div style="width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${i.priority === 'high' ? '#22c55e' : i.priority === 'medium' ? '#f59e0b' : '#6366f1'}"></div>
    <span style="font-size:12px;color:var(--text-primary);font-weight:500;flex:1">${i.src}</span>
    <span style="font-size:11px;color:var(--text-muted)">${i.status}</span>
  </div>`).join('');
}
