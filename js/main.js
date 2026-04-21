/* ═══════════════════════════════════════════════════════════════════════════
   MAIN — Navigation, Tab switching, App bootstrap
   ═══════════════════════════════════════════════════════════════════════════ */

const TAB_CONFIG = {
  demand:        { title: 'Sector Demand & Power Market Pulse',       subtitle: 'India · National Grid View',         init: initDemandTab       },
  manufacturing: { title: 'Manufacturing & Domestic Supply Chain',    subtitle: 'India · ALMM & PLI Tracker',        init: initManufacturingTab },
  tender:        { title: 'Tender Flow & Tariff Discovery',           subtitle: 'SECI · NTPC · State DISCOMs',       init: initTenderTab        },
  execution:     { title: 'Project Execution & COD Tracker',          subtitle: 'Under-Construction Pipeline',       init: initExecutionTab     },
  ipp:           { title: 'IPP / Listed Player Monitor',              subtitle: 'Adani · ReNew · Greenko · NTPC',   init: initIPPTab           },
  policy:        { title: 'Policy & Regulation Monitor',              subtitle: 'MNRE · MoP · CERC · SERC',         init: initPolicyTab        },
  grid:          { title: 'Grid, DISCOM & Execution Risk Monitor',    subtitle: 'Payment Risk · Curtailment · Grid', init: initGridTab          },
  restricted:    { title: 'Paid & Restricted Data Sources',           subtitle: 'Vendor Catalogue · PRO Section',   init: initRestrictedTab    },
};

let currentTab = 'demand';

function switchTab(tabId) {
  if (!TAB_CONFIG[tabId]) return;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(el => {
    el.classList.toggle('active', el.id === `tab-${tabId}`);
  });

  // Update topbar
  const cfg = TAB_CONFIG[tabId];
  document.getElementById('topbarTitle').textContent = cfg.title;
  document.getElementById('topbarSubtitle').textContent = cfg.subtitle;

  // Hide company filter on non-relevant tabs
  const compGroup = document.getElementById('companyFilterGroup');
  compGroup.style.display = (tabId === 'ipp' || tabId === 'execution') ? 'flex' : 'none';

  // Initialize tab if not yet done
  cfg.init();

  currentTab = tabId;

  // Scroll to top
  document.getElementById('contentArea').scrollTop = 0;
}

// ── Navigation click handler ──
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(el.dataset.tab);
  });
});

// ── Sidebar Toggle (mobile) ──
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
    sidebar.classList.remove('open');
  }
});

// ── Per-tab refresh dispatch ──
// Tabs register a refresh handler here. When a tab-specific handler is
// present, the global refresh button calls it; otherwise the button keeps
// its original mock behaviour. Kept deliberately minimal — no UI redesign.
const TAB_REFRESH = {
  execution: () => (typeof refreshExecutionTab === 'function' ? refreshExecutionTab() : null),
  ipp:       () => (typeof refreshIPPTab       === 'function' ? refreshIPPTab()       : null),
};

// ── Refresh button ──
document.getElementById('refreshBtn').addEventListener('click', async () => {
  const btn = document.getElementById('refreshBtn');
  const icon = btn.querySelector('i');
  btn.disabled = true;
  icon.style.animation = 'spin 0.8s linear infinite';

  const handler = TAB_REFRESH[currentTab];
  try {
    if (handler) {
      const result = await handler();
      const s = result && result.summary;
      if (s) {
        showToast(`Refreshed ${currentTab}: ${s.ok} ok · ${s.errored} error · ${s.skipped} skipped (${s.durationMs} ms)`, s.errored ? 'warning' : 'success');
      } else {
        showToast(`${currentTab} tab refreshed`, 'success');
      }
    } else {
      // Fall-through behaviour for tabs without a registered handler.
      await new Promise(r => setTimeout(r, 1200));
      showToast('Mock data refreshed — live sources not connected yet', 'info');
    }
  } catch (err) {
    showToast(`Refresh failed: ${err && err.message ? err.message : err}`, 'warning');
  } finally {
    btn.disabled = false;
    icon.style.animation = '';
  }
});

// ── Filters ──
document.getElementById('dateRange').addEventListener('change', () => {
  showToast('Date range filter applied (mock — data unchanged)', 'success');
});

document.getElementById('stateFilter').addEventListener('change', (e) => {
  showToast(`State filter: ${e.target.value} (mock — data unchanged)`, 'success');
});

document.getElementById('companyFilter').addEventListener('change', (e) => {
  if (currentTab === 'ipp') {
    const val = e.target.value;
    if (val !== 'All Developers' && IPP_COMPANY_NAMES.includes(val)) {
      renderIPPTab(val);
    }
  }
});

// ── Toast Notification ──
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  const color = type === 'success' ? '#22c55e' : type === 'warning' ? '#f59e0b' : '#3b82f6';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:var(--bg-card); border:1px solid ${color}40; border-left:3px solid ${color};
    color:var(--text-secondary); font-size:12px;
    padding:12px 16px; border-radius:10px;
    box-shadow:var(--shadow-lg);
    max-width:340px; line-height:1.5;
    animation:fadeIn 0.2s ease both;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Bootstrap ──
function init() {
  // Ensure company filter hidden by default
  document.getElementById('companyFilterGroup').style.display = 'none';

  // Populate company dropdown from the canonical IPP_COMPANIES registry.
  // This replaces hardcoded <option> elements so adding a company to
  // real-data-ipp-companies.js automatically appears in the dropdown.
  const compSel = document.getElementById('companyFilter');
  IPP_COMPANY_NAMES.forEach(name => {
    const opt = document.createElement('option');
    opt.textContent = name;
    compSel.appendChild(opt);
  });

  // Init first tab
  switchTab('demand');

  // Prefetch next tabs slightly delayed for performance
  setTimeout(() => {
    try { initManufacturingTab(); } catch(e) {}
    try { initTenderTab(); } catch(e) {}
  }, 1800);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
