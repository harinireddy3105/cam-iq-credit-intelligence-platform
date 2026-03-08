export type AssessmentStatus = 'draft' | 'processing' | 'review' | 'approved' | 'conditional' | 'rejected';

export interface FraudFlag {
  id: string;
  fraud_type: string;
  source_a: string;
  source_b: string;
  variance_amount: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
}

export interface ResearchFinding {
  id: string;
  source: string;
  finding: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'critical';
}

export interface Assessment {
  id: string;
  ref_no: string;
  borrower_name: string;
  cin: string;
  sector: string;
  loan_requested: number;
  loan_recommended: number;
  interest_rate: number | null;
  tenure_months: number | null;
  composite_score: number;
  character_score: number;
  capacity_score: number;
  capital_score: number;
  collateral_score: number;
  conditions_score: number;
  status: AssessmentStatus;
  recommendation_rationale: string;
  created_by: string;
  created_at: string;
  fraud_flags: FraudFlag[];
  research_findings: ResearchFinding[];
  covenants: string[];
}
