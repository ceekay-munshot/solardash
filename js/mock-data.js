/* ═══════════════════════════════════════════════════════════════════════════
   MOCK DATA — All placeholder data for SolarIQ Dashboard
   Replace each block with live API responses when ready
   ═══════════════════════════════════════════════════════════════════════════ */

const MOCK = {

  /* ── TAB 1: DEMAND ──────────────────────────────────────────────── */
  demand: {
    kpis: {
      totalSolar:   { value: '82.6', unit: 'GW',  delta: '+14.2%', dir: 'up', context: 'vs FY23–24 end' },
      solarShare:   { value: '18.3', unit: '%',   delta: '+3.1pp', dir: 'up', context: 'of total installed' },
      peakDemand:   { value: '247', unit: 'GW',   delta: '+6.4%', dir: 'up', context: 'peak this FY' },
      demandGrowth: { value: '8.2', unit: '%',    delta: '+1.4pp', dir: 'up', context: 'YoY energy growth' },
    },
    monthlyDemand: {
      labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
      series: {
        'FY23-24': [165,172,181,169,174,178,185,179,168,163,159,171],
        'FY24-25': [178,189,198,184,191,195,203,197,185,179,174,188],
      }
    },
    solarGeneration: {
      labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
      series: {
        'FY23-24': [9.8,10.2,8.4,7.6,7.1,7.8,10.8,11.4,12.1,11.8,11.2,10.4],
        'FY24-25': [11.4,12.1,9.9,9.2,8.6,9.3,12.7,13.5,14.2,13.8,13.1,12.2],
      }
    },
    stateCapacity: [
      { state: 'Rajasthan',      gw: 21.4, rank: 1, pct: 100 },
      { state: 'Gujarat',        gw: 14.2, rank: 2, pct: 66  },
      { state: 'Tamil Nadu',     gw: 9.1,  rank: 3, pct: 43  },
      { state: 'Karnataka',      gw: 8.4,  rank: 4, pct: 39  },
      { state: 'Andhra Pradesh', gw: 7.6,  rank: 5, pct: 36  },
      { state: 'Madhya Pradesh', gw: 5.8,  rank: 6, pct: 27  },
      { state: 'Maharashtra',    gw: 4.9,  rank: 7, pct: 23  },
      { state: 'Telangana',      gw: 4.1,  rank: 8, pct: 19  },
      { state: 'Uttar Pradesh',  gw: 2.9,  rank: 9, pct: 14  },
      { state: 'Punjab',         gw: 1.2,  rank:10, pct: 6   },
    ],
    seasonality: [
      { month:'Oct', label:'Peak Solar', val:'+28%', trend:'up' },
      { month:'Nov', label:'Post-Monsoon Surge', val:'+22%', trend:'up' },
      { month:'Dec', label:'Winter Plateau', val:'+18%', trend:'flat' },
      { month:'Jan', label:'Winter Demand High', val:'+16%', trend:'flat' },
      { month:'Feb', label:'Transition', val:'+12%', trend:'up' },
      { month:'Mar', label:'Pre-summer Rise', val:'+19%', trend:'up' },
    ]
  },

  /* ── TAB 2: MANUFACTURING ───────────────────────────────────────── */
  manufacturing: {
    kpis: {
      almmModule: { value: '62.4', unit: 'GW',  delta: '+18%',   dir: 'up', context: 'ALMM-listed module capacity' },
      almmCell:   { value: '24.8', unit: 'GW',  delta: '+42%',   dir: 'up', context: 'ALMM-listed cell capacity' },
      pliCapacity:{ value: '39.6', unit: 'GW',  delta: '+11.2 GW', dir: 'up', context: 'PLI-backed capacity' },
      importDep:  { value: '38',   unit: '%',   delta: '-14pp',   dir: 'down', context: 'cell/module import share', negativeGood: true },
    },
    manufacturers: [
      { rank:1, name:'Waaree Energies',   module:12.0, cell:6.0, wafer:0,   ingot:0,   pli:true,  backward:'Module + Cell', listed:true  },
      { rank:2, name:'Adani Solar',        module:10.0, cell:4.0, wafer:0,   ingot:0,   pli:true,  backward:'Module + Cell', listed:true  },
      { rank:3, name:'First Solar India',  module:3.4,  cell:3.4, wafer:3.4, ingot:0,   pli:false, backward:'Full (Thin Film)',listed:false },
      { rank:4, name:'Premier Energies',   module:4.0,  cell:2.0, wafer:0,   ingot:0,   pli:true,  backward:'Module + Cell', listed:true  },
      { rank:5, name:'Vikram Solar',       module:3.5,  cell:1.5, wafer:0,   ingot:0,   pli:false, backward:'Module + Cell', listed:false },
      { rank:6, name:'Tata Solar',         module:4.2,  cell:1.0, wafer:0,   ingot:0,   pli:true,  backward:'Module',        listed:false },
      { rank:7, name:'Goldi Solar',        module:2.5,  cell:0.5, wafer:0,   ingot:0,   pli:false, backward:'Module',        listed:false },
      { rank:8, name:'REC India (Reliance)',module:6.0, cell:6.0, wafer:6.0, ingot:6.0, pli:true,  backward:'Full (Planned)', listed:false },
    ],
    importTrend: {
      labels: ['H1 FY22','H2 FY22','H1 FY23','H2 FY23','H1 FY24','H2 FY24','H1 FY25'],
      imports:  [4.2, 5.1, 6.8, 5.2, 4.1, 3.6, 3.1],
      domestic: [1.8, 2.2, 2.6, 3.9, 5.2, 6.8, 8.4],
    },
    capacityMix: {
      module: 62.4,
      cell:   24.8,
      wafer:   9.2,
      ingot:   6.0,
    },
    expansions: [
      { company:'Waaree', type:'Cell', capacity:'2 GW', target:'Q1 FY26', status:'on-track'  },
      { company:'Adani',  type:'Wafer',capacity:'2 GW', target:'Q2 FY26', status:'delayed'   },
      { company:'Reliance',type:'Full Stack',capacity:'10 GW', target:'FY27', status:'planned'   },
      { company:'Premier',type:'Cell', capacity:'1 GW', target:'Q3 FY25', status:'on-track'  },
      { company:'Tata',   type:'Cell', capacity:'2 GW', target:'Q4 FY25', status:'on-track'  },
      { company:'Shirdi Sai',type:'Module',capacity:'1.5 GW',target:'Q1 FY26',status:'planned'},
    ]
  },

  /* ── TAB 3: TENDER ──────────────────────────────────────────────── */
  tender: {
    kpis: {
      mwTendered: { value: '28,400', unit: 'MW', delta: '+34%',  dir: 'up', context: 'FY24-25 YTD' },
      mwAwarded:  { value: '22,800', unit: 'MW', delta: '+28%',  dir: 'up', context: 'FY24-25 YTD' },
      avgTariff:  { value: '2.61',   unit: '₹/kWh', delta: '-3.2%', dir: 'down', context: 'discovered avg tariff', negativeGood: true },
      subscription:{ value: '1.82', unit: 'x',   delta: '+0.3x',  dir: 'up', context: 'bid-to-tender ratio' },
    },
    tendersOverTime: {
      labels: ['Q1FY23','Q2FY23','Q3FY23','Q4FY23','Q1FY24','Q2FY24','Q3FY24','Q4FY24','Q1FY25','Q2FY25','Q3FY25'],
      tendered: [5200,4800,6100,7200,5900,7400,8200,9100,8800,10200,9400],
      awarded:  [3800,3600,5100,6000,4800,6200,6800,7600,7200,8400,7200],
    },
    tenderTypeMix: {
      labels: ['Solar (Utility)','Hybrid (W+S)','FDRE','BESS+Solar','RTC','Others'],
      values: [44, 22, 14, 10, 7, 3],
    },
    issuerComparison: {
      labels: ['SECI','NTPC','State DISCOMs','RUMSL','GUVNL','TANTRANSCO','KREDL'],
      mw:     [14200,8400,6800,4200,3800,2400,1800],
    },
    tariffTrend: {
      labels: ['Q1FY22','Q2FY22','Q3FY22','Q4FY22','Q1FY23','Q2FY23','Q3FY23','Q4FY23','Q1FY24','Q2FY24','Q3FY24','Q4FY24','Q1FY25','Q2FY25','Q3FY25'],
      tariff: [2.14,2.18,2.11,2.09,2.22,2.35,2.42,2.48,2.55,2.64,2.71,2.68,2.63,2.61,2.58],
    },
    tenderTable: [
      { id:'SECI-146', issuer:'SECI', type:'Solar',mw:4000,date:'Jan 25',tariff:2.58,status:'Open',sub:2.1  },
      { id:'NTPC-RE12', issuer:'NTPC',type:'Hybrid',mw:1500,date:'Dec 24',tariff:3.84,status:'Awarded',sub:1.9},
      { id:'GUVNL-32', issuer:'GUVNL',type:'Solar',mw:2000,date:'Feb 25',tariff:2.55,status:'Awarded',sub:2.4},
      { id:'SECI-145', issuer:'SECI', type:'FDRE',mw:1200,date:'Nov 24',tariff:3.12,status:'Open',sub:1.4  },
      { id:'RUMSL-18', issuer:'RUMSL',type:'Solar',mw:2500,date:'Mar 25',tariff:null, status:'Upcoming',sub:null},
      { id:'TANTRANS-7',issuer:'TANTRANSCO',type:'Solar',mw:1000,date:'Jan 25',tariff:2.63,status:'Evaluation',sub:2.2},
      { id:'MSEDCL-21', issuer:'MSEDCL',type:'BESS+S',mw:800, date:'Feb 25',tariff:null, status:'Open',sub:1.1  },
    ]
  },

  /* ── TAB 4: EXECUTION ───────────────────────────────────────────── */
  execution: {
    kpis: {
      commissioned:  { value: '14,200', unit: 'MW', delta: '+38%',  dir: 'up', context: 'FY24-25 YTD new adds' },
      underConstruction:{ value:'31,800', unit:'MW', delta:'+12%',   dir: 'up', context: 'active pipeline' },
      delayed:       { value: '8,400',  unit: 'MW', delta: '-5%',    dir: 'down', context: 'delayed vs COD plan', negativeGood: true },
      avgLag:        { value: '14.2',   unit: 'mo', delta: '-1.8mo', dir: 'down', context: 'award-to-COD avg', negativeGood: true },
    },
    commissioningTrend: {
      labels: ['Q1FY23','Q2FY23','Q3FY23','Q4FY23','Q1FY24','Q2FY24','Q3FY24','Q4FY24','Q1FY25','Q2FY25','Q3FY25'],
      commissioned: [2100,1800,2800,3600,2900,3200,4100,5200,4800,5600,3800],
      pipeline:     [18000,19200,20100,22400,24600,26800,28400,30200,31800,33400,31800],
    },
    stateCommission: [
      { state:'Rajasthan', mw:3800, color:'#f59e0b' },
      { state:'Gujarat',   mw:2600, color:'#3b82f6' },
      { state:'Karnataka', mw:1900, color:'#22c55e' },
      { state:'TN',        mw:1800, color:'#a855f7' },
      { state:'AP',        mw:1600, color:'#f97316' },
      { state:'MP',        mw:1200, color:'#14b8a6' },
      { state:'Others',    mw:1300, color:'#6366f1' },
    ],
    developerExec: [
      { rank:1, dev:'Adani Green',   total:4200, commissioned:3800, onTime:88, avgLag:11.2 },
      { rank:2, dev:'NTPC Renewable',total:2800, commissioned:2600, onTime:85, avgLag:12.8 },
      { rank:3, dev:'ReNew Power',   total:2400, commissioned:2100, onTime:82, avgLag:14.1 },
      { rank:4, dev:'Greenko',       total:2100, commissioned:1900, onTime:80, avgLag:13.4 },
      { rank:5, dev:'JSW Energy',    total:1200, commissioned:1050, onTime:77, avgLag:15.8 },
      { rank:6, dev:'Torrent',       total:900,  commissioned:760,  onTime:74, avgLag:16.2 },
      { rank:7, dev:'Acme Solar',    total:1400, commissioned:1100, onTime:71, avgLag:17.4 },
    ],
    delayReasons: [
      { reason:'Land acquisition', mw:2800, pct:33, type:'delay-land'    },
      { reason:'Grid connectivity', mw:2200, pct:26, type:'delay-grid'    },
      { reason:'Financial closure', mw:1400, pct:17, type:'delay-finance' },
      { reason:'Regulatory approval',mw:1100, pct:13, type:'delay-approval'},
      { reason:'Module supply',     mw:900,  pct:11, type:'delay-supply'  },
    ],
    upcomingCOD: [
      { date:'Apr 2025', project:'SECI 2 GW Rajasthan Ph-1', dev:'Adani Green',   mw:500  },
      { date:'May 2025', project:'NTPC Khavda Solar Pkg 3',  dev:'NTPC Renewable',mw:800  },
      { date:'Jun 2025', project:'Greenko Andhra Wind-Solar', dev:'Greenko',       mw:600  },
      { date:'Jul 2025', project:'ReNew GUVNL 2 GW Ph-2',   dev:'ReNew Power',   mw:700  },
      { date:'Aug 2025', project:'JSW Ind. Solar Portfolio', dev:'JSW Energy',    mw:300  },
      { date:'Sep 2025', project:'Torrent Rajasthan Block',  dev:'Torrent',       mw:400  },
    ],
    projectTable: [
      { project:'Adani Khavda Ph-1',   state:'Gujarat',   mw:2000,status:'Under Construction',dev:'Adani Green',   awardDate:'Mar 23',planCOD:'Jun 25',lag:27,issue:'None'  },
      { project:'ReNew SECI Raj 2GW',  state:'Rajasthan', mw:2000,status:'Partial COD',        dev:'ReNew Power',   awardDate:'Jan 23',planCOD:'Jan 25',lag:24,issue:'Grid delay'},
      { project:'NTPC Khavda Pkg 2',   state:'Gujarat',   mw:600, status:'Commissioned',       dev:'NTPC',          awardDate:'Apr 23',planCOD:'Dec 24',lag:20,issue:'None'  },
      { project:'Greenko AP RTC',      state:'Andhra Pr.',mw:900, status:'Under Construction',  dev:'Greenko',       awardDate:'Jun 23',planCOD:'Aug 25',lag:26,issue:'Land'  },
      { project:'JSW Green Raj Block', state:'Rajasthan', mw:500, status:'Delayed',             dev:'JSW Energy',    awardDate:'Aug 22',planCOD:'Aug 24',lag:36,issue:'Finance'},
      { project:'Acme SECI Hybrid',    state:'Rajasthan', mw:400, status:'Under Construction',  dev:'Acme Solar',    awardDate:'Sep 23',planCOD:'Sep 25',lag:24,issue:'None'  },
    ]
  },

  /* ── TAB 5: IPP ─────────────────────────────────────────────────── */
  ipp: {
    companies: ['Adani Green', 'ReNew Power', 'Greenko', 'NTPC Renewable', 'JSW Energy', 'Torrent Power', 'Acme Solar'],
    kpis: {
      'Adani Green':    { opCapacity:'11,184', ucCapacity:'8,800', ppa:'22,000', capex:'₹1,24,000 Cr' },
      'ReNew Power':    { opCapacity:'7,400',  ucCapacity:'5,200', ppa:'14,600', capex:'₹68,000 Cr'   },
      'Greenko':        { opCapacity:'8,200',  ucCapacity:'4,400', ppa:'12,800', capex:'₹72,000 Cr'   },
      'NTPC Renewable': { opCapacity:'4,600',  ucCapacity:'6,800', ppa:'18,000', capex:'₹52,000 Cr'   },
      'JSW Energy':     { opCapacity:'2,800',  ucCapacity:'3,200', ppa:'7,400',  capex:'₹28,000 Cr'   },
      'Torrent Power':  { opCapacity:'1,800',  ucCapacity:'1,200', ppa:'4,800',  capex:'₹14,000 Cr'   },
      'Acme Solar':     { opCapacity:'3,400',  ucCapacity:'2,200', ppa:'6,200',  capex:'₹22,000 Cr'   },
    },
    portfolioMix: {
      'Adani Green': { Solar:68, Wind:14, Hybrid:10, FDRE:8 },
      'ReNew Power': { Solar:55, Wind:28, Hybrid:10, FDRE:7 },
      'Greenko':     { Solar:42, Wind:20, Hybrid:22, FDRE:16},
      'NTPC Renewable':{ Solar:72, Wind:16, Hybrid:8, FDRE:4 },
      'JSW Energy':  { Solar:60, Wind:18, Hybrid:14, FDRE:8 },
      'Torrent Power':{ Solar:80, Wind:10, Hybrid:5, FDRE:5 },
      'Acme Solar':  { Solar:76, Wind:8,  Hybrid:10, FDRE:6 },
    },
    financials: {
      'Adani Green':    { netDebt:'₹84,000 Cr', leverage:'7.2x', debtEquity:'4.1x', yield:'₹38/unit', revCGR:'28%' },
      'ReNew Power':    { netDebt:'₹44,000 Cr', leverage:'6.8x', debtEquity:'3.6x', yield:'₹36/unit', revCGR:'22%' },
      'Greenko':        { netDebt:'₹48,000 Cr', leverage:'7.4x', debtEquity:'4.0x', yield:'₹37/unit', revCGR:'24%' },
      'NTPC Renewable': { netDebt:'₹28,000 Cr', leverage:'4.2x', debtEquity:'2.1x', yield:'₹34/unit', revCGR:'38%' },
      'JSW Energy':     { netDebt:'₹18,000 Cr', leverage:'3.8x', debtEquity:'1.9x', yield:'₹39/unit', revCGR:'31%' },
      'Torrent Power':  { netDebt:'₹8,400 Cr',  leverage:'2.4x', debtEquity:'1.1x', yield:'₹42/unit', revCGR:'18%' },
      'Acme Solar':     { netDebt:'₹12,000 Cr', leverage:'4.8x', debtEquity:'2.6x', yield:'₹36/unit', revCGR:'26%' },
    },
    companyColors: {
      'Adani Green':    '#f59e0b',
      'ReNew Power':    '#3b82f6',
      'Greenko':        '#22c55e',
      'NTPC Renewable': '#a855f7',
      'JSW Energy':     '#f97316',
      'Torrent Power':  '#14b8a6',
      'Acme Solar':     '#6366f1',
    },
    announcements: {
      'Adani Green': [
        { date:'Apr 2025', title:'Khavda Phase 2 Financial Close', detail:'₹18,400 Cr debt tied up for 2 GW Khavda block' },
        { date:'Mar 2025', title:'SECI 1.5 GW Contract Won',       detail:'Tariff: ₹2.57/kWh, hybrid with storage' },
        { date:'Feb 2025', title:'Green Hydrogen MoU with ONGC',   detail:'2 GW electrolyzer capacity planned by FY27' },
      ],
      'ReNew Power': [
        { date:'Apr 2025', title:'IPO Relisting Update',     detail:'NSE direct listing being explored post US delisting' },
        { date:'Mar 2025', title:'FDRE 400 MW COD Achieved', detail:'ReNew first RTC project commissioned in AP' },
        { date:'Feb 2025', title:'PPA Signed with GAIL',     detail:'200 MW solar for green ammonia complex' },
      ],
    },
    codTimeline: {
      'Adani Green':    [{date:'Jun 25',project:'Khavda Ph-1',mw:500},{date:'Sep 25',project:'SECI Raj Block-3',mw:600},{date:'Dec 25',project:'Khavda Ph-2',mw:800}],
      'ReNew Power':    [{date:'May 25',project:'AP FDRE Ph-2',mw:400},{date:'Aug 25',project:'GUVNL 2GW Ph-3',mw:600},{date:'Nov 25',project:'SECI Hybrid',mw:450}],
      'Greenko':        [{date:'Jul 25',project:'GreenCo RTC-2',mw:500},{date:'Oct 25',project:'AP Wind-Solar',mw:600}],
      'NTPC Renewable': [{date:'May 25',project:'Khavda Pkg-3',mw:800},{date:'Sep 25',project:'Rajasthan Ph-2',mw:600},{date:'Dec 25',project:'New Tender Pkg',mw:400}],
      'JSW Energy':     [{date:'Jun 25',project:'Raj Solar Block',mw:300},{date:'Dec 25',project:'Karnataka Hybrid',mw:400}],
      'Torrent Power':  [{date:'Aug 25',project:'Gujarat Solar Ph-2',mw:200}],
      'Acme Solar':     [{date:'Sep 25',project:'SECI Hybrid Ph-1',mw:400},{date:'Jan 26',project:'SECI Raj Ph-2',mw:500}],
    }
  },

  /* ── TAB 6: POLICY ──────────────────────────────────────────────── */
  policy: {
    kpis: {
      policyChanges: { value: '14',  unit: '',    delta: '+6',     dir: 'up', context: 'FY24-25 YTD notifications' },
      almmStatus:    { value: 'Rev.4', unit: '',  delta: 'Updated', dir: 'flat', context: 'ALMM revision in effect' },
      pliStatus:     { value: 'Tranche 2', unit:'', delta: 'Disbursing', dir: 'up', context: 'PLI scheme status' },
      alertLevel:    { value: 'Moderate', unit:'', delta: 'Watch BCD', dir: 'flat', context: 'trade policy risk' },
    },
    timeline: [
      { date:'Apr 2025', title:'ALMM Rev.4 Notification', detail:'20 new manufacturers added; wafer category introduced', type:'neutral', color:'#3b82f6' },
      { date:'Mar 2025', title:'MoP Waiver Extended: Banking', detail:'Solar banking facility extended 2 more years for states', type:'positive', color:'#22c55e' },
      { date:'Feb 2025', title:'CERC: Must-Run Status Reaffirmed', detail:'Solar must-run status clarified post state curtailment incidents', type:'positive', color:'#22c55e' },
      { date:'Jan 2025', title:'BCD Review Initiated', detail:'DGTR reviewing solar cell BCD applicability post safeguard lapse', type:'watchlist', color:'#a855f7' },
      { date:'Dec 2024', title:'RPO Trajectory Revised Upward', detail:'Solar RPO for FY26: 6.94%, up from 6.12% earlier', type:'positive', color:'#22c55e' },
      { date:'Nov 2024', title:'PLI Tranche 2 Disbursement Start', detail:'₹4,200 Cr disbursed to 4 manufacturers for cell capacity', type:'positive', color:'#22c55e' },
      { date:'Oct 2024', title:'DISCOM Payment Security Tightened', detail:'MoP circular: LC mandatory for new PPAs above 100 MW', type:'positive', color:'#22c55e' },
      { date:'Sep 2024', title:'Hybrid Wind-Solar DCR Proposal', detail:'MNRE drafts domestic content for hybrid systems', type:'watchlist', color:'#a855f7' },
      { date:'Aug 2024', title:'CERC Regulation 5/2024: Storage', detail:'Ancillary services market for battery storage defined', type:'positive', color:'#22c55e' },
    ],
    categories: [
      { name:'ALMM', icon:'fa-list-check', iconColor:'#3b82f6', iconBg:'rgba(59,130,246,0.1)', desc:'Approved List of Models & Manufacturers. Controls which modules and cells can be used in government-funded projects.', status:'Rev.4 Active', statusClass:'tag-info' },
      { name:'DCR / Domestic Content', icon:'fa-flag', iconColor:'#22c55e', iconBg:'rgba(34,197,94,0.1)', desc:'Domestic content requirements for solar under CPSU, PM-KUSUM, and state schemes. Hybrid DCR under discussion.', status:'Partially Active', statusClass:'tag-neutral' },
      { name:'PLI Scheme', icon:'fa-coins', iconColor:'#f59e0b', iconBg:'rgba(245,158,11,0.1)', desc:'Production-Linked Incentive for high-efficiency solar manufacturing. Tranche 2 disbursement ongoing.', status:'Disbursing T2', statusClass:'tag-positive' },
      { name:'Customs / BCD', icon:'fa-ship', iconColor:'#f97316', iconBg:'rgba(249,115,22,0.1)', desc:'Basic Customs Duty on solar cells (25%) and modules (40%). Under DGTR review for future applicability.', status:'Under Review', statusClass:'tag-watchlist' },
      { name:'MNRE / MoP Orders', icon:'fa-gavel', iconColor:'#a855f7', iconBg:'rgba(168,85,247,0.1)', desc:'Key ministry orders including RPO trajectory, must-run status, banking, and hybrid tender frameworks.', status:'Multiple Active', statusClass:'tag-info' },
      { name:'CERC / SERC Actions', icon:'fa-balance-scale', iconColor:'#14b8a6', iconBg:'rgba(20,184,166,0.1)', desc:'Central and state electricity regulator orders on tariff, wheeling, open access, and storage ancillary.', status:'CERC Reg 5/2024', statusClass:'tag-info' },
    ],
    deadlines: [
      { date:'30 Jun 2025', event:'ALMM Phase-II enforcement: All state tenders',    days:76,  status:'soon'   },
      { date:'31 Mar 2026', event:'RPO 6.94% compliance for obligated entities',     days:350, status:'ok'     },
      { date:'31 Jul 2025', event:'PLI Tranche-2 milestone output verification',     days:107, status:'ok'     },
      { date:'15 May 2025', event:'BCD Review DGTR final report expected',           days:31,  status:'soon'   },
      { date:'01 Apr 2025', event:'New RPO trajectory effective date',               days:null, status:'overdue'},
      { date:'31 Dec 2025', event:'Hybrid DCR consultation period closes',           days:260, status:'ok'     },
    ],
    impactMatrix: [
      { area:'Module Pricing',    direction:'negative', policy:'BCD review uncertainty',         desc:'Tariff risk if BCD reduced' },
      { area:'Domestic Mfg.',     direction:'positive', policy:'ALMM + PLI combined push',       desc:'Capacity additions accelerating' },
      { area:'Project Economics', direction:'positive', policy:'Banking extension',               desc:'Revenue certainty improved' },
      { area:'Bid Pipeline',      direction:'positive', policy:'RPO trajectory raised',           desc:'Demand pull for tenders' },
      { area:'DISCOM Risk',       direction:'positive', policy:'LC mandate for new PPAs',         desc:'Payment risk structure improved' },
      { area:'Storage Mkt',       direction:'positive', policy:'CERC Reg 5/2024',                desc:'BESS ancillary revenue unlocked' },
      { area:'Hybrid Bids',       direction:'neutral',  policy:'DCR Hybrid proposal pending',    desc:'Regulatory clarity awaited' },
      { area:'Curtailment',       direction:'positive', policy:'Must-run reaffirmed',             desc:'Legal protection strengthened' },
    ],
    regulationTable: [
      { notification:'MNRE/SO/2024-214', date:'Dec 2024', category:'RPO',    title:'Solar RPO Trajectory FY26-30',       impact:'positive',  status:'In Force'  },
      { notification:'MoP/12/2024',      date:'Oct 2024', category:'DISCOM', title:'LC Mandate for PPAs >100 MW',        impact:'positive',  status:'In Force'  },
      { notification:'CERC/5/2024',      date:'Aug 2024', category:'Storage',title:'Ancillary Services for BESS',        impact:'positive',  status:'In Force'  },
      { notification:'MNRE/ALMM/Rev4',   date:'Apr 2025', category:'ALMM',   title:'ALMM Revision 4 – Wafer Added',      impact:'neutral',   status:'In Force'  },
      { notification:'DGTR/BCD/2025',    date:'Jan 2025', category:'Customs',title:'BCD Applicability Review – Cells',   impact:'watchlist', status:'Under Review'},
      { notification:'MNRE/DCR/H/2024',  date:'Sep 2024', category:'DCR',    title:'Hybrid DCR Draft for Comments',      impact:'watchlist', status:'Draft'     },
      { notification:'MoP/Bank/2025',    date:'Mar 2025', category:'Banking',title:'Solar Banking Extension 2 Years',    impact:'positive',  status:'In Force'  },
      { notification:'CERC/MR/2025',     date:'Feb 2025', category:'Dispatch',title:'Must-Run Clarification Circular',   impact:'positive',  status:'In Force'  },
    ]
  },

  /* ── TAB 7: GRID / DISCOM ───────────────────────────────────────── */
  grid: {
    kpis: {
      discomDues:   { value: '₹1.28L', unit: 'Cr', delta: '-8%',  dir: 'down', context: 'total DISCOM RE dues', negativeGood: true },
      txReadiness:  { value: '64',    unit: '%',   delta: '+6pp', dir: 'up',   context: 'states with green corridor progress' },
      curtailment:  { value: '4.2',   unit: '%',   delta: '-0.8pp',dir: 'down', context: 'system-level curtailment rate', negativeGood: true },
      paymentRisk:  { value: 'Medium',unit: '',    delta: 'Stable', dir: 'flat', context: 'composite state payment risk' },
    },
    stateRisk: [
      { state:'Rajasthan',  score:38, risk:'low',    discomDues:8200,  curtail:3.1, txReady:'Yes' },
      { state:'Gujarat',    score:28, risk:'low',    discomDues:4200,  curtail:2.2, txReady:'Yes' },
      { state:'Tamil Nadu', score:56, risk:'medium', discomDues:9800,  curtail:6.4, txReady:'Partial' },
      { state:'Karnataka',  score:44, risk:'medium', discomDues:7600,  curtail:4.8, txReady:'Partial' },
      { state:'AP',         score:62, risk:'high',   discomDues:12400, curtail:5.2, txReady:'No'  },
      { state:'Telangana',  score:58, risk:'medium', discomDues:8800,  curtail:4.4, txReady:'Partial' },
      { state:'MP',         score:48, risk:'medium', discomDues:6400,  curtail:4.1, txReady:'Partial' },
      { state:'Maharashtra',score:52, risk:'medium', discomDues:8200,  curtail:3.8, txReady:'Partial' },
      { state:'UP',         score:72, risk:'high',   discomDues:14800, curtail:3.2, txReady:'No'  },
      { state:'Punjab',     score:66, risk:'high',   discomDues:9200,  curtail:2.8, txReady:'No'  },
      { state:'Jharkhand',  score:41, risk:'medium', discomDues:3200,  curtail:2.1, txReady:'Partial' },
      { state:'Bihar',      score:78, risk:'vhigh',  discomDues:16200, curtail:2.4, txReady:'No'  },
    ],
    discomDuesTrend: {
      labels: ['Q1FY23','Q2FY23','Q3FY23','Q4FY23','Q1FY24','Q2FY24','Q3FY24','Q4FY24','Q1FY25','Q2FY25','Q3FY25'],
      dues:   [168000,172000,165000,158000,152000,148000,144000,138000,134000,130000,128000],
    },
    txBottlenecks: [
      { region:'Rajasthan – Fatehpur Hub', capacity:'8.2 GW', issues:'None', status:'green' },
      { region:'Gujarat – Khavda Evac.',   capacity:'6.0 GW', issues:'Phase 2 pending',   status:'amber' },
      { region:'Tamil Nadu – Tirunelveli', capacity:'3.4 GW', issues:'Overloaded',         status:'red'   },
      { region:'AP – Kurnool Solar Park',  capacity:'4.1 GW', issues:'400 kV upgrade due', status:'amber' },
      { region:'Karnataka – Pavagada',     capacity:'2.6 GW', issues:'None', status:'green' },
      { region:'MP – Rewa / Agar Hub',     capacity:'1.8 GW', issues:'STU congestion',     status:'amber' },
    ],
    curtailmentRisk: [
      { state:'Tamil Nadu', q:'Q3FY25', pct:8.4, risk:'high' },
      { state:'AP',         q:'Q3FY25', pct:7.2, risk:'high' },
      { state:'Karnataka',  q:'Q3FY25', pct:5.6, risk:'medium' },
      { state:'Telangana',  q:'Q3FY25', pct:4.8, risk:'medium' },
      { state:'Rajasthan',  q:'Q3FY25', pct:2.8, risk:'low' },
      { state:'Gujarat',    q:'Q3FY25', pct:1.9, risk:'low' },
    ],
    riskFlags: [
      { level:'flag-high',   icon:'fa-triangle-exclamation', title:'Bihar DISCOM – Critical Payment Risk',       detail:'₹16,200 Cr dues; 3 RE developers issued default notices in Q3FY25' },
      { level:'flag-high',   icon:'fa-triangle-exclamation', title:'Tamil Nadu Grid – Peak Curtailment 8.4%',    detail:'Tirunelveli evacuation line overloaded; TANTRANSCO upgrade delayed by 18 months' },
      { level:'flag-medium', icon:'fa-exclamation-circle',   title:'UP DISCOM Payment Track Record Weak',        detail:'Payment delays averaging 82 days vs contractual 30-day terms' },
      { level:'flag-medium', icon:'fa-exclamation-circle',   title:'Khavda Phase 2 Evacuation Timeline Risk',   detail:'6 GW capacity lacks evacuation confirmation; grid completion by Q4FY26 uncertain' },
      { level:'flag-medium', icon:'fa-exclamation-circle',   title:'AP DISCOM Dispute Backlog',                  detail:'6 pending arbitrations totalling ₹2,400 Cr in disputed RE payments' },
      { level:'flag-low',    icon:'fa-info-circle',           title:'Karnataka: Banking Utilization Cap Risk',   detail:'H2 solar banking quota 78% utilized; excess generation may not be banked' },
    ],
    watchlist: [
      { state:'Bihar',     alert:'Payment default risk – monitor LC adequacy',           severity:'critical' },
      { state:'UP',        alert:'78-day avg payment delay; PPA disputes ongoing',       severity:'high'     },
      { state:'Tamil Nadu',alert:'Grid curtailment 8.4%; TANTRANSCO upgrade delayed',   severity:'high'     },
      { state:'AP',        alert:'Arbitration backlog; new DISCOM MD appointment needed',severity:'medium'  },
      { state:'Punjab',    alert:'PSPCL subsidy dependency – state fiscal risk',         severity:'medium'  },
    ]
  },

  /* ── TAB 8: RESTRICTED ──────────────────────────────────────────── */
  restricted: {
    vendors: [
      {
        name:'MNRE RECPDCL Portal', type:'Government / Login Required',
        shows:'Project-level commissioning data, solar park allotments, developer-wise capacity',
        notShows:'Real-time updates; data lags 6-9 months; no API',
        pricing:'Free with login',
        score:72,
        tags:['login','manual','gov']
      },
      {
        name:'MERIT India (POSOCO)',type:'Government / Public (Clunky)',
        shows:'Plant-level generation data, merit order dispatch, state-wise curtailment logs',
        notShows:'Project-level attribution; raw download only; no developer mapping',
        pricing:'Free',
        score:65,
        tags:['manual','gov','free']
      },
      {
        name:'Bloomberg NEF India', type:'Paid – Subscription',
        shows:'Full tender database, tariff discovery, capacity tracker, policy analysis',
        notShows:'Real-time DISCOM dues; plant-level operational data; filing-level financials',
        pricing:'$18,000–$28,000/yr',
        score:91,
        tags:['paid','premium']
      },
      {
        name:'BRIDGE TO INDIA',    type:'Paid – Report + Data',
        shows:'Quarterly market reports, company profiles, rooftop data, storage pipeline',
        notShows:'Daily/weekly updates; DISCOM payment tracking; live grid data',
        pricing:'$4,000–$8,000/report',
        score:83,
        tags:['paid','report']
      },
      {
        name:'JMK Research',       type:'Paid – Report',
        shows:'Solar + storage market sizing, manufacturer profiles, India-specific depth',
        notShows:'Listed company financials; real-time project tracking',
        pricing:'$1,500–$4,000/report',
        score:76,
        tags:['paid','report']
      },
      {
        name:'MCA21 / BSE Filings',type:'Public – Manual Pull',
        shows:'Private company financials, listed company disclosures, capex statements',
        notShows:'Project-level attribution; structured API access not available',
        pricing:'Free',
        score:68,
        tags:['free','manual']
      },
      {
        name:'IEX / PXIL Market Data',type:'Exchange – Paid API',
        shows:'DAM/RTM price discovery, solar RECs, green market transactions, OA data',
        notShows:'Project-specific curtailment; DISCOMs individual financial health',
        pricing:'₹2L–₹6L/yr for API',
        score:79,
        tags:['paid','exchange']
      },
      {
        name:'Mercom India Tracker',type:'Paid – Dashboard',
        shows:'Tender tracker, award updates, policy timeline, company news aggregation',
        notShows:'Structured API; granular project financials; generation data',
        pricing:'$4,000–$10,000/yr',
        score:80,
        tags:['paid','dashboard']
      },
    ],
    notIncluded: [
      { title:'MNRE Project Database',  reason:'No structured API; requires manual portal login and file download; 6-9 month data lag' },
      { title:'DISCOM Annual Accounts', reason:'Published annually in PDF format only; no machine-readable source available' },
      { title:'State Nodal Agency Data',reason:'Each state SNO has different formats; inconsistent coverage; no central aggregation' },
      { title:'Plant-level Generation', reason:'CEA/POSOCO data lacks developer attribution; requires manual reconciliation' },
      { title:'Private Company Financials',reason:'Not publicly disclosed for unlisted players like Greenko, Acme, Eden' },
      { title:'Real-time Grid Curtailment',reason:'SLDC data not aggregated centrally; state-level access requires bilateral arrangements' },
    ]
  }
};

// Data source metadata
const DATA_SOURCES = {
  demand:        { label: 'CEA / MNRE Monthly Reports', status: 'mock', updated: '14 Apr 2025' },
  manufacturing: { label: 'ALMM List + MNRE PLI Portal', status: 'mock', updated: '14 Apr 2025' },
  tender:        { label: 'SECI / MNRE Tender Portal + Mercom', status: 'mock', updated: '14 Apr 2025' },
  execution:     { label: 'MNRE RECPDCL + Company Disclosures', status: 'mock', updated: '14 Apr 2025' },
  ipp:           { label: 'BSE / NSE Filings + Company Reports', status: 'mock', updated: '14 Apr 2025' },
  policy:        { label: 'Gazette Notifications + MNRE/MoP Orders', status: 'mock', updated: '14 Apr 2025' },
  grid:          { label: 'PRAAPTI Portal + POSOCO + CEA', status: 'mock', updated: '14 Apr 2025' },
};
