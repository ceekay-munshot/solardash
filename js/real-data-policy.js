/* ═══════════════════════════════════════════════════════════════════════════
   POLICY & REGULATION MONITOR — SEED DATASET + LIVE REFRESH ENGINE
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 5 → Policy & Regulation Monitor (all 5 blocks)
   ───────────────────────────────────────────────────────────────────────────

   CORS PROBE RESULTS (from GitHub Pages origin ceekay-munshot.github.io):
     mnre.gov.in      → HTTP 200, CORS: NONE → browser fetch blocked
     cercind.gov.in   → HTTP 503, CORS: NONE → browser fetch blocked
     powermin.gov.in  → HTTP 403, CORS: NONE → browser fetch blocked
     cbic.gov.in      → HTTP 503, CORS: NONE → browser fetch blocked
     dgtr.gov.in      → HTTP 503, CORS: NONE → browser fetch blocked
     api.anthropic.com → access-control-allow-methods + allow-headers  ✓ CORS-OK

   LIVE REFRESH ARCHITECTURE:
     Browser → api.anthropic.com (CORS-enabled) → web_search → official sites → JSON
     Model: claude-sonnet-4-20250514 with web_search tool
     The API has the CORS headers; government sites do not.

   SEED DATA SOURCES (all official primary sources, verified via server-side fetch):
     MNRE   : mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/
              mnre.gov.in/en/notice/publishing-almm-list-ii-for-solar-pv-cells/
              mnre.gov.in/en/notice/amendment-to-almm-order-for-implementation-of-almm-for-solar-pv-cells/
     CERC   : cercind.gov.in/Current_reg.html
     MoP    : beeindia.gov.in/renewable-consumption-obligations-rco.php
     DGTR   : dgtr.gov.in (Case AD(OI)-24/2024 Final Findings, 29 Sep 2025)
     CBIC   : cbic.gov.in (Notification 45/2025 + 02/2026, Gazette of India)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── API Key for live refresh ──────────────────────────────────────────────
   Obtain a key at: https://console.anthropic.com/
   Paste it below to enable the Refresh button.
   Without a key the tab shows seed data; all 5 blocks still work.
   ─────────────────────────────────────────────────────────────────────────── */
const POLICY_API_KEY = '';   // ← paste your key: 'sk-ant-...'

/* ─── Dataset schema ─────────────────────────────────────────────────────────
   id               unique kebab-case slug
   date             "YYYY-MM-DD"  (date notice was issued)
   authority        "MNRE" | "CERC" | "MoP" | "DGTR" | "CBIC"
   title            verbatim or near-verbatim from official document
   category         see POLICY_CATEGORIES below
   documentType     "Order"|"Notification"|"Circular"|"OM"|"Regulation"|
                    "Guidelines"|"Final Findings"|"Gazette Notification"
   effectiveDate    "YYYY-MM-DD" | null  — only when explicitly stated
   complianceDeadline "YYYY-MM-DD" | null — only when explicitly stated
   sourceUrl        direct URL to official page or document
   summary          2–3 factual sentences from the official source
   impactTag        "High"|"Medium"|"Low"|"Neutral"
   ─────────────────────────────────────────────────────────────────────────── */

const POLICY_CATEGORIES = [
  'ALMM', 'Tariff', 'RCO/RPO', 'Trade Remedy',
  'Customs', 'Grid Code', 'Transmission', 'Procurement', 'Connectivity', 'Other',
];

let POLICY_DATASET = [

  /* ══════════════════════════════════════════════════════════════════════════
     MNRE — ALMM & Module/Cell Mandates
     Verified from: mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/
     ══════════════════════════════════════════════════════════════════════════ */
  {
    id: 'mnre-almm-list1-mar2026',
    date: '2026-03-01',
    authority: 'MNRE',
    title: 'ALMM List-I for Solar PV Modules – Updated (1 Mar 2026)',
    category: 'ALMM',
    documentType: 'Notification',
    effectiveDate: null,
    complianceDeadline: null,
    sourceUrl: 'https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/',
    summary: 'MNRE updated the Approved List of Models and Manufacturers (ALMM) List-I for solar PV modules as of 1 March 2026. All government-scheme solar projects must source modules from List-I. This is the most recent revision of the mandatory approved module manufacturer list.',
    impactTag: 'Medium',
  },
  {
    id: 'mnre-almm-list2-rev5-2026',
    date: '2026-02-13',
    authority: 'MNRE',
    title: 'ALMM List-II for Solar PV Cells – 5th Revision',
    category: 'ALMM',
    documentType: 'Notification',
    effectiveDate: null,
    complianceDeadline: null,
    sourceUrl: 'https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/',
    summary: 'MNRE published the 5th revision of ALMM List-II for solar PV cells with further additions to total enlisted cell manufacturing capacity. Builds on the 4th revision (5 Feb 2026) which had enlarged capacity to 26 GW across domestic manufacturers.',
    impactTag: 'Medium',
  },
  {
    id: 'mnre-almm-list2-rev4-2026',
    date: '2026-02-05',
    authority: 'MNRE',
    title: 'ALMM List-II for Solar PV Cells – 4th Revision (26 GW)',
    category: 'ALMM',
    documentType: 'Notification',
    effectiveDate: null,
    complianceDeadline: null,
    sourceUrl: 'https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/',
    summary: 'MNRE enlarged total enlisted solar cell manufacturing capacity to 26 GW. New entrant Evervolt Solar Technology was added (1,074 MW). Premier Energies and Adani\'s Mundra Solar PV received expanded capacity approvals for N-type TOPCon cells.',
    impactTag: 'Medium',
  },
  {
    id: 'mnre-almm-list2-first-2025',
    date: '2025-07-31',
    authority: 'MNRE',
    title: 'ALMM List-II for Solar PV Cells – First Publication (13 GW)',
    category: 'ALMM',
    documentType: 'Notification',
    effectiveDate: '2026-07-01',
    complianceDeadline: '2026-06-01',
    sourceUrl: 'https://mnre.gov.in/en/notice/publishing-almm-list-ii-for-solar-pv-cells/',
    summary: 'MNRE published the inaugural ALMM List-II for solar PV cells, enlisting 9 domestic manufacturers with 13,067 MW cumulative annual production capacity. Cut-off date for bid-submission exemptions set as 31 August 2025. Mandatory for projects commissioned on or after 1 June 2026; list validity July 2025 to July 2029.',
    impactTag: 'High',
  },
  {
    id: 'mnre-almm-amendment-2025',
    date: '2025-07-28',
    authority: 'MNRE',
    title: 'ALMM Order Amendment – Implementation Clarification for Solar PV Cells',
    category: 'ALMM',
    documentType: 'OM',
    effectiveDate: '2025-07-28',
    complianceDeadline: null,
    sourceUrl: 'https://mnre.gov.in/en/notice/amendment-to-almm-order-for-implementation-of-almm-for-solar-pv-cells/',
    summary: 'MNRE amended the ALMM order for solar PV cells to clarify that List-II cells become mandatory one month after publication of the list. Projects submitting bids under Section 63 of the Electricity Act before the cut-off date are exempt from the ALMM cell mandate, even if commissioning occurs after 1 June 2026. DCR provisions under PM-KUSUM, PM Surya Ghar, and CPSU Scheme Phase-II are not relaxed.',
    impactTag: 'High',
  },

  /* ══════════════════════════════════════════════════════════════════════════
     MINISTRY OF POWER — RCO Framework
     Verified from: beeindia.gov.in/renewable-consumption-obligations-rco.php
     ══════════════════════════════════════════════════════════════════════════ */
  {
    id: 'mop-rco-notification-sep2025',
    date: '2025-09-27',
    authority: 'MoP',
    title: 'Revised Renewable Consumption Obligation (RCO) Notification 2025',
    category: 'RCO/RPO',
    documentType: 'Gazette Notification',
    effectiveDate: '2024-04-01',
    complianceDeadline: '2025-10-31',
    sourceUrl: 'https://beeindia.gov.in/renewable-consumption-obligations-rco.php',
    summary: 'Ministry of Power issued revised RCO framework under Energy Conservation Act, 2001, superseding the earlier Renewable Purchase Obligation (RPO) regime. Specifies legally binding RE consumption targets rising from 29.91% (FY2024-25) to 43.33% (FY2029-30). FY2024-25 compliance reports due 31 October 2025; shortfall resolution (via RECs, VPPAs, or buyout) due 31 March 2026. Applies to distribution licensees, open-access consumers, and captive users.',
    impactTag: 'High',
  },

  /* ══════════════════════════════════════════════════════════════════════════
     CERC — Regulations and Orders
     Verified from: cercind.gov.in/Current_reg.html + powerpeakdigest.com (sec. confirm)
     ══════════════════════════════════════════════════════════════════════════ */
  {
    id: 'cerc-vppa-guidelines-dec2025',
    date: '2025-12-24',
    authority: 'CERC',
    title: 'CERC Guidelines for Virtual Power Purchase Agreements (VPPAs)',
    category: 'Procurement',
    documentType: 'Guidelines',
    effectiveDate: '2025-12-24',
    complianceDeadline: null,
    sourceUrl: 'https://cercind.gov.in/Current_reg.html',
    summary: 'CERC issued formal VPPA guidelines enabling designated consumers to meet RCO targets through virtual power purchase agreements without physical power delivery. RECs obtained through VPPAs are eligible for RCO compliance under the MoP September 2025 framework. Anchors VPPA as a recognized compliance route under India\'s 500 GW non-fossil target.',
    impactTag: 'High',
  },
  {
    id: 'cerc-dsm-amendment2-2025',
    date: '2025-09-15',
    authority: 'CERC',
    title: 'CERC (Deviation Settlement Mechanism) (Second Amendment) Regulations, 2025',
    category: 'Grid Code',
    documentType: 'Regulation',
    effectiveDate: '2026-04-01',
    complianceDeadline: null,
    sourceUrl: 'https://cercind.gov.in/Current_reg.html',
    summary: 'CERC notified tighter deviation tolerance bands for wind and solar sellers under the DSM framework. New calculation method (value of "X") for deviation percentage takes effect 1 April 2026; CERC issued specific X values via order dated 31 March 2026. Tolerance margins continue to narrow annually through 2031, progressively aligning RE sellers with conventional plant grid discipline.',
    impactTag: 'High',
  },
  {
    id: 'cerc-ists-sharing-4th-amdt-2025',
    date: '2025-07-30',
    authority: 'CERC',
    title: 'CERC (Sharing of ISTS Charges and Losses) (4th Amendment) Regulations, 2025',
    category: 'Transmission',
    documentType: 'Regulation',
    effectiveDate: '2025-07-30',
    complianceDeadline: null,
    sourceUrl: 'https://cercind.gov.in/Current_reg.html',
    summary: 'CERC amended inter-state transmission charge and loss sharing regulations. An addendum to the order was issued on 14 January 2026 with further operational clarifications. Affects transmission cost allocation for inter-state RE projects accessing the central grid.',
    impactTag: 'Medium',
  },
  {
    id: 'cerc-re-tariff-reg-2024',
    date: '2024-07-09',
    authority: 'CERC',
    title: 'CERC (Terms & Conditions for Tariff from Renewable Energy Sources) Regulations, 2024',
    category: 'Tariff',
    documentType: 'Regulation',
    effectiveDate: '2024-04-01',
    complianceDeadline: null,
    sourceUrl: 'https://cercind.gov.in/Current_reg.html',
    summary: 'CERC notified RE Tariff Regulations establishing the framework for the FY2024-25 to FY2026-27 control period. Solar, wind, and hybrid project tariffs are determined on a project-specific basis. Generic levelised tariffs for small hydro, biomass, and non-fossil cogeneration issued annually; generic tariff for FY2025-26 (Jul 2025–Mar 2026) issued separately via order dated July 2025.',
    impactTag: 'Medium',
  },

  /* ══════════════════════════════════════════════════════════════════════════
     DGTR — Trade Remedy: Anti-Dumping on Solar Cells from China
     Verified from: Case AD(OI)-24/2024 Final Findings (30 Sep 2025), Gazette of India
     ══════════════════════════════════════════════════════════════════════════ */
  {
    id: 'dgtr-ad-solar-cells-final-sep2025',
    date: '2025-09-29',
    authority: 'DGTR',
    title: 'Anti-Dumping Final Findings — Solar Cells from China PR (Case AD(OI)-24/2024)',
    category: 'Trade Remedy',
    documentType: 'Final Findings',
    effectiveDate: null,
    complianceDeadline: null,
    sourceUrl: 'https://www.dgtr.gov.in/',
    summary: 'DGTR issued definitive final findings recommending anti-dumping duties on imports of solar cells and modules from China for 3 years. Recommended rates: 0% (Jinko Solar, Trina Solar cooperative groups), 23% (Aiko Group), 30% (all other Chinese producers/exporters). Awaiting Ministry of Finance gazette notification. Rajasthan High Court granted interim stay in December 2025; judicial proceedings ongoing.',
    impactTag: 'High',
  },

  /* ══════════════════════════════════════════════════════════════════════════
     CBIC — Customs Duty Notifications for Solar Manufacturing Inputs
     Verified from: Gazette of India Extraordinary (indiabudget.gov.in, cbic.gov.in)
     ══════════════════════════════════════════════════════════════════════════ */
  {
    id: 'cbic-notif-02-2026-customs',
    date: '2026-02-01',
    authority: 'CBIC',
    title: 'Customs Notification No. 02/2026 — Budget 2026-27 BCD Amendments (Solar)',
    category: 'Customs',
    documentType: 'Gazette Notification',
    effectiveDate: '2026-02-01',
    complianceDeadline: '2026-04-01',
    sourceUrl: 'https://www.cbic.gov.in/',
    summary: 'Union Budget 2026-27 amended Notification 45/2025-Customs to extend BCD exemptions for solar PV manufacturing capital goods to 31 March 2028. Removes 7.5% BCD on sodium antimonate used in solar glass production. Extends BCD exemption on capital goods for lithium-ion cell manufacturing. BCD exemption for silicon used in un-diffused wafers and solar cell manufacturing lapses from 1 April 2026.',
    impactTag: 'High',
  },
  {
    id: 'cbic-notif-45-2025-customs',
    date: '2025-10-24',
    authority: 'CBIC',
    title: 'Customs Notification No. 45/2025 — Consolidated Master Exemption Notification',
    category: 'Customs',
    documentType: 'Gazette Notification',
    effectiveDate: '2025-11-01',
    complianceDeadline: null,
    sourceUrl: 'https://www.cbic.gov.in/',
    summary: 'CBIC consolidated 31 previous customs exemption notifications into a single master notification (G.S.R. 781(E)), effective 1 November 2025. Includes updated BCD exemption lists for solar PV manufacturing inputs (Lists 12 and 29) and wind turbine components with concessional rates extended to 31 March 2027. Single authoritative legal reference for all BCD, IGST, and compensation cess exemptions on imported goods.',
    impactTag: 'Medium',
  },
];

/* ─── Refresh state ──────────────────────────────────────────────────────── */
let POLICY_LAST_REFRESHED = null;   // null → using seed data; Date → live fetch
let POLICY_REFRESH_MODE   = 'seed'; // 'seed' | 'live'
const POLICY_SEED_AS_OF   = '15 Apr 2026';

/* ─── Live Refresh: Anthropic API prompt ────────────────────────────────── */
const _POLICY_REFRESH_SYSTEM = `You are a regulatory intelligence assistant for India's solar energy sector. Search official Indian government websites and return a JSON array of the latest policy notices, orders, circulars, and regulations relevant to solar power investors and project developers.

MANDATORY OFFICIAL SOURCES (search in priority order):
1. MNRE ALMM page: https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/
2. MNRE Current Notices: https://mnre.gov.in/en/notice-category/current-notices/
3. MNRE Policies: https://mnre.gov.in/en/policies-and-regulations/
4. CERC Regulations: https://cercind.gov.in/Current_reg.html
5. MoP / BEE RCO page: https://beeindia.gov.in/renewable-consumption-obligations-rco.php
6. DGTR trade remedy pages: https://www.dgtr.gov.in/
7. CBIC customs notifications: https://www.cbic.gov.in/

Return ONLY a valid JSON array — no markdown fences, no explanation, no preamble. Start with [ and end with ].

Each object must have exactly these fields:
{
  "id": "unique-kebab-slug",
  "date": "YYYY-MM-DD",
  "authority": "MNRE"|"CERC"|"MoP"|"DGTR"|"CBIC",
  "title": "exact title from official document",
  "category": "ALMM"|"Tariff"|"RCO/RPO"|"Trade Remedy"|"Customs"|"Grid Code"|"Transmission"|"Procurement"|"Connectivity"|"Other",
  "documentType": "Order"|"Notification"|"Circular"|"OM"|"Regulation"|"Guidelines"|"Final Findings"|"Gazette Notification",
  "effectiveDate": "YYYY-MM-DD" or null,
  "complianceDeadline": "YYYY-MM-DD" or null,
  "sourceUrl": "direct URL",
  "summary": "2-3 factual sentences from official document",
  "impactTag": "High"|"Medium"|"Low"|"Neutral"
}

Rules:
- Include notices from last 12 months, newest first, 10-15 items
- Only notices directly relevant to solar projects, manufacturing, or procurement
- effectiveDate and complianceDeadline: only set when explicitly stated in official document
- impactTag: High=immediate compliance obligation or duty change, Medium=future procedural change, Low=minor admin revision, Neutral=unclear (default)
- No staff recruitment or admin notices`;

/* ─── Live Refresh Function ─────────────────────────────────────────────── */
async function policyLiveRefresh() {
  if (!POLICY_API_KEY || !POLICY_API_KEY.trim()) throw new Error('NO_API_KEY');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         POLICY_API_KEY.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system:     _POLICY_REFRESH_SYSTEM,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      messages:   [{
        role:    'user',
        content: 'Search the official sources and return the latest India solar sector policy notices as a JSON array. Include MNRE ALMM updates, CERC DSM/tariff/connectivity regulations, MoP RCO updates, DGTR anti-dumping investigations on solar inputs from China, and CBIC customs notifications for solar manufacturing. Return only the JSON array.',
      }],
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `API ${res.status}`);
  }

  const body = await res.json();
  const txt = (body.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  if (!txt) throw new Error('Empty API response');

  // Strip markdown fences and find array
  let raw = txt.replace(/^```(?:json)?\s*/im, '').replace(/\s*```$/im, '').trim();
  const s = raw.indexOf('['), e2 = raw.lastIndexOf(']');
  if (s === -1 || e2 === -1) throw new Error('No JSON array in response');
  raw = raw.slice(s, e2 + 1);

  const arr = JSON.parse(raw);
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('Empty dataset');

  // Normalize fields
  arr.forEach(n => {
    if (!n.effectiveDate)    n.effectiveDate    = null;
    if (!n.complianceDeadline) n.complianceDeadline = null;
    if (!n.impactTag)        n.impactTag        = 'Neutral';
    if (!n.id)               n.id               = n.date + '-' + n.authority.toLowerCase();
  });

  return arr;
}
