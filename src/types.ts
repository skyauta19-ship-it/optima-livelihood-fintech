export type AppTab = "overview" | "projects" | "funding" | "ledger";

export type TransactionType =
  | "deposit"
  | "grant_disbursement"
  | "loan_disbursement"
  | "project_allocation"
  | "loan_repayment";

export type DepositChannel =
  | "Mobile Money"
  | "Community Cooperative Deposit"
  | "Bank Transfer";

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  label: string;
  channel: string;
  amount: number;
  date: string;
  projectId?: string;
}

export type ProjectStatus = "Planning" | "In Progress" | "Completed";

export interface Milestone {
  label: string;
  done: boolean;
}

export interface LivelihoodProject {
  id: string;
  name: string;
  category: string;
  location: string;
  owner: string;
  summary: string;
  goal: number;
  saved: number;
  monthlyReturn: number;
  deadline: string;
  status: ProjectStatus;
  milestones: Milestone[];
}

export type FundingType = "grant" | "micro_loan";

export type ApplicationStatus =
  | "Pending"
  | "Approved & Disbursed"
  | "Needs Revision";

export interface FundingApplication {
  id: string;
  reference: string;
  type: FundingType;
  amount: number;
  projectId: string;
  projectName: string;
  purpose: string;
  planSummary: string;
  termMonths: number;
  annualRate: number;
  monthlyPayment: number;
  outstanding: number;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

export interface FundingRequestDraft {
  type: FundingType;
  amount: number;
  projectId: string;
  projectName: string;
  purpose: string;
  planSummary: string;
  termMonths: number;
  annualRate: number;
  monthlyPayment: number;
}

export interface MemberProfile {
  name: string;
  memberId: string;
  branch: string;
  joinedAt: string;
  creditScore: number;
  repaymentRate: number;
}

export interface MemberState {
  profile: MemberProfile;
  walletBalance: number;
  projects: LivelihoodProject[];
  transactions: Transaction[];
  applications: FundingApplication[];
}

/** Financial metrics a member can mask individually on the dashboard. */
export type MetricKey = "walletBalance" | "outstanding" | "grants" | "portfolio";

/** Per-metric masking preference, persisted separately from the ledger. */
export type BalancePrivacy = Record<MetricKey, boolean>;

/** Realistic scenario inputs applied to the ledger from the value adjuster. */
export interface FinancialAdjustment {
  walletBalance: number;
  allocatedSavings: number;
  monthlyReturn: number;
  annualRate: number;
  loanOutstanding: Record<string, number>;
  grantAmounts: Record<string, number>;
  projectGoals: Record<string, number>;
}