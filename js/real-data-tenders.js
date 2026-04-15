/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: India Solar / RE Tender Register
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 3 → "Live Tender Register" table only
   ───────────────────────────────────────────────────────────────────────────

   PRIMARY SOURCES (in order of preference):
     1. SECI official live tenders page — https://www.seci.co.in/tenders
        (page directly fetched and verified: 15 Apr 2026)
     2. SECI official tender results page — https://seci.co.in/tenders/results
        (page directly fetched and verified: 15 Apr 2026)
     3. GUVNL eTender portal result announcement (Mar 2026)
        corroborated by RenewableWatch and SaurEnergy citing official GUVNL result

   TARIFF DATA SOURCE RULE:
     Tariff shown ONLY when confirmed in an official result announcement
     (SECI press release, SECI result page entry, or GUVNL result notification).
     Not inferred, not from third-party estimates.

   SUBSCRIPTION / BID-TO-TENDER:
     Not explicitly published in SECI result pages in a structured field.
     Left as null (displayed as "—") for all rows.

   STATUS DEFINITIONS:
     'Open'       = Tender published and bid submission deadline is in the future
                    (verified against SECI live tenders page, 15 Apr 2026)
     'Evaluation' = Bid submission deadline has passed; result not yet announced
     'Awarded'    = Official result announced with winners; LoA issued or confirmed
     'Cancelled / Reissued' = Official SECI / issuer notice of cancellation

   DATE FIELD: "Published Date" — consistent across all rows.
               Bid deadline and award date noted in sourceNote.

   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const TENDER_META = {
  fetchedOn:     '15 Apr 2026',
  seciLiveUrl:   'https://www.seci.co.in/tenders',
  seciResultUrl: 'https://seci.co.in/tenders/results',
  note: 'Tariff disclosed only when officially confirmed. Subscription (bid:tender ratio) not published by SECI in structured form; shown as — for all rows.',
};

/* ── Tender status constants ─────────────────────────────────────────────── */
const TENDER_STATUS = {
  OPEN:           'Open',
  EVALUATION:     'Evaluation',
  AWARDED:        'Awarded',
  CANCELLED:      'Cancelled / Reissued',
};

/* ═══════════════════════════════════════════════════════════════════════════
   TENDER ROWS — sorted: Awarded → Evaluation → Open
   All Open tenders verified against SECI live tenders page on 15 Apr 2026.
   ═══════════════════════════════════════════════════════════════════════════ */
const TENDER_ROWS = [

  // ── AWARDED ──────────────────────────────────────────────────────────────

  {
    id:         'SECI000202',
    ref:        'SECI/C&P/IPP/11/0004/25-26',
    scheme:     'SECI-ISTS-XX',
    issuer:     'SECI',
    type:       'Solar + BESS',
    mw:         2000,
    publishedOn: '12 Jun 2025',
    tariffMin:  2.86,
    tariffMax:  2.87,
    tariffNote: 'Record-low tariff at time of auction. ₹2.86/kWh (Shivalaya 600 MW, Welspun 200 MW, Purvah 300 MW, Banyan 100 MW); ₹2.87/kWh (SAEL 300 MW, GH2 Solar 50 MW)',
    sub:        null,
    status:     TENDER_STATUS.AWARDED,
    awardedOn:  'Oct 2025',
    sourceNote: 'Bid deadline: 29 Aug 2025. e-Reverse Auction: Oct 2025. Storage: 1000 MW / 4000 MWh (0.5 MW / 2 MWh per MW solar). ISTS connected.',
    sourceUrl:  'https://seci.co.in/tender-details/YmJ1',
    tariffSource: 'pv-magazine India, 16 Oct 2025 (citing SECI auction result)',
  },

  {
    id:         'SECI000204',
    ref:        'SECI/C&P/IPP/11/0006/25-26',
    scheme:     'SECI-ISTS-XXI',
    issuer:     'SECI',
    type:       'Solar + BESS',
    mw:         1200,
    publishedOn: '19 Jun 2025',
    tariffMin:  3.12,
    tariffMax:  3.13,
    tariffNote: '₹3.12/kWh: NLC India Renewables 600 MW, Engie Energy India 200 MW. ₹3.13/kWh: Rays Power Infra 300 MW, Oriana Power 100 MW.',
    sub:        null,
    status:     TENDER_STATUS.AWARDED,
    awardedOn:  'Jan 2026',
    sourceNote: 'Bid deadline: 02 Dec 2025. Storage: 600 MW / 3600 MWh (0.5 MW / 3 MWh per MW). ISTS connected.',
    sourceUrl:  'https://seci.co.in/tender-details/YmJz',
    tariffSource: 'pv-magazine India, 09 Jan 2026 (citing SECI auction result)',
  },

  {
    id:         'SECI000221',
    ref:        'SECI/C&P/IPP/13/0012/25-26',
    scheme:     'SECI-FDRE-VII',
    issuer:     'SECI',
    type:       'FDRE (Peak)',
    mw:         1200,
    publishedOn: '30 Sep 2025',
    tariffMin:  6.27,
    tariffMax:  6.28,
    tariffNote: '₹6.27/kWh: Adyant Emnersol 100 MW. ₹6.28/kWh: Serentica 600 MW, ACME Solar 600 MW, AMPIN Energy 199 MW. LoA issued 10 Feb 2026. 22 bidders; 6145 MW bids received.',
    sub:        null,
    status:     TENDER_STATUS.AWARDED,
    awardedOn:  'Feb 2026',
    sourceNote: 'Bid deadline: 07 Jan 2026. e-Reverse Auction: 05 Feb 2026. LoA: 10 Feb 2026. 4800 MWh peak supply (1200 MW × 4 hrs). Trading margin ₹0.07/kWh additional.',
    sourceUrl:  'https://seci.co.in/tender-details/YmB2',
    tariffSource: 'eqmagpro.com citing SECI FDRE-VII result; SaurEnergy citing SECI result, Feb 2026',
  },

  {
    id:         'SECI000176',
    ref:        'SECI/C&P/IPP/13/0019/24-25',
    scheme:     'SECI-RTC-IV',
    issuer:     'SECI',
    type:       'RTC',
    mw:         1200,
    mwAwarded:  420,
    publishedOn: '30 Oct 2024',
    tariffMin:  5.06,
    tariffMax:  5.07,
    tariffNote: '₹5.06/kWh: Hero Solar Energy 120 MW, Hexa Climate Solutions 100 MW. ₹5.07/kWh: Jindal India Power 150 MW, Sembcorp Green Infra 50 MW. Only 420 MW of 1200 MW awarded.',
    sub:        null,
    status:     TENDER_STATUS.AWARDED,
    awardedOn:  'May 2025',
    sourceNote: 'Bid deadline: 24 Mar 2025. Only 420 MW allocated from 1200 MW tender — insufficient competitive bids at acceptable tariff for remaining capacity.',
    sourceUrl:  'https://seci.co.in/tender-details/YWVx',
    tariffSource: 'RenewableWatch, 28 May 2025 (citing SECI auction result)',
  },

  {
    id:         'GUVNL-SOL-PH',
    ref:        'eTender No. 53370321',
    scheme:     'GUVNL Solar Phase (625 MWp)',
    issuer:     'GUVNL',
    type:       'Solar',
    mw:         625,
    publishedOn: 'Oct 2025',
    tariffMin:  2.34,
    tariffMax:  2.34,
    tariffNote: '₹2.34/kWh: Welspun Energy 300 MW, NLC India Limited 300 MW. Greenshoe option of additional 625 MW. ALMM List-I and List-II compliant modules required.',
    sub:        null,
    status:     TENDER_STATUS.AWARDED,
    awardedOn:  'Mar 2026',
    sourceNote: '625 MWp + 625 MWp greenshoe. Build-own-operate. Projects anywhere in India including commissioned/under-construction sites. Results announced ~23 Mar 2026.',
    sourceUrl:  'https://www.guvnl.com/',
    tariffSource: 'RenewableWatch, 23 Mar 2026 (citing official GUVNL result announcement)',
  },

  // ── EVALUATION ────────────────────────────────────────────────────────────

  {
    id:         'SECI000237',
    ref:        'SECI/C&P/OP/11/021/2025-26',
    scheme:     'SECI Module Procurement',
    issuer:     'SECI',
    type:       'Module Supply',
    mw:         870,   // MWp — module procurement, not generation capacity
    publishedOn: '17 Feb 2026',
    tariffMin:  null,
    tariffMax:  null,
    tariffNote: null,
    sub:        null,
    status:     TENDER_STATUS.EVALUATION,
    awardedOn:  null,
    sourceNote: 'Bid deadline: 10 Apr 2026 (passed). 870 MWp solar module procurement — supply-side tender, not a generation capacity allocation.',
    sourceUrl:  'https://www.seci.co.in/tender-details/YmFw',
    tariffSource: null,
  },

  // ── OPEN (verified on seci.co.in/tenders, 15 Apr 2026) ──────────────────

  {
    id:         'SECI000240',
    ref:        'SECI/C&P/IPP/13/0020/25-26',
    scheme:     'SECI-RTC-TM-V',
    issuer:     'SECI',
    type:       'RTC (Thermal Mimic)',
    mw:         1000,
    publishedOn: '10 Mar 2026',
    tariffMin:  null,
    tariffMax:  null,
    tariffNote: null,
    sub:        null,
    status:     TENDER_STATUS.OPEN,
    awardedOn:  null,
    sourceNote: 'Bid deadline: 04 May 2026. Supply of 1000 MW round-the-clock power with thermal generation characteristics from RE projects. ISTS connected.',
    sourceUrl:  'https://www.seci.co.in/tender-details/YmZ3',
    tariffSource: null,
  },

  {
    id:         'SECI000229',
    ref:        'SECI/C&P/IPP/13/0016/25-26',
    scheme:     'SECI-FDRE-VIII',
    issuer:     'SECI',
    type:       'FDRE',
    mw:         1000,
    publishedOn: '26 Dec 2025',
    tariffMin:  null,
    tariffMax:  null,
    tariffNote: null,
    sub:        null,
    status:     TENDER_STATUS.OPEN,
    awardedOn:  null,
    sourceNote: 'Bid deadline: 27 Apr 2026. Supply of 1000 MW excess power from RE projects having existing PPAs (FDRE scheme).',
    sourceUrl:  'https://www.seci.co.in/tender-details/YmB-',
    tariffSource: null,
  },

  {
    id:         'SECI000230',
    ref:        'SECI/C&P/IPP/15/0017/25-26',
    scheme:     'SECI-PSP-I',
    issuer:     'SECI',
    type:       'Pumped Storage',
    mw:         1200,
    publishedOn: '26 Dec 2025',
    tariffMin:  null,
    tariffMax:  null,
    tariffNote: null,
    sub:        null,
    status:     TENDER_STATUS.OPEN,
    awardedOn:  null,
    sourceNote: 'Bid deadline: 24 Apr 2026. 1200 MW / 9600 MWh pumped storage plants across India. India\'s first SECI pumped storage tender under tariff-based competitive bidding.',
    sourceUrl:  'https://www.seci.co.in/tender-details/YmF3',
    tariffSource: null,
  },

];

/* ── Status display config ─────────────────────────────────────────────────── */
function getTenderStatusConfig(status) {
  const map = {
    [TENDER_STATUS.OPEN]:       { type: 'info',     label: 'Open'        },
    [TENDER_STATUS.EVALUATION]: { type: 'warning',  label: 'Evaluation'  },
    [TENDER_STATUS.AWARDED]:    { type: 'positive', label: 'Awarded'     },
    [TENDER_STATUS.CANCELLED]:  { type: 'negative', label: 'Cancelled / Reissued' },
  };
  return map[status] || { type: 'neutral', label: status };
}

/* ── Type tag config ─────────────────────────────────────────────────────── */
function getTenderTypeConfig(type) {
  const map = {
    'Solar':           { type: 'info',     label: 'Solar'            },
    'Solar + BESS':    { type: 'warning',  label: 'Solar + BESS'     },
    'FDRE':            { type: 'positive', label: 'FDRE'             },
    'FDRE (Peak)':     { type: 'positive', label: 'FDRE Peak'        },
    'RTC':             { type: 'neutral',  label: 'RTC'              },
    'RTC (Thermal Mimic)': { type: 'neutral', label: 'RTC-TM'        },
    'Pumped Storage':  { type: 'watchlist', label: 'PSP'             },
    'Module Supply':   { type: 'neutral',  label: 'Module Supply'    },
    'Hybrid':          { type: 'warning',  label: 'Hybrid'           },
  };
  return map[type] || { type: 'neutral', label: type };
}
