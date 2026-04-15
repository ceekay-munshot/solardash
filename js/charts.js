/* ═══════════════════════════════════════════════════════════════════════════
   CHART UTILITIES — Wrappers around Chart.js with consistent styling
   ═══════════════════════════════════════════════════════════════════════════ */

Chart.defaults.color = '#8b9ab4';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;

const CHART_COLORS = {
  amber:  '#f59e0b',
  blue:   '#3b82f6',
  green:  '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  teal:   '#14b8a6',
  indigo: '#6366f1',
  red:    '#ef4444',
  slate:  '#64748b',
};

const CHART_PALETTES = Object.values(CHART_COLORS);

const gridConfig = {
  color: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.06)',
};

const axisConfig = {
  ticks: { color: '#5a6a85', font: { size: 10 } },
  grid: gridConfig,
  border: { color: 'rgba(255,255,255,0.06)' }
};

function tooltipPlugin() {
  return {
    backgroundColor: '#1e2535',
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    titleColor: '#f0f4f8',
    bodyColor: '#8b9ab4',
    padding: 12,
    cornerRadius: 8,
    titleFont: { weight: '700', size: 12 },
    bodyFont: { size: 11 },
    displayColors: true,
    boxWidth: 10,
    boxHeight: 10,
    boxPadding: 4,
  };
}

function legendPlugin() {
  return {
    display: true,
    position: 'top',
    align: 'end',
    labels: {
      color: '#8b9ab4',
      font: { size: 11 },
      usePointStyle: true,
      pointStyleWidth: 8,
      boxHeight: 6,
      padding: 16,
    }
  };
}

const Charts = {

  _registry: {},

  _destroy(id) {
    if (this._registry[id]) {
      this._registry[id].destroy();
      delete this._registry[id];
    }
  },

  _register(id, chart) {
    this._registry[id] = chart;
    return chart;
  },

  /* ── Multi-Line Chart ── */
  multiLine(id, labels, datasets, opts = {}) {
    this._destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    const ds = datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      borderColor: d.color || CHART_PALETTES[i % CHART_PALETTES.length],
      backgroundColor: d.fill ? (d.color || CHART_PALETTES[i % CHART_PALETTES.length]).replace(')', ',0.08)').replace('rgb', 'rgba') : 'transparent',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: d.fill || false,
    }));
    return this._register(id, new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: ds },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { tooltip: tooltipPlugin(), legend: legendPlugin() },
        scales: {
          x: { ...axisConfig, ...(opts.xAxis || {}) },
          y: { ...axisConfig, ...(opts.yAxis || {}), title: opts.yLabel ? { display:true, text:opts.yLabel, color:'#5a6a85', font:{size:10} } : undefined },
        },
        animation: { duration: 600, easing: 'easeInOutQuart' },
      }
    }));
  },

  /* ── Area Chart ── */
  area(id, labels, datasets, opts = {}) {
    const ds = datasets.map((d) => ({ ...d, fill: true }));
    return this.multiLine(id, labels, ds, opts);
  },

  /* ── Bar Chart ── */
  bar(id, labels, datasets, opts = {}) {
    this._destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    const ds = datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color || CHART_PALETTES[i % CHART_PALETTES.length],
      borderRadius: 4,
      borderSkipped: false,
      barThickness: opts.barThickness || 'flex',
    }));
    return this._register(id, new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: ds },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { tooltip: tooltipPlugin(), legend: legendPlugin() },
        scales: {
          x: { ...axisConfig, stacked: opts.stacked || false },
          y: { ...axisConfig, stacked: opts.stacked || false,
            title: opts.yLabel ? { display:true, text:opts.yLabel, color:'#5a6a85', font:{size:10} } : undefined
          },
        },
        animation: { duration: 600 },
      }
    }));
  },

  /* ── Horizontal Bar ── */
  horizontalBar(id, labels, data, colors, opts = {}) {
    this._destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    return this._register(id, new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: opts.label || 'Value',
          data,
          backgroundColor: Array.isArray(colors) ? colors : colors,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { tooltip: tooltipPlugin(), legend: { display: false } },
        scales: {
          x: { ...axisConfig, title: opts.xLabel ? { display:true, text:opts.xLabel, color:'#5a6a85', font:{size:10} } : undefined },
          y: { ...axisConfig, ticks: { ...axisConfig.ticks, font: { size: 10.5 } } },
        },
        animation: { duration: 500 },
      }
    }));
  },

  /* ── Donut / Pie ── */
  donut(id, labels, data, colors, opts = {}) {
    this._destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    return this._register(id, new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || CHART_PALETTES.slice(0, data.length),
          borderColor: '#1e2535',
          borderWidth: 2,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: opts.cutout || '65%',
        plugins: {
          tooltip: tooltipPlugin(),
          legend: { display: false },
        },
        animation: { animateRotate: true, duration: 600 },
      }
    }));
  },

  /* ── Stacked Bar ── */
  stackedBar(id, labels, datasets, opts = {}) {
    return this.bar(id, labels, datasets, { ...opts, stacked: true });
  },

  /* ── Sparkline (minimal line) ── */
  sparkline(id, data, color = '#f59e0b') {
    this._destroy(id);
    const ctx = document.getElementById(id);
    if (!ctx) return;
    return this._register(id, new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: color,
          backgroundColor: color.replace(')', ',0.12)').replace('#', 'rgba(').replace(/([0-9a-f]{2})/gi, (m) => parseInt(m, 16) + ','),
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { tooltip: { enabled: false }, legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        animation: { duration: 400 },
      }
    }));
  },
};

// Helper to build hex sparklines (proper fill)
function buildSparkFill(color) {
  try {
    const r = parseInt(color.slice(1,3),16);
    const g = parseInt(color.slice(3,5),16);
    const b = parseInt(color.slice(5,7),16);
    return `rgba(${r},${g},${b},0.12)`;
  } catch(e) { return 'rgba(245,158,11,0.12)'; }
}
