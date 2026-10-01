import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HandCoins } from "@phosphor-icons/react";
import { Toaster, toast } from "sonner";
import { Header } from "@/components/Header";
import { DashboardOverview } from "@/components/DashboardOverview";
import { LivelihoodProjects } from "@/components/LivelihoodProjects";
import { FundingAndLoans, RepayDialog } from "@/components/FundingAndLoans";
import { DepositDialog, WalletLedger } from "@/components/WalletLedger";
import {
  MICRO_LOAN_RATE,
  STORAGE_KEY,
  THEME_KEY,
  computeMonthlyPayment,
  createInitialState,
} from "@/data/mockData";
import { CURRENCY_STORAGE_KEY, getCurrency, isSupportedCurrency } from "@/data/currencies";
import { formatCurrency, setActiveCurrency } from "@/lib/utils";
import type {
  AppTab,
  ApplicationStatus,
  BalancePrivacy,
  DepositChannel,
  FinancialAdjustment,
  FundingApplication,
  FundingRequestDraft,
  LivelihoodProject,
  MemberState,
  MetricKey,
  Transaction,
} from "@/types";

type NewProjectInput = Pick<
  LivelihoodProject,
  "name" | "category" | "location" | "goal" | "monthlyReturn" | "deadline" | "summary"
>;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function localId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1296).toString(36)}`;
}

function localReference(prefix: string): string {
  return `OLP-${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

const PRIVACY_KEY = "optima-privacy-metrics";
const METRIC_KEYS: MetricKey[] = ["walletBalance", "outstanding", "grants", "portfolio"];

function privacyFrom(value: boolean): BalancePrivacy {
  return { walletBalance: value, outstanding: value, grants: value, portfolio: value };
}

function loadPrivacy(): BalancePrivacy {
  try {
    const raw = window.localStorage.getItem(PRIVACY_KEY);
    if (!raw) return privacyFrom(false);
    const parsed = JSON.parse(raw) as Partial<BalancePrivacy>;
    return {
      walletBalance: Boolean(parsed.walletBalance),
      outstanding: Boolean(parsed.outstanding),
      grants: Boolean(parsed.grants),
      portfolio: Boolean(parsed.portfolio),
    };
  } catch {
    return privacyFrom(false);
  }
}

function loadState(): MemberState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as MemberState;
    const valid =
      parsed &&
      typeof parsed.walletBalance === "number" &&
      parsed.profile &&
      Array.isArray(parsed.projects) &&
      Array.isArray(parsed.transactions) &&
      Array.isArray(parsed.applications);
    return valid ? parsed : createInitialState();
  } catch {
    return createInitialState();
  }
}

export default function App() {
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState<MemberState>(() => loadState());
  const [activeTab, setActiveTab] = useState<AppTab>("overview");
  const [adminMode, setAdminMode] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [repayTarget, setRepayTarget] = useState<FundingApplication | null>(null);
  const [dark, setDark] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_KEY) === "dark";
    } catch {
      return false;
    }
  });

  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    let stored = "USD";
    try {
      const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (raw && isSupportedCurrency(raw)) stored = raw.toUpperCase();
    } catch {
      /* storage unavailable */
    }
    setActiveCurrency(stored);
    return stored;
  });

  const activeCurrency = getCurrency(currencyCode);

  const [privacy, setPrivacy] = useState<BalancePrivacy>(() => loadPrivacy());
  const balancesHidden = METRIC_KEYS.every((key) => privacy[key]);

  const handleCurrencyChange = (code: string) => {
    setActiveCurrency(code);
    setCurrencyCode(code);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
    const config = getCurrency(code);
    toast.success(`Amounts are now shown in ${config.name} (${config.code}).`);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    try {
      window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  }, [dark]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacy));
    } catch {
      /* storage unavailable */
    }
  }, [privacy]);

  const pendingCount = useMemo(
    () => state.applications.filter((app) => app.status === "Pending").length,
    [state.applications],
  );

  const firstName = state.profile.name.split(" ")[0];

  const handleDeposit = (amount: number, channel: DepositChannel, note: string) => {
    const entry: Transaction = {
      id: localId("tx"),
      reference: localReference("TX"),
      type: "deposit",
      label: note.trim() || "Savings deposit",
      channel,
      amount,
      date: today(),
    };
    setState((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
      transactions: [entry, ...prev.transactions],
    }));
    toast.success(`${formatCurrency(amount)} credited via ${channel}.`);
  };

  const handleContribute = (projectId: string, amount: number) => {
    const project = state.projects.find((item) => item.id === projectId);
    const entry: Transaction = {
      id: localId("tx"),
      reference: localReference("TX"),
      type: "project_allocation",
      label: `Allocated to ${project?.name ?? "livelihood project"}`,
      channel: "Member request",
      amount,
      date: today(),
      projectId,
    };
    setState((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
      projects: prev.projects.map((item) =>
        item.id === projectId
          ? {
              ...item,
              saved: item.saved + amount,
              status:
                item.saved + amount >= item.goal
                  ? "Completed"
                  : item.status === "Planning"
                    ? "In Progress"
                    : item.status,
            }
          : item,
      ),
      transactions: [entry, ...prev.transactions],
    }));
    toast.success(`${formatCurrency(amount)} allocated to ${project?.name ?? "the project"}.`);
  };

  const handleCreateProject = (input: NewProjectInput) => {
    const project: LivelihoodProject = {
      id: localId("prj"),
      owner: state.profile.name,
      saved: 0,
      status: "Planning",
      milestones: [
        { label: "Group registration filed", done: true },
        { label: "First savings allocation", done: false },
        { label: "Committee review", done: false },
      ],
      ...input,
    };
    setState((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
    toast.success(`${project.name} added to your project tracker.`);
  };

  const handleSubmitFunding = (draft: FundingRequestDraft) => {
    const application: FundingApplication = {
      id: localId("app"),
      reference: localReference("APP"),
      type: draft.type,
      amount: draft.amount,
      projectId: draft.projectId,
      projectName: draft.projectName,
      purpose: draft.purpose,
      planSummary: draft.planSummary,
      termMonths: draft.termMonths,
      annualRate: draft.annualRate,
      monthlyPayment: draft.monthlyPayment,
      outstanding: 0,
      status: "Pending",
      submittedAt: today(),
    };
    setState((prev) => ({ ...prev, applications: [application, ...prev.applications] }));
    toast.success(
      `${draft.type === "grant" ? "Grant" : "Micro-loan"} request for ${formatCurrency(draft.amount)} submitted.`,
    );
  };

  const handleReview = (id: string, status: ApplicationStatus, note?: string) => {
    const target = state.applications.find((app) => app.id === id);
    if (!target) return;
    const approving = status === "Approved & Disbursed";

    const entry: Transaction | null = approving
      ? {
          id: localId("tx"),
          reference: localReference("TX"),
          type: target.type === "micro_loan" ? "loan_disbursement" : "grant_disbursement",
          label: `${target.type === "micro_loan" ? "Micro-loan" : "Livelihood grant"} disbursed for ${target.projectName}`,
          channel: "System credit",
          amount: target.amount,
          date: today(),
          projectId: target.projectId === "general" ? undefined : target.projectId,
        }
      : null;

    setState((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + (approving ? target.amount : 0),
      applications: prev.applications.map((app) =>
        app.id === id
          ? {
              ...app,
              status,
              outstanding:
                approving && app.type === "micro_loan" ? app.amount : app.outstanding,
              reviewedAt: today(),
              reviewerNote:
                note ??
                (approving
                  ? "Approved and disbursed by the branch committee."
                  : app.reviewerNote),
            }
          : app,
      ),
      projects:
        approving && target.projectId !== "general"
          ? prev.projects.map((project) =>
              project.id === target.projectId
                ? {
                    ...project,
                    saved: project.saved + target.amount,
                    status:
                      project.saved + target.amount >= project.goal
                        ? "Completed"
                        : timelineStatus(project.status),
                  }
                : project,
            )
          : prev.projects,
      transactions: entry ? [entry, ...prev.transactions] : prev.transactions,
    }));

    toast.success(
      approving
        ? `${formatCurrency(target.amount)} disbursed to your wallet.`
        : "Revision note sent to the member.",
    );
  };

  const handleRepay = (application: FundingApplication, amount: number) => {
    const entry: Transaction = {
      id: localId("tx"),
      reference: localReference("TX"),
      type: "loan_repayment",
      label: `Micro-loan instalment for ${application.projectName}`,
      channel: "Mobile Money",
      amount,
      date: today(),
      projectId: application.projectId === "general" ? undefined : application.projectId,
    };
    setState((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
      applications: prev.applications.map((app) =>
        app.id === application.id
          ? { ...app, outstanding: Math.max(app.outstanding - amount, 0) }
          : app,
      ),
      transactions: [entry, ...prev.transactions],
    }));
    toast.success(`${formatCurrency(amount)} repayment recorded.`);
  };

  const handleToggleMetric = (key: MetricKey) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleBalances = () => {
    const next = !balancesHidden;
    setPrivacy(privacyFrom(next));
    toast[next ? "message" : "success"](
      next ? "All balances masked on this device." : "All balances revealed.",
    );
  };

  const handleSettleLoan = (applicationId: string) => {
    const loan = state.applications.find((app) => app.id === applicationId);
    if (!loan || loan.outstanding <= 0) return;
    const entry: Transaction = {
      id: localId("tx"),
      reference: localReference("TX"),
      type: "loan_repayment",
      label: `Micro-loan settled for ${loan.projectName}`,
      channel: "Value adjuster",
      amount: loan.outstanding,
      date: today(),
      projectId: loan.projectId === "general" ? undefined : loan.projectId,
    };
    setState((prev) => ({
      ...prev,
      walletBalance: Math.max(prev.walletBalance - loan.outstanding, 0),
      applications: prev.applications.map((app) =>
        app.id === applicationId ? { ...app, outstanding: 0, monthlyPayment: 0 } : app,
      ),
      transactions: [entry, ...prev.transactions],
    }));
    toast.success(`${loan.projectName} micro-loan marked as settled.`);
  };

  const handleApplyFinances = (values: FinancialAdjustment) => {
    let pool = values.allocatedSavings;
    const savedById: Record<string, number> = {};
    state.projects.forEach((project) => {
      const goal = values.projectGoals[project.id] ?? project.goal;
      const take = Math.max(Math.min(pool, goal), 0);
      savedById[project.id] = take;
      pool -= take;
    });

    const settled = state.applications.filter(
      (app) =>
        app.type === "micro_loan" &&
        app.outstanding > 0 &&
        (values.loanOutstanding[app.id] ?? app.outstanding) <= 0,
    );

    const entries: Transaction[] = settled.map((loan) => ({
      id: localId("tx"),
      reference: localReference("TX"),
      type: "loan_repayment",
      label: `Micro-loan settled for ${loan.projectName}`,
      channel: "Value adjuster",
      amount: loan.outstanding,
      date: today(),
      projectId: loan.projectId === "general" ? undefined : loan.projectId,
    }));

    const delta = values.walletBalance - state.walletBalance;
    if (delta > 0.01) {
      entries.unshift({
        id: localId("tx"),
        reference: localReference("TX"),
        type: "deposit",
        label: "Scenario savings added",
        channel: "Value adjuster",
        amount: Math.round(delta * 100) / 100,
        date: today(),
      });
    }

    setState((prev) => ({
      ...prev,
      walletBalance: values.walletBalance,
      projects: prev.projects.map((project) => {
        const goal = values.projectGoals[project.id] ?? project.goal;
        const saved = savedById[project.id] ?? project.saved;
        const status: LivelihoodProject["status"] =
          goal > 0 && saved >= goal
            ? "Completed"
            : project.status === "Completed"
              ? "In Progress"
              : project.status;
        return {
          ...project,
          goal,
          saved,
          monthlyReturn: values.monthlyReturn,
          status,
        };
      }),
      applications: prev.applications.map((app) => {
        if (app.type === "grant") {
          const amount = values.grantAmounts[app.id];
          return amount === undefined ? app : { ...app, amount: Math.max(amount, 0) };
        }
        const outstanding = values.loanOutstanding[app.id] ?? app.outstanding;
        return {
          ...app,
          annualRate: values.annualRate,
          outstanding,
          monthlyPayment:
            outstanding > 0
              ? computeMonthlyPayment(app.amount, values.annualRate, app.termMonths)
              : 0,
        };
      }),
      transactions: [...entries, ...prev.transactions],
    }));

    toast.success(
      `Values updated: ${formatCurrency(values.allocatedSavings)} across projects and ${formatCurrency(values.walletBalance)} in savings.`,
    );
    if (settled.length > 0) {
      toast.message(
        settled.length === 1
          ? `${settled[0].projectName} micro-loan settled in full.`
          : `${settled.length} micro-loans settled in full.`,
      );
    }
  };

  const handleReset = () => {
    setState(createInitialState());
    toast.success("Demo data restored to the cooperative baseline.");
  };

  const handleNotify = () => {
    if (pendingCount > 0) {
      toast.message(`${pendingCount} application awaiting officer review`, {
        description: "Enable officer mode in the header to approve or request changes.",
        action: { label: "Review", onClick: () => setActiveTab("funding") },
      });
      return;
    }
    const upcoming = state.transactions.length ? "Your ledger is up to date." : "No activity yet.";
    toast.message(`Good standing, ${firstName}`, { description: upcoming });
  };

  const nextInstalment = state.applications.find(
    (app) => app.type === "micro_loan" && app.outstanding > 0,
  );

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-32 size-[30rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/3 size-[26rem] rounded-full bg-gold/10 blur-3xl" />
      </div>

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        balance={state.walletBalance}
        projectCount={state.projects.length}
        pendingCount={pendingCount}
        memberName={state.profile.name}
        memberId={state.profile.memberId}
        currency={currencyCode}
        onCurrencyChange={handleCurrencyChange}
        dark={dark}
        onToggleTheme={() => setDark((prev) => !prev)}
        adminMode={adminMode}
        onToggleAdmin={(value) => {
          setAdminMode(value);
          toast[value ? "success" : "message"](
            value
              ? "Simulated admin officer mode enabled."
              : "Returned to member view.",
          );
        }}
        balancesHidden={balancesHidden}
        onToggleBalances={handleToggleBalances}
        onReset={handleReset}
        onNotify={handleNotify}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {activeTab === "overview" && (
              <DashboardOverview
                state={state}
                onNavigate={setActiveTab}
                onOpenDeposit={() => setDepositOpen(true)}
                onRequestRepay={(application) => setRepayTarget(application)}
                onToggleAdmin={setAdminMode}
                privacy={privacy}
                onToggleMetric={handleToggleMetric}
                onToggleBalances={handleToggleBalances}
                onApplyFinances={handleApplyFinances}
                onSettleLoan={handleSettleLoan}
              />
            )}

            {activeTab === "projects" && (
              <LivelihoodProjects
                projects={state.projects}
                walletBalance={state.walletBalance}
                onCreate={handleCreateProject}
                onContribute={handleContribute}
              />
            )}

            {activeTab === "funding" && (
              <FundingAndLoans
                applications={state.applications}
                projects={state.projects}
                adminMode={adminMode}
                walletBalance={state.walletBalance}
                onSubmit={handleSubmitFunding}
                onReview={handleReview}
                onRequestRepay={(application) => setRepayTarget(application)}
                onEnableAdmin={(value) => {
                  setAdminMode(value);
                  toast.success("Officer review enabled for this session.");
                }}
              />
            )}

            {activeTab === "ledger" && (
              <WalletLedger
                transactions={state.transactions}
                walletBalance={state.walletBalance}
                onOpenDeposit={() => setDepositOpen(true)}
                hideAmounts={balancesHidden}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="flex items-center gap-2">
            <HandCoins size={15} weight="duotone" className="text-primary" />
            Optima Livelihood Project finance hub
          </p>
          <p className="sm:max-w-md sm:text-right">
            Displayed in {activeCurrency.name} ({activeCurrency.code}) at 1 USD ={" "}
            {activeCurrency.perUsd.toLocaleString("en-US")}. Micro-loans priced at{" "}
            {Math.round(MICRO_LOAN_RATE * 100)}% a year, monthly instalments from{" "}
            {formatCurrency(
              nextInstalment
                ? nextInstalment.monthlyPayment
                : computeMonthlyPayment(1000, MICRO_LOAN_RATE, 12),
            )}
            .
          </p>
        </div>
      </footer>

      <DepositDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        onConfirm={handleDeposit}
      />
      <RepayDialog
        application={repayTarget}
        walletBalance={state.walletBalance}
        onOpenChange={(open) => {
          if (!open) setRepayTarget(null);
        }}
        onConfirm={handleRepay}
      />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

function timelineStatus(status: LivelihoodProject["status"]): LivelihoodProject["status"] {
  return status === "Planning" ? "In Progress" : status;
}