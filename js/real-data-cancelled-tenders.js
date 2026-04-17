/* ═══════════════════════════════════════════════════════════════════════════
   REAL DATA: Cancelled & Reissued Tender Tracker
   ───────────────────────────────────────────────────────────────────────────
   Used by: Tab 3 → "Cancelled & Reissued Tender Tracker" panel ONLY
   ───────────────────────────────────────────────────────────────────────────

   SOURCE POLICY (strict)
     • Only entries backed by an official lifecycle document — SECI notice,
       MNRE letter cited in SECI notice, or official issuer tender/result page.
     • Reason field is populated ONLY when explicitly stated in the official
       cancellation/reissue/corrigendum document. Otherwise: 'unspecified'.
     • Cancellation / reissue / deferral is NEVER inferred from missing updates,
       trade-press commentary, or analyst assumptions.
     • Partial awards (e.g. SECI-RTC-IV awarded 420 MW of 1200 MW) are NOT
       treated as cancellations — they remain in TENDER_ROWS with status
       'Awarded' and an mwAwarded value, per real-data-tenders.js.

   LINKAGE TO TENDER REGISTER
     • Where a tracked item has an entry in TENDER_ROWS (real-data-tenders.js),
       `relatedRegisterId` references that row so the block stays linked to
       the main register rather than being a disconnected dataset.
     • getCancelledTenderRecords() also auto-surfaces any TENDER_ROWS row whose
       status is 'Cancelled / Reissued', so register updates flow through
       without editing this file.

   STATUS VOCABULARY (matches buildCancelledTag in tab-tender.js)
     'Cancelled'       official cancellation / termination / revocation notice
     'Reissued'        original cancelled AND a successor RfS with same/similar
                       scope has been issued, confirmed in official docs
     'Revised & Open'  original RfS superseded by a corrigendum/amendment that
                       changes scope/tariff ceiling but keeps bidding open
     'Deferred'        bid submission deadline officially extended, or auction
                       postponed, per an issued corrigendum

   CUTOFF: 15 Apr 2026 (same as TENDER_META.fetchedOn).
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const CANCELLED_TENDER_META = {
  cutoffDate:    '15 Apr 2026',
  seciNoticesUrl:'https://www.seci.co.in/tenders',
  scope:         'Officially documented cancellation / reissue / revision / deferral events from SECI and other tracked issuers in the tender register.',
  reasonPolicy:  'Reason populated only when explicitly stated in the official lifecycle document; otherwise shown as "unspecified".',
  linkagePolicy: 'Auto-surfaces any TENDER_ROWS row whose status is "Cancelled / Reissued" in addition to the curated entries below.',
};

/* ═══════════════════════════════════════════════════════════════════════════
   CURATED TRACKER ENTRIES
   Each entry is backed by an official SECI notice page, SECI-uploaded tender
   document, or MNRE letter referenced in a SECI notice.
   ═══════════════════════════════════════════════════════════════════════════ */
const CANCELLED_TENDER_RECORDS = [

  {
    id:                'SECI000117',
    ref:               'SECI/C&P/IPP/12/0001/23-24',
    scheme:            'SECI-Wind-XV',
    issuer:            'SECI',
    mw:                1300,
    status:            'Cancelled',
    noticeDate:        'Feb 2024',
    reason:            'Cancelled in line with MNRE letter dated 16.02.2024 (rationale not stated in SECI notice)',
    reasonExplicit:    true,
    sourceUrl:         'https://www.seci.co.in/whats-new-detail/2622',
    sourceLabel:       'SECI "What\'s New" — Cancellation of RfS for 1300 MW Wind-XV',
    originalRfsUrl:    'https://www.seci.co.in/Upload/Tender/SECI000117-5150916-RfSfor1300MWWindTranche-XV-finalupload.pdf',
    originalRfsDate:   '12 Aug 2023',
    relatedRegisterId: null,
  },

  {
    id:                'SECI000188',
    ref:               'SECI000188 — 500 MW ISTS Offshore Wind (Gulf of Khambhat, Gujarat)',
    scheme:            'SECI-Offshore-Wind-Gujarat',
    issuer:            'SECI',
    mw:                500,
    status:            'Cancelled',
    noticeDate:        'Aug 2025',
    reason:            'unspecified',
    reasonExplicit:    false,
    sourceUrl:         'https://www.seci.co.in/Upload/Tender/SECI000188-1526005-RfSfor500MWOffshoreWind-Gujarat-finalupload.pdf',
    sourceLabel:       'SECI tender document (file marked "revok" by SECI)',
    originalRfsDate:   '13 Sep 2024',
    relatedRegisterId: null,
  },

  {
    id:                'SECI-OffshoreTN-4000',
    ref:               'RfS for Allocation of Sea-bed Lease Rights for 4000 MW Offshore Wind (Tamil Nadu sub-blocks 2, 3, 4, 7)',
    scheme:            'SECI-Offshore-Wind-TN-Seabed',
    issuer:            'SECI',
    mw:                4000,
    status:            'Cancelled',
    noticeDate:        'Aug 2025',
    reason:            'unspecified',
    reasonExplicit:    false,
    sourceUrl:         'https://www.seci.co.in/whats-new-detail/2606',
    sourceLabel:       'SECI "What\'s New" — Original RfS for 4000 MW Offshore Wind Seabed Lease (TN)',
    originalRfsDate:   'Feb 2024',
    relatedRegisterId: null,
  },

  {
    id:                'SECI-PangLeh-0.5',
    ref:               'SECI/C&P/IPP/11/0003/25-26',
    scheme:            'SECI Pang Leh Ground-Mounted Solar Pilot',
    issuer:            'SECI',
    mw:                0.5,   // 500 kW pilot — included despite sub-MW scale because it is the only explicit termination in FY26
    status:            'Cancelled',
    noticeDate:        '2025',
    reason:            'unspecified',
    reasonExplicit:    false,
    sourceUrl:         'https://www.seci.co.in/press-release',
    sourceLabel:       'SECI press release — "RfS ... stands terminated"',
    originalRfsDate:   '30 May 2025',
    relatedRegisterId: null,
    note:              '500 kW pilot project. Officially terminated by SECI; reason not published in notice.',
  },

];

/* ═══════════════════════════════════════════════════════════════════════════
   LINKED DERIVATION — auto-pick any TENDER_ROWS row marked cancelled.
   Keeps this tracker linked to the main tender register so that adding a row
   with status 'Cancelled / Reissued' in real-data-tenders.js flows through
   without needing to edit this file.
   ═══════════════════════════════════════════════════════════════════════════ */
function getCancelledTenderRecords() {
  const curated = CANCELLED_TENDER_RECORDS.slice();

  if (typeof TENDER_ROWS !== 'undefined' && typeof TENDER_STATUS !== 'undefined') {
    const alreadyTracked = new Set(curated.map(r => r.id));
    TENDER_ROWS.forEach(row => {
      if (row.status !== TENDER_STATUS.CANCELLED) return;
      if (alreadyTracked.has(row.id)) {
        const idx = curated.findIndex(r => r.id === row.id);
        if (idx >= 0 && !curated[idx].relatedRegisterId) {
          curated[idx].relatedRegisterId = row.id;
        }
        return;
      }
      curated.push({
        id:                row.id,
        ref:               row.ref,
        scheme:            row.scheme,
        issuer:            row.issuer,
        mw:                row.mw,
        status:            'Cancelled',
        noticeDate:        row.awardedOn || row.publishedOn || '',
        reason:            row.sourceNote || 'unspecified',
        reasonExplicit:    Boolean(row.sourceNote),
        sourceUrl:         row.sourceUrl,
        sourceLabel:       'Tender register entry (real-data-tenders.js)',
        originalRfsDate:   row.publishedOn || null,
        relatedRegisterId: row.id,
      });
    });
  }

  return curated;
}

const CANCELLED_TENDER_DATA = getCancelledTenderRecords();
