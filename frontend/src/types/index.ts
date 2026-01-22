export type FlagStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface RiskAnalysis {
  id: string;
  flag_id: string;
  risk_score: number;
  ai_reasoning: string;
  detected_issues: string[];
  recommendation: string;
  analyzed_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: FlagStatus;
  risk_level: RiskLevel | null;
  config: {
    rollout_percentage?: number;
    target_users?: string[];
  };
  code_changes: string;
  scope: string;
  risk_analysis?: RiskAnalysis | null;
  required_approver?: string | null;
}

export interface Approval {
  id: string;
  flag_id: string;
  approver_id: string;
  status: ApprovalStatus;
  comment: string | null;
  approved_at: string | null;
  created_at: string;
  flag_details?: FeatureFlag | null;
}

export interface FlagCreateData {
  name: string;
  description: string;
  created_by: string;
  code_changes: string;
  scope: string;
  config: {
    rollout_percentage?: number;
    target_users?: string[];
  };
}
