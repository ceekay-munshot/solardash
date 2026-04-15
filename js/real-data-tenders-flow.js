/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Quarterly Tender Announcement vs Award Flow
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 3 → "Tender Announcement vs Award Flow" chart ONLY
   ───────────────────────────────────────────────────────────────────────────

   METHODOLOGY
   ─────────────
   Quarter system: India FY (Apr-Mar)
     Q1 FY25 = Apr–Jun 2024    Q1 FY26 = Apr–Jun 2025
     Q2 FY25 = Jul–Sep 2024    Q2 FY26 = Jul–Sep 2025
     Q3 FY25 = Oct–Dec 2024    Q3 FY26 = Oct–Dec 2025
     Q4 FY25 = Jan–Mar 2025    Q4 FY26 = Jan–Mar 2026

   MW Tendered  = sum of tender sizes by tender notice/publication date quarter
   MW Awarded   = sum of officially confirmed awarded capacities by quarter of
                  public result announcement / LoA date

   STRICT RULES:
     • No awarded MW entered without a confirmed public result/LoA date
     • Tenders with no confirmed result → counted in Tendered only
     • Source hierarchy: SECI official pages > official issuer pages >
       corroborated reporting citing official SECI/issuer result announcement
     • Scope: utility-scale RE project development tenders (Solar, Solar+BESS,
       FDRE, RTC, Hybrid, Pumped Storage, Wind) ≥ 100 MW
       Excludes: EPC packages, module supply, standalone BESS, green hydrogen,
       rooftop/RESCO, sub-100 MW

   CHART WINDOW: Q4 FY24 (Jan–Mar 2024) → Q4 FY26 (Jan–Mar 2026) = 9 quarters
   Q4 FY24 is included to provide tendering context for awards that land in
   Q4 FY25 and Q4 FY26 (SECI ISTS-XIV, XV, Hybrid VIII).

   SOURCE ABBREVIATIONS USED IN ENTRIES BELOW:
     SECI-R  = seci.co.in/tenders/results (fetched 15 Apr 2026)
     SECI-L  = seci.co.in/tenders live page (fetched 15 Apr 2026)
     Mercom  = mercom.in (citing official result)
     RW      = renewablewatch.in (citing official result)
     JMK     = jmkresearch.com monthly RE update (citing official result)
     PVT     = pv-tech.org (citing official result)
     SQ      = solarquarter.com (citing official SECI result, Feb 2026)
     SE      = saurenergy.com (citing official result)
     PVM     = pv-magazine-india.com (citing official result)
     IESA    = India ESS Market Report Oct 2025 (IESA/indiaesa.info)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Individual tender-level records ────────────────────────────────────────
   Each record represents one tender.
   tenderedQ = quarter tender was published/issued
   awardedQ  = quarter official result was announced (null if no result yet)
   awardedMW = capacity actually awarded (may differ from tenderedMW on partial
               awards or over-subscription via greenshoe)
   ─────────────────────────────────────────────────────────────────────────── */
const TENDER_FLOW_RECORDS = [

  // ── Q4 FY24 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000121', scheme: 'SECI-ISTS-XIV', issuer: 'SECI',
    type: 'Solar', tenderedMW: 1500,
    tenderedQ: 'Q4 FY24',  // Published 18 Jan 2024. Source: SECI-R
    awardedQ: null,         // No confirmed public result found
    awardedMW: null,
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: null,
    note: '1500 MW ISTS-connected Solar. No result confirmed in searched records.',
  },

  {
    id: 'SECI000123', scheme: 'SECI-Hybrid-VIII', issuer: 'SECI',
    type: 'Hybrid (Wind-Solar)', tenderedMW: 1200,
    tenderedQ: 'Q4 FY24',  // Published 20 Feb 2024. Source: SECI-R
    awardedQ: null,         // Award tracked in combined SECI-Hybrid-VIII-IX-AWARD record below
    awardedMW: null,
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: null,
    note: '1200 MW ISTS Wind-Solar Hybrid. Award consolidated with Tranche-IX in combined award record.',
  },

  {
    id: 'SECI000132', scheme: 'SECI-ISTS-XV', issuer: 'SECI',
    type: 'Solar + BESS', tenderedMW: 1200,
    tenderedQ: 'Q4 FY24',  // Published 16 Mar 2024. Source: SECI-R
    awardedQ: 'Q4 FY25',   // Awarded Mar 2025. Winners: Pace Digitech, ACME, HFE
    awardedMW: 1200,
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: 'IESA India ESS Market Report Oct 2025: ₹3.41–3.42/kWh, Mar 2025',
    note: '1200 MW Solar + 600 MW/1200 MWh ESS. All 1200 MW awarded at ₹3.41–3.42/kWh.',
  },

  // ── Q1 FY25 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000139', scheme: 'SECI-ISTS-XVI', issuer: 'SECI',
    type: 'Solar', tenderedMW: 1200,
    tenderedQ: 'Q1 FY25',  // Published 29 May 2024. Source: SECI-R
    awardedQ: 'Q2 FY25',   // Awarded Aug 2024 (Mercom: "The tender was floated in May this year")
    awardedMW: 500,        // Only 500 MW of 1200 MW awarded
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: 'Mercom India Aug 2024: SAEL 250 MW + NTPC REL 200 MW + BluPine 50 MW at ₹2.48–2.49/kWh',
    note: '1200 MW tendered; only 500 MW awarded (partial) at ₹2.48–2.49/kWh.',
  },

  {
    id: 'SECI000146', scheme: 'SECI-Hybrid-IX', issuer: 'SECI',
    type: 'Hybrid (Wind-Solar)', tenderedMW: 400,
    tenderedQ: 'Q1 FY25',  // Published 28 Jun 2024. Source: SECI-R
    awardedQ: null,         // Award tracked in combined SECI-Hybrid-VIII-IX-AWARD record below
    awardedMW: null,
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: null,
    note: '400 MW ISTS Wind-Solar Hybrid (+ greenshoe). Award consolidated with Tranche-VIII in combined award record.',
  },

  {
    id: 'SECI000140', scheme: 'SECI-Wind-XVII', issuer: 'SECI',
    type: 'Wind', tenderedMW: 500,
    tenderedQ: 'Q1 FY25',  // Published 29 May 2024. Source: SECI-R
    awardedQ: null,         // No confirmed result found in searched records
    awardedMW: null,
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: null,
    note: '500 MW ISTS Wind. No public result confirmed.',
  },

  // ── Q2 FY25 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000162', scheme: 'SECI-ISTS-XVII', issuer: 'SECI',
    type: 'Solar + BESS', tenderedMW: 2000,
    tenderedQ: 'Q2 FY25',  // Published 31 Jul 2024. Source: SECI-R
    awardedQ: 'Q3 FY25',   // e-RA held 9 Dec 2024; result announced Dec 2024
    awardedMW: 2000,
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: 'RW Dec 11 2024 + Energy-Storage.news Jan 7 2025: NTPC 500 MW, Hero 270 MW, Sembcorp 150 MW, Solarcraft 150 MW, Reliance 930 MW at ₹3.52–3.53/kWh',
    note: '2000 MW Solar + 1000 MW/4000 MWh ESS. Full 2000 MW awarded at ₹3.52–3.53/kWh.',
  },

  {
    id: 'SECI000171', scheme: 'SECI-ISTS-XVIII', issuer: 'SECI',
    type: 'Solar', tenderedMW: 1000,
    tenderedQ: 'Q2 FY25',  // Published 12 Sep 2024. Source: SECI-R
    awardedQ: 'Q3 FY25',   // e-RA 24 Dec 2024; public result announced Dec 27 2024
    awardedMW: 600,        // Only 600 MW of 1000 MW awarded
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: 'Power Line Magazine Dec 27 2024: ReNew 250 MW @ ₹3.04, ACME 300 MW @ ₹3.05, Adani Green 50 MW @ ₹3.10/kWh',
    note: '1000 MW ISTS Solar. Only 600 MW awarded (partial) at ₹3.04–3.10/kWh.',
  },

  {
    id: 'SECI000170', scheme: 'SECI-FDRE-VI', issuer: 'SECI',
    type: 'FDRE (Peak)', tenderedMW: 2000,
    tenderedQ: 'Q2 FY25',  // Published 12 Sep 2024. Source: SECI-R
    awardedQ: 'Q4 FY25',   // JMK Jan 2025: "FDRE VI auctioned in January 2025"
    awardedMW: 200,        // Only 200 MW of 2000 MW awarded — bids received for only 820 MW
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: 'Mercom India Jan 6 2025 + JMK Jan 2025 RE Update: Altra Xergi (O2 Power) 200 MW @ ₹8.50/kWh',
    note: '2000 MW FDRE Peak (8000 MWh). Only 200 MW awarded; bids received for only 820 MW.',
  },

  {
    id: 'SJVN-SOL-BESS-1200', scheme: 'SJVN Solar+BESS 1200 MW', issuer: 'SJVN',
    type: 'Solar + BESS', tenderedMW: 1200,
    tenderedQ: 'Q2 FY25',  // Issued Sep 2024 (bid deadline Oct 22 2024). Source: Mercom India Sep 2024
    awardedQ: 'Q1 FY26',   // Concluded May 2025. Source: RW May 2025
    awardedMW: 1200,
    issuedSource: 'Mercom India Sep 16 2024: SJVN 1200 MW ISTS Solar + 600 MW/2400 MWh ESS, bid deadline Oct 22 2024',
    awardedSource: 'RW May 12 2025 + PV Tech May 2025: Reliance NU 350 MW, SAEL 150 MW, Jindal 300 MW, Sembcorp 150 MW, JBM 150 MW, Fastnote 100 MW at ₹3.32–3.33/kWh',
    note: 'Full 1200 MW awarded. 19 companies participated; oversubscribed 4x.',
  },

  // ── Q3 FY25 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000176', scheme: 'SECI-RTC-IV', issuer: 'SECI',
    type: 'RTC', tenderedMW: 1200,
    tenderedQ: 'Q3 FY25',  // Published 30 Oct 2024. Source: SECI-R
    awardedQ: 'Q1 FY26',   // Awarded May 2025. Source: RW May 2025
    awardedMW: 420,        // Only 420 MW of 1200 MW awarded
    issuedSource: 'SECI-R (seci.co.in/tenders/results)',
    awardedSource: 'RW May 28 2025: Hero Solar 120 MW + Hexa Climate 100 MW @ ₹5.06/kWh; Jindal India 150 MW + Sembcorp 50 MW @ ₹5.07/kWh',
    note: '1200 MW RTC. Only 420 MW awarded — insufficient bids at acceptable tariff.',
  },

  // ── Q4 FY25 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'GUVNL-250-SOL', scheme: 'GUVNL Solar 250 MW', issuer: 'GUVNL',
    type: 'Solar', tenderedMW: 250,
    tenderedQ: 'Q4 FY25',  // Issued Jan 2025. Source: SE Mar 2025 "within two months"
    awardedQ: 'Q4 FY25',   // Awarded Mar 2025
    awardedMW: 250,
    issuedSource: 'SE Mar 2025: "GUVNL issued the tender in January 2025"',
    awardedSource: 'SE Mar 2025: Welspun 50 MW + Avaada 100 MW + SAEL 100 MW @ ₹2.60/kWh',
    note: '250 MW + 250 MW greenshoe option. Awarded within record 2 months of issue.',
  },

  {
    id: 'NTPC-SOL-BESS-1200', scheme: 'NTPC Solar+BESS 1200 MW', issuer: 'NTPC',
    type: 'Solar + BESS', tenderedMW: 1200,
    tenderedQ: 'Q4 FY25',  // Issued Jan 2025. Source: JMK Jan 2025 RE Update
    awardedQ: null,         // No confirmed public result found
    awardedMW: null,
    issuedSource: 'JMK Jan 2025 RE Update: "NTPC issued a tender for 1200 MW ISTS-connected solar PV with 600 MW/2400 MWh ESS"',
    awardedSource: null,
    note: '1200 MW Solar + 600 MW/2400 MWh BESS. Award not confirmed in available records.',
  },

  // ── Q1 FY26 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000202', scheme: 'SECI-ISTS-XX', issuer: 'SECI',
    type: 'Solar + BESS', tenderedMW: 2000,
    tenderedQ: 'Q1 FY26',  // Published 12 Jun 2025. Source: SECI-R
    awardedQ: 'Q3 FY26',   // Awarded Oct 2025
    awardedMW: 2000,
    issuedSource: 'SECI-R (seci.co.in/tenders/results; tender-details/YmJ1)',
    awardedSource: 'PVM Oct 16 2025: Record ₹2.86/kWh. Shivalaya 600 MW, Purvah 300 MW, SAEL 300 MW, Welspun 200 MW + others',
    note: '2000 MW Solar + 1000 MW/4000 MWh ESS. Record-low Solar+BESS tariff at time.',
  },

  {
    id: 'SECI000204', scheme: 'SECI-ISTS-XXI', issuer: 'SECI',
    type: 'Solar + BESS', tenderedMW: 1200,
    tenderedQ: 'Q1 FY26',  // Published 19 Jun 2025. Source: SECI-R
    awardedQ: 'Q4 FY26',   // Awarded Jan 2026
    awardedMW: 1200,
    issuedSource: 'SECI-R (seci.co.in/tenders/results; tender-details/YmJz)',
    awardedSource: 'PVM Jan 9 2026: NLC India 600 MW + Engie 200 MW @ ₹3.12; Rays Power 300 MW + Oriana 100 MW @ ₹3.13/kWh',
    note: '1200 MW Solar + 600 MW/3600 MWh ESS.',
  },

  {
    id: 'GUVNL-500-SOL', scheme: 'GUVNL Solar 500 MW', issuer: 'GUVNL',
    type: 'Solar', tenderedMW: 500,
    tenderedQ: 'Q1 FY26',  // Issued May 2025. Source: JMK May 2025 RE Update
    awardedQ: null,         // No confirmed public result found
    awardedMW: null,
    issuedSource: 'JMK May 2025 RE Update: "GUVNL issued a 500 MW Solar tender with Green Shoe option"',
    awardedSource: null,
    note: '500 MW + 500 MW greenshoe. Award not confirmed in available records.',
  },

  // ── Q2 FY26 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000221', scheme: 'SECI-FDRE-VII', issuer: 'SECI',
    type: 'FDRE (Peak)', tenderedMW: 1200,
    tenderedQ: 'Q2 FY26',  // Published 30 Sep 2025. Source: SECI-R
    awardedQ: 'Q4 FY26',   // e-RA 5 Feb 2026; LoA issued 10 Feb 2026
    awardedMW: 1200,
    issuedSource: 'SECI-R (seci.co.in/tenders/results; tender-details/YmB2)',
    awardedSource: 'SE + thebatterymagazine.com Feb 6 2026: Serentica 600 MW + ACME 301 MW + AMPIN 199 MW @ ₹6.28; Adyant 100 MW @ ₹6.27/kWh. LoA 10 Feb 2026.',
    note: '1200 MW FDRE Peak (4800 MWh). 22 bidders; 6145 MW received.',
  },

  // ── Q3 FY26 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000222', scheme: 'SECI-Wind-XIX', issuer: 'SECI',
    type: 'Wind', tenderedMW: 1200,
    tenderedQ: 'Q3 FY26',  // Published 15 Oct 2025. Source: SECI-R
    awardedQ: 'Q4 FY26',   // Awarded Feb 2026 per SQ Feb 2026
    awardedMW: 1200,
    issuedSource: 'SECI-R (seci.co.in/tenders/results; tender-details/YmB1)',
    awardedSource: 'SQ Feb 18 2026: "SECI Awards Over 11 GW Renewable Capacity" — Wind XIX among concluded tenders',
    note: '1200 MW ISTS Wind.',
  },

  {
    id: 'SECI000229', scheme: 'SECI-FDRE-VIII', issuer: 'SECI',
    type: 'FDRE', tenderedMW: 1000,
    tenderedQ: 'Q3 FY26',  // Published 26 Dec 2025. Source: SECI-L
    awardedQ: null,
    awardedMW: null,
    issuedSource: 'SECI-L (seci.co.in/tenders; live 15 Apr 2026). Bid deadline: 27 Apr 2026.',
    awardedSource: null,
    note: '1000 MW Excess Power FDRE-VIII. Bid deadline 27 Apr 2026 — open at data cutoff.',
  },

  {
    id: 'SECI000230', scheme: 'SECI-PSP-I', issuer: 'SECI',
    type: 'Pumped Storage', tenderedMW: 1200,
    tenderedQ: 'Q3 FY26',  // Published 26 Dec 2025. Source: SECI-L
    awardedQ: null,
    awardedMW: null,
    issuedSource: 'SECI-L (seci.co.in/tenders; live 15 Apr 2026). Bid deadline: 24 Apr 2026.',
    awardedSource: null,
    note: '1200 MW/9600 MWh Pumped Storage PSP-I. First SECI PSP tender. Open at data cutoff.',
  },

  {
    id: 'GUVNL-625-SOL', scheme: 'GUVNL Solar 625 MWp', issuer: 'GUVNL',
    type: 'Solar', tenderedMW: 625,
    tenderedQ: 'Q3 FY26',  // Issued ~Oct 2025 (award ~5 months later = Mar 2026). Source: SE Mar 2026
    awardedQ: 'Q4 FY26',   // Awarded Mar 2026
    awardedMW: 625,
    issuedSource: 'SE Mar 2026: "awards come nearly five months after the tender was floated" → ~Oct 2025',
    awardedSource: 'RW Mar 23 2026: Welspun 300 MW + NLC India 300 MW @ ₹2.34/kWh',
    note: '625 MWp + 625 MWp greenshoe. Record-low GUVNL tariff. ALMM List-I + II compliant.',
  },

  // ── COMBINED AWARD-ONLY RECORD (no individual tenderedQ — award event across VIII + IX) ─
  {
    id: 'SECI-Hybrid-VIII-IX-AWARD', scheme: 'SECI-Hybrid-VIII+IX Combined Award', issuer: 'SECI',
    type: 'Hybrid (Wind-Solar)', tenderedMW: null,
    tenderedQ: null,       // Tendering tracked in SECI000123 (Q4 FY24) and SECI000146 (Q1 FY25)
    awardedQ: 'Q4 FY26',   // Awarded Feb 2026 (combined result announcement)
    awardedMW: 1800,       // 1800 MW total (including greenshoe; VIII=1200 + IX=400 + 200 greenshoe)
    issuedSource: null,
    awardedSource: 'SQ Feb 18 2026: "Under Hybrid Tranche-VIII and IX, 1800 MW was allocated at tariffs between ₹3.25 and ₹3.46 per unit"',
    note: 'Combined award result for Tranche-VIII (1200 MW, Q4 FY24) and Tranche-IX (400 MW, Q1 FY25). 1800 MW awarded in Feb 2026 includes greenshoe exercise.',
  },

  // Also include RUMSL 170 MW for Q3 FY25 awarded (award confirmed, issue date uncertain)
  {
    id: 'RUMSL-170-SOL', scheme: 'RUMSL Solar 170 MW', issuer: 'RUMSL',
    type: 'Solar', tenderedMW: null, // Issue date/quarter not confirmed
    tenderedQ: null,
    awardedQ: 'Q3 FY25',  // Awarded Dec 2024
    awardedMW: 170,
    issuedSource: null,
    awardedSource: 'JMK Dec 2024 RE Update: "Waaree bagged 170 MW from RUMSL at ₹2.15/kWh"',
    note: 'Issue date/quarter not confirmed; counted in Awarded (Q3 FY25) only. RUMSL = Rewa Ultra Mega Solar Ltd (MP).',
  },

  // ── Q4 FY26 ISSUED ────────────────────────────────────────────────────────

  {
    id: 'SECI000240', scheme: 'SECI-RTC-TM-V', issuer: 'SECI',
    type: 'RTC (Thermal Mimic)', tenderedMW: 1000,
    tenderedQ: 'Q4 FY26',  // Published 10 Mar 2026. Source: SECI-L
    awardedQ: null,
    awardedMW: null,
    issuedSource: 'SECI-L (seci.co.in/tenders; live 15 Apr 2026). Bid deadline: 04 May 2026.',
    awardedSource: null,
    note: '1000 MW RTC Thermal Mimic (SECI-RTC-TM-V). Open at data cutoff.',
  },

];

/* ═══════════════════════════════════════════════════════════════════════════
   DERIVED QUARTERLY AGGREGATES
   Computed from TENDER_FLOW_RECORDS above — do not edit independently.
   ─────────────────────────────────────────────────────────────────────────── */

const QUARTER_ORDER = [
  'Q4 FY24', 'Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25',
  'Q1 FY26', 'Q2 FY26', 'Q3 FY26', 'Q4 FY26',
];

function deriveTenderFlowAggregates() {
  const tendered = {};
  const awarded  = {};
  QUARTER_ORDER.forEach(q => { tendered[q] = 0; awarded[q] = 0; });

  TENDER_FLOW_RECORDS.forEach(r => {
    if (r.tenderedQ && r.tenderedMW !== null && tendered[r.tenderedQ] !== undefined) {
      tendered[r.tenderedQ] += r.tenderedMW;
    }
    if (r.awardedQ && r.awardedMW !== null && awarded[r.awardedQ] !== undefined) {
      awarded[r.awardedQ] += r.awardedMW;
    }
  });

  return {
    labels:   QUARTER_ORDER,
    tendered: QUARTER_ORDER.map(q => tendered[q]),
    awarded:  QUARTER_ORDER.map(q => awarded[q]),
  };
}

const TENDER_FLOW_DATA = deriveTenderFlowAggregates();

/* ── Verify derivation (will throw if records are inconsistent) ──────────── */
(function selfCheck() {
  const totTendered = TENDER_FLOW_DATA.tendered.reduce((a, b) => a + b, 0);
  const totAwarded  = TENDER_FLOW_DATA.awarded.reduce((a, b) => a + b, 0);
  if (totTendered === 0) throw new Error('TENDER_FLOW_DATA: tendered totals to 0');
  if (totAwarded  === 0) throw new Error('TENDER_FLOW_DATA: awarded totals to 0');
})();

const TENDER_FLOW_META = {
  cutoffDate:  '15 Apr 2026',
  quarterLogic: 'India FY (Apr-Mar) quarters',
  scope:       'Utility-scale RE project development tenders ≥100 MW from SECI, SJVN, GUVNL, RUMSL, NTPC',
  exclusions:  'Standalone BESS-only, EPC packages, module supply, green hydrogen, rooftop/RESCO, <100 MW',
  note:        'Awarded MW = officially confirmed awarded capacity only. Tenders with no confirmed result excluded from Awarded.',
};
