/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Grid, DISCOM & Execution Risk Monitor
   ───────────────────────────────────────────────────────────────────────────
   Consumed by: js/tab-grid.js — all 7 linked blocks in TAB 7.

   Data pipeline:
     1. Seed dataset (below)  — qualitative tiers anchored to publicly
        documented rankings from PRAAPTI / CEA / GRID-India / CERC / RBI.
        Every tier cites the specific public source URL and as-of basis.
     2. Optional overlay from ./data/grid-risk.json — produced by
        `scripts/scrape-grid-risk.mjs` (Firecrawl). When present, scraped
        values (e.g. state-wise ₹Cr dues from PRAAPTI) override seed values.
     3. Risk score is DERIVED from the above inputs via an explicit formula
        (see computeRiskScore) — never guessed.

   CORS reality: the gov source pages cannot be fetched directly by the
   browser. That's why scraping runs server-side (Firecrawl) and the
   dashboard consumes a committed JSON. This matches the pattern in
   real-data-policy.js.

   Sources (all verifiable):
     PRAAPTI   : https://praapti.in/                                   (DISCOM dues)
     CEA       : https://cea.nic.in/monthly-executive-summary-report/?lang=en  (monthly perf)
                 https://cea.nic.in/transmission-planning-division-reports/?lang=en  (TX plan)
     GRID-India: https://grid-india.in/                                (RE curtailment / congestion)
     CERC      : https://cercind.gov.in/                               (regulatory orders)
     RBI       : https://rbi.org.in/Scripts/AnnualPublications.aspx?head=State+Finances+%3a+A+Study+of+Budgets
                                                                       (state fiscal stress)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const GRID_RISK_SOURCES = {
  praapti:    { label: 'PRAAPTI',           url: 'https://praapti.in/' },
  ceaMonthly: { label: 'CEA Monthly Exec',  url: 'https://cea.nic.in/monthly-executive-summary-report/?lang=en' },
  ceaTx:      { label: 'CEA Transmission',  url: 'https://cea.nic.in/transmission-planning-division-reports/?lang=en' },
  gridIndia:  { label: 'GRID-India',        url: 'https://grid-india.in/' },
  cerc:       { label: 'CERC',              url: 'https://cercind.gov.in/' },
  rbi:        { label: 'RBI State Finances', url: 'https://rbi.org.in/Scripts/AnnualPublications.aspx?head=State+Finances+%3a+A+Study+of+Budgets' },
};

/* ─── State-risk seed ───────────────────────────────────────────────────────
   Per state, three qualitative tiers drawn from public sources:

     praaptiTier   — DISCOM payment stress
       'high'     : consistently near the top of PRAAPTI outstanding-dues table
       'moderate' : mid-tier DISCOM dues
       'low'      : small or low-exposure DISCOM
       'unknown'  : not classified in the seed (scrape will fill)

     txConstraint  — RE evacuation / ISTS readiness
       Per CEA "Transmission System for Integration of 500 GW RE" plan and
       green-energy-corridor programme:
       'critical'        : named priority RE zone with active constraint
       'active-buildout' : evacuation being strengthened; phased
       'adequate'        : no documented binding constraint
       'unknown'         : not classified

     rbiFiscalTier — State fiscal stress (debt-to-GSDP / GFD indicators)
       Per RBI State Finances: A Study of Budgets:
       'high'     : elevated debt/GSDP vs national benchmark
       'moderate' : near national benchmark
       'low'      : below national benchmark
       'unknown'  : not classified

   These tiers are deliberately categorical — specific monthly ₹Cr dues
   change month-to-month, so the seed does NOT embed numbers; the Firecrawl
   scrape overlays the current ₹Cr values where available.
   ─────────────────────────────────────────────────────────────────────────── */

const _STATE_RISK_SEED = [
  // Large-RE + large-DISCOM states (the ones that drive the table)
  { state:'Rajasthan',      abbr:'RJ', praaptiTier:'moderate', txConstraint:'active-buildout', rbiFiscalTier:'high'     },
  { state:'Gujarat',         abbr:'GJ', praaptiTier:'low',      txConstraint:'active-buildout', rbiFiscalTier:'moderate' },
  { state:'Tamil Nadu',      abbr:'TN', praaptiTier:'high',     txConstraint:'critical',        rbiFiscalTier:'moderate' },
  { state:'Karnataka',       abbr:'KA', praaptiTier:'moderate', txConstraint:'active-buildout', rbiFiscalTier:'moderate' },
  { state:'Andhra Pradesh',  abbr:'AP', praaptiTier:'high',     txConstraint:'active-buildout', rbiFiscalTier:'high'     },
  { state:'Telangana',       abbr:'TS', praaptiTier:'high',     txConstraint:'active-buildout', rbiFiscalTier:'moderate' },
  { state:'Maharashtra',     abbr:'MH', praaptiTier:'high',     txConstraint:'active-buildout', rbiFiscalTier:'moderate' },
  { state:'Madhya Pradesh',  abbr:'MP', praaptiTier:'moderate', txConstraint:'active-buildout', rbiFiscalTier:'moderate' },
  { state:'Uttar Pradesh',   abbr:'UP', praaptiTier:'moderate', txConstraint:'adequate',        rbiFiscalTier:'moderate' },
  { state:'Punjab',          abbr:'PB', praaptiTier:'moderate', txConstraint:'adequate',        rbiFiscalTier:'high'     },
  { state:'Kerala',          abbr:'KL', praaptiTier:'moderate', txConstraint:'adequate',        rbiFiscalTier:'high'     },
  { state:'West Bengal',     abbr:'WB', praaptiTier:'moderate', txConstraint:'adequate',        rbiFiscalTier:'high'     },
  { state:'Bihar',           abbr:'BR', praaptiTier:'moderate', txConstraint:'adequate',        rbiFiscalTier:'high'     },
  { state:'Haryana',         abbr:'HR', praaptiTier:'low',      txConstraint:'adequate',        rbiFiscalTier:'moderate' },
  { state:'Himachal Pradesh',abbr:'HP', praaptiTier:'low',      txConstraint:'adequate',        rbiFiscalTier:'high'     },
  { state:'Jharkhand',       abbr:'JH', praaptiTier:'low',      txConstraint:'adequate',        rbiFiscalTier:'moderate' },
];

/* ─── Transmission bottlenecks (seed) ────────────────────────────────────────
   Each item names a publicly documented RE evacuation / green-corridor
   constraint. Status tags reflect CEA's own classification in its
   transmission plan documents:
     green  = no documented binding constraint
     amber  = evacuation being built / phased
     red    = documented constraint or delayed augmentation
   ─────────────────────────────────────────────────────────────────────────── */

const _TX_BOTTLENECKS_SEED = [
  { region: 'Rajasthan — Jaisalmer/Barmer RE Zone',      capacity: 'RE Zone Phase-III', issues: 'Evacuation being strengthened under GEC-II / REZ plan', status: 'amber', sourceKey: 'ceaTx' },
  { region: 'Gujarat — Khavda RE Park evacuation',       capacity: 'Multi-GW',          issues: 'ISTS phased build; intermediate constraint',           status: 'amber', sourceKey: 'ceaTx' },
  { region: 'Karnataka — Pavagada / Tumkur corridor',    capacity: 'Pavagada Park',     issues: 'STU + ISTS augmentation',                              status: 'amber', sourceKey: 'ceaTx' },
  { region: 'Tamil Nadu — Tirunelveli / Southern Grid',  capacity: 'Southern corridor', issues: 'Documented evacuation constraint',                      status: 'red',   sourceKey: 'ceaTx' },
  { region: 'Andhra Pradesh — Kurnool / Anantapur',      capacity: 'Solar Park cluster',issues: '400kV augmentation planned',                            status: 'amber', sourceKey: 'ceaTx' },
  { region: 'Madhya Pradesh — Rewa / Agar',              capacity: 'Solar Parks',       issues: 'STU congestion at peak',                                status: 'amber', sourceKey: 'ceaTx' },
];

/* ─── Curtailment / congestion watchlist (seed) ──────────────────────────────
   IMPORTANT: This replaces the previous invented state-wise curtailment-%
   series. Clean, publicly-attested state-level curtailment percentages are
   not published; GRID-India / CEA publish system-wide or corridor-level
   references. The block is therefore a qualitative watchlist of congestion
   & curtailment-risk locations, with source links.
   ─────────────────────────────────────────────────────────────────────────── */

const _CURTAILMENT_WATCHLIST_SEED = [
  { scope: 'Tamil Nadu southern corridor',    flag: 'Documented constraint', sourceKey: 'gridIndia' },
  { scope: 'Andhra Pradesh — Kurnool cluster',flag: 'Evacuation augmentation pending', sourceKey: 'ceaTx' },
  { scope: 'Karnataka — Pavagada',            flag: 'Periodic congestion reported',    sourceKey: 'gridIndia' },
  { scope: 'Gujarat — Khavda build-out',      flag: 'Phased ISTS; watch intermediate constraint', sourceKey: 'ceaTx' },
  { scope: 'Rajasthan REZ',                   flag: 'Evacuation strengthening (GEC-II / REZ-III)', sourceKey: 'ceaTx' },
  { scope: 'System-wide RE curtailment',      flag: 'Refer GRID-India reports — state-level % not centrally published', sourceKey: 'gridIndia' },
];

/* ─── Risk flags & watchlist (seed) ──────────────────────────────────────────
   Each item references a specific public-domain theme with a linkable source.
   Scraped data can enrich these later (e.g. with specific order numbers).
   ─────────────────────────────────────────────────────────────────────────── */

const _RISK_FLAGS_SEED = [
  { level:'flag-medium', icon:'fa-money-bill-wave',       title:'DISCOM dues — track state-wise stress',
    detail:'PRAAPTI publishes monthly DISCOM outstanding/overdue to generators. Post-LPS Rules 2022 trajectory is down but still elevated.',
    sourceKey:'praapti' },
  { level:'flag-medium', icon:'fa-tower-broadcast',       title:'RE evacuation — active build-out zones',
    detail:'CEA plan for integration of 500+ GW RE names Rajasthan REZ, Khavda, Pavagada, Tirunelveli, Kurnool as priority evacuation build-outs.',
    sourceKey:'ceaTx' },
  { level:'flag-medium', icon:'fa-ban',                    title:'RE curtailment — no clean state-wise %',
    detail:'GRID-India publishes system-wide / corridor-level references; clean state-wise curtailment % is not centrally published. Treat state values with care.',
    sourceKey:'gridIndia' },
  { level:'flag-medium', icon:'fa-scale-balanced',         title:'CERC regulatory watch — DSM / payment security',
    detail:'Regulatory orders on DSM framework and payment-security mechanisms materially affect settlement risk for RE generators.',
    sourceKey:'cerc' },
  { level:'flag-medium', icon:'fa-landmark',               title:'State fiscal stress — RBI State Finances',
    detail:'Punjab, Himachal Pradesh, Kerala, West Bengal, Rajasthan and Bihar carry elevated debt/GSDP per RBI\'s annual study — relevant for DISCOM subsidy dependence.',
    sourceKey:'rbi' },
];

const _WATCHLIST_SEED = [
  { state:'Tamil Nadu',     alert:'PRAAPTI dues historically elevated · southern-grid evacuation documented',  severity:'high',     sourceKey:'praapti' },
  { state:'Andhra Pradesh', alert:'PRAAPTI dues elevated · 400kV augmentation pending at Kurnool',             severity:'high',     sourceKey:'praapti' },
  { state:'Telangana',      alert:'PRAAPTI dues historically elevated',                                        severity:'medium',   sourceKey:'praapti' },
  { state:'Maharashtra',    alert:'MSEDCL dues historically material',                                         severity:'medium',   sourceKey:'praapti' },
  { state:'Punjab',         alert:'RBI fiscal-stress tier: elevated debt/GSDP · PSPCL subsidy dependence',     severity:'medium',   sourceKey:'rbi'     },
  { state:'Bihar',          alert:'RBI fiscal-stress tier: elevated debt/GSDP',                                severity:'medium',   sourceKey:'rbi'     },
  { state:'Rajasthan',      alert:'RBI fiscal-stress tier: elevated · REZ evacuation under active build-out',  severity:'medium',   sourceKey:'rbi'     },
];

/* ─── Risk-score methodology (explicit) ──────────────────────────────────────

     score = praaptiPts + txPts + rbiPts                 (max 100)

     praaptiPts  (DISCOM payment stress, max 40)
       high=40, moderate=20, low=5, unknown=0

     txPts       (RE evacuation / ISTS constraint, max 35)
       critical=35, active-buildout=18, adequate=5, unknown=0

     rbiPts      (state fiscal stress, max 25)
       high=25, moderate=12, low=3, unknown=0

     risk tag from score
       <40           → 'low'
       40–59         → 'medium'
       60–74         → 'high'
       ≥75           → 'vhigh'

   This formula is intentionally transparent so any value can be audited
   back to the three tier inputs, each of which is sourced.
   ─────────────────────────────────────────────────────────────────────────── */

const _PRAAPTI_PTS = { high:40, moderate:20, low:5, unknown:0 };
const _TX_PTS      = { 'critical':35, 'active-buildout':18, 'adequate':5, 'unknown':0 };
const _RBI_PTS     = { high:25, moderate:12, low:3, unknown:0 };

function _riskTagFromScore(score) {
  if (score >= 75) return 'vhigh';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function _computeStateRisk(entry) {
  const score = (_PRAAPTI_PTS[entry.praaptiTier] ?? 0)
              + (_TX_PTS[entry.txConstraint]     ?? 0)
              + (_RBI_PTS[entry.rbiFiscalTier]   ?? 0);
  return { ...entry, score, risk: _riskTagFromScore(score) };
}

/* ─── Overlay: attempt to load scrape output and enrich the seed ─────────── */

const GRID_RISK_STATE = {
  scrapedAt:        null,             // ISO timestamp from data/grid-risk.json
  praaptiAsOf:      null,             // as-of string from PRAAPTI when scraped
  praaptiTotalCr:   null,             // total outstanding dues across all DISCOMs (₹Cr)
  praaptiOverdueCr: null,             // total overdue (₹Cr)
  stateDuesByState: new Map(),        // state → { outstandingCr, overdueCr }
  sourceStatus:     {},               // key → { ok, fetchedAt, error }
};

async function loadGridRiskOverlay() {
  try {
    const r = await fetch('./data/grid-risk.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('no overlay JSON');
    const j = await r.json();

    GRID_RISK_STATE.scrapedAt = j.scrapedAt || null;

    const praapti = j.sources?.praapti;
    if (praapti?.ok && praapti.extracted) {
      const e = praapti.extracted;
      GRID_RISK_STATE.praaptiAsOf      = e.asOfDate           ?? null;
      GRID_RISK_STATE.praaptiTotalCr   = e.totalOutstandingCr ?? null;
      GRID_RISK_STATE.praaptiOverdueCr = e.totalOverdueCr     ?? null;
      if (Array.isArray(e.stateDues)) {
        for (const row of e.stateDues) {
          if (!row?.state) continue;
          const key = _normState(row.state);
          GRID_RISK_STATE.stateDuesByState.set(key, {
            outstandingCr: typeof row.outstandingCr === 'number' ? row.outstandingCr : null,
            overdueCr:     typeof row.overdueCr     === 'number' ? row.overdueCr     : null,
          });
        }
      }
    }

    // Record per-source status for the UI "Sources" footer.
    for (const [k, v] of Object.entries(j.sources || {})) {
      GRID_RISK_STATE.sourceStatus[k] = {
        ok:        !!v.ok,
        fetchedAt: v.fetchedAt || null,
        error:     v.error     || null,
      };
    }

    return true;
  } catch {
    return false;   // no overlay — seed alone is rendered
  }
}

function _normState(s) {
  return String(s || '').trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^ap$/, 'andhra pradesh')
    .replace(/^mh$/, 'maharashtra')
    .replace(/^tn$/, 'tamil nadu')
    .replace(/^ts$/, 'telangana')
    .replace(/^up$/, 'uttar pradesh')
    .replace(/^mp$/, 'madhya pradesh');
}

/* ─── Public accessors consumed by tab-grid.js ──────────────────────────── */

function getGridRiskStates() {
  return _STATE_RISK_SEED.map(s => {
    const enriched = _computeStateRisk(s);
    const dues     = GRID_RISK_STATE.stateDuesByState.get(_normState(s.state));
    return {
      ...enriched,
      discomDuesCr:       dues?.outstandingCr ?? null,   // null = not scraped
      discomOverdueCr:    dues?.overdueCr     ?? null,
      duesAsOf:           GRID_RISK_STATE.praaptiAsOf,
      duesSourceUrl:      GRID_RISK_SOURCES.praapti.url,
      txSourceUrl:        GRID_RISK_SOURCES.ceaTx.url,
      rbiSourceUrl:       GRID_RISK_SOURCES.rbi.url,
    };
  });
}

function getGridRiskTxBottlenecks() {
  return _TX_BOTTLENECKS_SEED.map(t => ({ ...t, sourceUrl: GRID_RISK_SOURCES[t.sourceKey]?.url }));
}

function getGridRiskCurtailmentWatchlist() {
  return _CURTAILMENT_WATCHLIST_SEED.map(c => ({ ...c, sourceUrl: GRID_RISK_SOURCES[c.sourceKey]?.url }));
}

function getGridRiskFlags() {
  return _RISK_FLAGS_SEED.map(f => ({ ...f, sourceUrl: GRID_RISK_SOURCES[f.sourceKey]?.url }));
}

function getGridRiskWatchlist() {
  return _WATCHLIST_SEED.map(w => ({ ...w, sourceUrl: GRID_RISK_SOURCES[w.sourceKey]?.url }));
}

function getGridRiskAggregates() {
  // Composite state-risk-index = mean score across states (0-100).
  const states = getGridRiskStates();
  const meanScore = states.reduce((a, s) => a + s.score, 0) / states.length;
  const highPlus = states.filter(s => s.risk === 'high' || s.risk === 'vhigh').length;

  const paymentRiskLabel =
    meanScore >= 60 ? 'High' :
    meanScore >= 40 ? 'Medium' :
    'Low';

  return {
    meanRiskScore:     Math.round(meanScore),
    highPlusCount:     highPlus,
    totalStates:       states.length,
    paymentRiskLabel,
    praaptiTotalCr:    GRID_RISK_STATE.praaptiTotalCr,
    praaptiOverdueCr:  GRID_RISK_STATE.praaptiOverdueCr,
    praaptiAsOf:       GRID_RISK_STATE.praaptiAsOf,
    scrapedAt:         GRID_RISK_STATE.scrapedAt,
  };
}
