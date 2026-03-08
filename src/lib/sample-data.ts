import { Assessment } from './types';

export const sampleAssessments: Assessment[] = [
  {
    id: 'a1',
    ref_no: 'CAM-2025-0001',
    borrower_name: 'Rajasthan Steel Works Pvt Ltd',
    cin: 'U27100RJ2010PTC031245',
    sector: 'Steel / Manufacturing',
    loan_requested: 25,
    loan_recommended: 12,
    interest_rate: 13.50,
    tenure_months: 48,
    composite_score: 73,
    character_score: 82,
    capacity_score: 68,
    capital_score: 74,
    collateral_score: 79,
    conditions_score: 61,
    status: 'conditional',
    recommendation_rationale: 'Loan capped at ₹12 Crore due to GSTR-3B suppression of ₹18 Crore, factory utilisation at 40% per site visit, and steel sector margin pressure. Character score strong at 82. Risk premium of 200 bps applied. Quarterly GST submission covenant mandatory.',
    created_by: 'officer1',
    created_at: '2025-03-05T10:30:00Z',
    fraud_flags: [
      {
        id: 'ff1',
        fraud_type: 'GSTR-3B Suppression',
        source_a: 'GSTR-3B turnover ₹62 Crore',
        source_b: 'ITR Schedule BP revenue ₹80 Crore',
        variance_amount: '₹18 Crore',
        severity: 'HIGH',
        evidence: 'GSTR-3B declared turnover is ₹18 Crore lower than ITR Schedule BP income, indicating deliberate suppression of taxable supply to reduce GST liability in violation of Section 39 of the CGST Act 2017.'
      },
      {
        id: 'ff2',
        fraud_type: 'GSTR-2A Mismatch',
        source_a: 'ITC claimed ₹4.2 Crore in GSTR-3B',
        source_b: 'GSTR-2A auto-populated ITC ₹2.8 Crore',
        variance_amount: '₹1.4 Crore',
        severity: 'HIGH',
        evidence: 'Borrower has claimed Input Tax Credit of ₹1.4 Crore in excess of eligible ITC as per GSTR-2A, suggesting fictitious supplier invoices in violation of Section 16 of CGST Act.'
      },
      {
        id: 'ff3',
        fraud_type: 'Revenue Inflation',
        source_a: 'Bank statement credits ₹95 Crore',
        source_b: 'Declared revenue ₹80 Crore',
        variance_amount: '₹15 Crore',
        severity: 'MEDIUM',
        evidence: 'Bank statement credits exceed declared revenue by ₹15 Crore, suggesting either routing of third-party funds through business account or undisclosed revenue streams not reflected in ITR.'
      }
    ],
    research_findings: [
      { id: 'rf1', source: 'MCA', finding: 'No charges registered against Rajasthan Steel Works Pvt Ltd. Associated entity Rajasthan Alloys Ltd struck off by RoC in 2021 under Section 248 of Companies Act 2013.', sentiment: 'negative' },
      { id: 'rf2', source: 'eCourts', finding: 'No active litigation. One DRT case against promoter Ramesh Agarwal settled in 2019 with full recovery. Currently clean.', sentiment: 'neutral' },
      { id: 'rf3', source: 'CIBIL', finding: 'CIBIL Commercial score 687. No active DPD. Total existing credit exposure ₹8.4 Crore across 3 lenders. One settled NPA in 2018.', sentiment: 'neutral' },
      { id: 'rf4', source: 'News', finding: 'Steel sector facing 15-18% coking coal price increase in Q1 2025. EBITDA margins under pressure industry-wide. Domestic demand stable but exports declining.', sentiment: 'negative' },
      { id: 'rf5', source: 'RBI', finding: 'Steel sector classified under RBI standard asset category. No specific watchlist advisory. ECLGS benefits availed during COVID-19.', sentiment: 'neutral' }
    ],
    covenants: [
      'Quarterly GST return submission within 15 days of filing',
      'Minimum DSCR of 1.25x maintained throughout tenure',
      'No further secured borrowing without prior written consent'
    ]
  },
  {
    id: 'a2',
    ref_no: 'CAM-2025-0002',
    borrower_name: 'Shree Textiles India Ltd',
    cin: 'U17111GJ2015PTC085432',
    sector: 'Textile',
    loan_requested: 8,
    loan_recommended: 8,
    interest_rate: 11.25,
    tenure_months: 60,
    composite_score: 84,
    character_score: 88,
    capacity_score: 82,
    capital_score: 79,
    collateral_score: 86,
    conditions_score: 77,
    status: 'approved',
    recommendation_rationale: 'Full loan amount recommended. Clean financial profile with consistent GST and ITR filings. No fraud signals detected. Strong promoter track record with zero defaults. Textile sector outlook stable with PLI scheme benefits applicable.',
    created_by: 'officer1',
    created_at: '2025-03-03T14:15:00Z',
    fraud_flags: [],
    research_findings: [
      { id: 'rf6', source: 'MCA', finding: 'Company in good standing. No charges. All annual filings up to date. Promoter Suresh Patel holds 2 other active directorships with clean records.', sentiment: 'positive' },
      { id: 'rf7', source: 'eCourts', finding: 'No litigation history. Completely clean judicial record for company and promoters.', sentiment: 'positive' },
      { id: 'rf8', source: 'CIBIL', finding: 'Excellent CIBIL Commercial score 812. Zero DPD across all facilities. Existing exposure ₹3.2 Crore, well within limits.', sentiment: 'positive' },
      { id: 'rf9', source: 'News', finding: 'Textile sector benefiting from PLI scheme with ₹10,683 Crore allocated. Export orders from EU increasing. Positive outlook for FY2026.', sentiment: 'positive' },
      { id: 'rf10', source: 'RBI', finding: 'Textile sector under priority lending guidelines. Eligible for TUFS interest subsidy. Standard asset classification.', sentiment: 'positive' }
    ],
    covenants: []
  },
  {
    id: 'a3',
    ref_no: 'CAM-2025-0003',
    borrower_name: 'Prism Infrastructure Pvt Ltd',
    cin: 'U45201MH2018PTC312567',
    sector: 'Real Estate / Infrastructure',
    loan_requested: 40,
    loan_recommended: 0,
    interest_rate: null,
    tenure_months: null,
    composite_score: 31,
    character_score: 28,
    capacity_score: 35,
    capital_score: 42,
    collateral_score: 51,
    conditions_score: 38,
    status: 'rejected',
    recommendation_rationale: 'Loan rejected. Three HIGH severity fraud flags detected totalling ₹71 Crore variance. Active DRT case against promoter. Group entity Prism Holdings struck off. Shell vendor payments of ₹22 Crore to non-existent entities. Circular trading of ₹31 Crore detected between related parties. Risk profile unacceptable.',
    created_by: 'officer1',
    created_at: '2025-03-01T09:00:00Z',
    fraud_flags: [
      {
        id: 'ff4',
        fraud_type: 'Shell Vendor Payments',
        source_a: 'Payments ₹22 Crore to 6 vendors in FY2024',
        source_b: 'All 6 vendors struck off by MCA within 18 months',
        variance_amount: '₹22 Crore',
        severity: 'HIGH',
        evidence: 'Borrower made payments of ₹22 Crore to vendors subsequently struck off by Registrar of Companies under Section 248, indicating deliberate routing of funds to shell entities for money laundering or fund diversion.'
      },
      {
        id: 'ff5',
        fraud_type: 'Circular Trading',
        source_a: 'GST outward supply ₹85 Crore to 3 entities',
        source_b: 'Same 3 entities supply ₹78 Crore in purchases',
        variance_amount: '₹31 Crore inflated',
        severity: 'HIGH',
        evidence: 'Circular trading detected with same entities appearing in both sales and purchase registers, artificially inflating reported turnover by an estimated ₹31 Crore to misrepresent business scale to lenders.'
      },
      {
        id: 'ff6',
        fraud_type: 'Revenue Inflation',
        source_a: 'Bank credits ₹110 Crore FY2024',
        source_b: 'ITR declared revenue ₹92 Crore',
        variance_amount: '₹18 Crore',
        severity: 'HIGH',
        evidence: 'Bank statement credits exceed declared income by ₹18 Crore with no supporting documentation for the excess credits, suggesting accommodation entries or round-tripping of funds through business accounts.'
      }
    ],
    research_findings: [
      { id: 'rf11', source: 'MCA', finding: 'Prism Holdings Pvt Ltd (group entity, common director) struck off in 2023. Two related entities have outstanding MCA notices. Promoter Vikash Mehta has 7 directorships including 3 in struck-off companies.', sentiment: 'critical' },
      { id: 'rf12', source: 'eCourts', finding: 'Active DRT case filed by Punjab National Bank for ₹4.2 Crore against promoter Vikash Mehta. Case ongoing since 2022.', sentiment: 'critical' },
      { id: 'rf13', source: 'CIBIL', finding: 'CIBIL Commercial score 412. DPD of 90+ days reported by one lender in 2023. Existing credit exposure ₹31 Crore across 5 lenders.', sentiment: 'critical' },
      { id: 'rf14', source: 'News', finding: 'Multiple real estate developers in Mumbai facing insolvency proceedings under IBC 2016. Regulatory scrutiny increasing on infrastructure lending.', sentiment: 'negative' },
      { id: 'rf15', source: 'RBI', finding: 'Real estate sector under enhanced monitoring per RBI circular RBI/2023-24/87. Lenders advised to conduct enhanced due diligence.', sentiment: 'negative' }
    ],
    covenants: []
  }
];
