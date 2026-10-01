import { FundingWizard } from "@/components/FundingWizard";
import { FundingApplications } from "@/components/FundingApplications";
import type { ApplicationStatus, FundingApplication, FundingRequestDraft, LivelihoodProject } from "@/types";

export { RepayDialog } from "@/components/FundingApplications";

interface FundingAndLoansProps {
  applications: FundingApplication[];
  projects: LivelihoodProject[];
  adminMode: boolean;
  walletBalance: number;
  onSubmit: (draft: FundingRequestDraft) => void;
  onReview: (id: string, status: ApplicationStatus, note?: string) => void;
  onRequestRepay: (application: FundingApplication) => void;
  onEnableAdmin: (value: boolean) => void;
}

export function FundingAndLoans({
  applications,
  projects,
  adminMode,
  walletBalance,
  onSubmit,
  onReview,
  onRequestRepay,
  onEnableAdmin,
}: FundingAndLoansProps) {
  return (
    <div className="space-y-6">
      <FundingWizard projects={projects} walletBalance={walletBalance} onSubmit={onSubmit} />
      <FundingApplications
        applications={applications}
        adminMode={adminMode}
        onReview={onReview}
        onRequestRepay={onRequestRepay}
        onEnableAdmin={onEnableAdmin}
      />
    </div>
  );
}