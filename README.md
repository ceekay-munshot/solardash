# SolarIQ India — Investor Intelligence Dashboard

## Overview

A **production-grade, investor-facing Solar Intelligence Dashboard** built for buy-side investors tracking India's solar energy sector. Designed to be data-dense, premium, and highly structured — providing a clear investor framework across 8 distinct analytical domains.

**Current Mode: Mock Data (UI-only build)**

---

## Features Implemented

### Shell & Navigation
- Fixed left sidebar with grouped navigation
- Sticky top bar with date range, state, and developer filters
- Tab-switching with animation and clean transitions
- Status banner with mock mode indicator
- Refresh button with animation placeholder
- Toast notifications for filter/refresh events
- Mobile-responsive sidebar toggle
- Keyboard-accessible navigation

### Tab 1 — Sector Demand & Power Market Pulse
- 4 KPI cards: Total solar base, solar share, peak demand, growth trend
- Monthly power demand trend (multi-year line chart)
- Solar generation trend (area chart)
- State-wise capacity heatmap (color-coded grid)
- State ranking table with progress bars
- Horizontal bar chart for state comparison
- Seasonality momentum strip

### Tab 2 — Manufacturing & Domestic Supply Chain
- 4 KPI cards: ALMM module/cell capacity, PLI capacity, import dependence
- Capacity mix donut chart (module/cell/wafer/ingot)
- Backward integration progress bars
- Domestic vs import stacked bar chart
- Import-export trend line chart
- Manufacturer ranking table (8 companies with full breakdown)
- Expansion tracker panel (6 announced expansions)

### Tab 3 — Tender Flow & Tariff Discovery
- 4 KPI cards: MW tendered/awarded, avg tariff, subscription intensity
- Tender announcement vs award flow bar chart
- Tariff discovery trend line chart
- Tender type mix donut (Solar/Hybrid/FDRE/BESS/RTC)
- Issuer-wise comparison horizontal bar
- Cancelled/reissued tender tracker (4 panel cards)
- Detailed tender table with status tags

### Tab 4 — Project Execution & COD Tracker
- 4 KPI cards: Commissioned, under-construction, delayed, avg lag
- Commissioning trend bar chart
- Under-construction pipeline trend chart
- State-wise commissioning donut + horizontal bars
- Developer execution ranking table with on-time % bars
- Delay reason analysis with progress bars and delay tags
- Upcoming COD timeline (6 months)
- Project execution detail table

### Tab 5 — IPP / Listed Player Monitor
- Interactive company selector (7 IPPs)
- Dynamic KPI cards that update per company
- Portfolio technology mix donut (per company)
- Operating vs UC vs PPA pipeline bar chart (all companies)
- Upcoming COD timeline per company
- Announcements/wins feed per company
- Capex, leverage & yield financial summary
- Company comparison table (all 7 companies)

### Tab 6 — Policy & Regulation Monitor
- 4 KPI cards: Policy change count, ALMM status, PLI status, alert level
- Policy timeline with 9 chronological events
- 6 regulation category cards (ALMM/DCR/PLI/Customs/MNRE/CERC)
- Compliance deadline tracker with color-coded urgency
- Policy impact matrix (8 sector variables)
- Regulation detail table with impact and status tags

### Tab 7 — Grid, DISCOM & Execution Risk Monitor
- 4 KPI cards: DISCOM dues, TX readiness, curtailment rate, payment risk
- State risk heatmap (12 states, color-coded)
- DISCOM dues outstanding trend (area chart)
- Transmission bottleneck tracker (6 corridors)
- Curtailment risk by state (horizontal bars + bar chart)
- State-wise risk comparison table (sortable by score)
- Risk flags panel (6 active flags)
- State watchlist with severity levels

### Tab 8 — Paid & Restricted Data Sources
- Visual distinction from live tabs (purple/restricted theme)
- 8 vendor cards with: name, type, shows, gaps, pricing, usefulness score
- Comparison table sorted by usefulness score
- "Why Not Included" explainer panel (6 sources)
- Future integration roadmap queue
- Data architecture technical note
- Access type tags: Paid / Login / Manual / Free

---

## Architecture

```
index.html              — Main shell, layout, nav structure
css/
  design-system.css     — CSS variables, typography, tokens, utilities
  layout.css            — Sidebar, topbar, content area, responsive grid
  components.css        — KPI cards, chart cards, tables, timeline, etc.
  tabs.css              — Tab-specific overrides and special components
js/
  mock-data.js          — All mock data organized by tab (MOCK object)
  components.js         — Reusable HTML component builders
  charts.js             — Chart.js wrappers with consistent styling
  main.js               — Navigation, tab switching, app bootstrap
  tab-demand.js         — Tab 1 render + chart initialization
  tab-manufacturing.js  — Tab 2 render + chart initialization
  tab-tender.js         — Tab 3 render + chart initialization
  tab-execution.js      — Tab 4 render + chart initialization
  tab-ipp.js            — Tab 5 render + chart initialization (dynamic)
  tab-policy.js         — Tab 6 render
  tab-grid.js           — Tab 7 render + chart initialization
  tab-restricted.js     — Tab 8 render (no charts)
```

## Data Integration Design

Each tab is initialized independently and lazily. To connect real data:

1. Replace the relevant section in `MOCK` object (mock-data.js) with a live API call
2. Each `init*Tab()` function reads from `MOCK.*` — swap to `await fetch(...)` per block
3. Charts use `Charts.*()` wrappers that accept any array data
4. `DATA_SOURCES` object tracks source label and status per tab

**No UI rebuild needed** when connecting live data. Each card, KPI, and chart is independently wirable.

## External Dependencies (CDN)

- **Chart.js 4.4.0** — All charts
- **Font Awesome 6.4.0** — Icons throughout
- **Google Fonts (Inter + JetBrains Mono)** — Typography

## Design System

- Dark theme: `#0d1117` base, `#1e2535` cards, amber (`#f59e0b`) brand accent
- CSS custom properties for all colors, spacing, radius, shadows
- 8-color chart palette
- Responsive: Desktop-first, tablet-adapted, mobile-usable

## Status

| Feature Area        | Status |
|---------------------|--------|
| All 8 tabs          | ✅ Complete (mock) |
| Navigation & shell  | ✅ Complete |
| Charts (all types)  | ✅ Chart.js wired |
| Responsive layout   | ✅ Complete |
| Live API integration| ⏳ Not yet — modular slots ready |
| Auth/login          | ⏳ Not applicable (static) |
| Data persistence    | ⏳ Not yet |

## Next Steps

1. Connect Tab 1 (Demand) to CEA/MNRE monthly PDF scraper or manual JSON upload
2. Connect Tab 3 (Tender) to SECI portal data or Mercom API
3. Connect Tab 7 (Grid) to PRAAPTI portal for DISCOM dues
4. Connect Tab 5 (IPP) to BSE/NSE filing data pipeline
5. Add IEX market data API for Tab 7 curtailment signals
6. Add Bloomberg NEF API for Tab 2/3 manufacturing and tender enrichment

---

*SolarIQ India — v2.1.0 · UI Build · Mock Data Mode · April 2025*
"# solardash" 
