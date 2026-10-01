import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bank,
  CaretRight,
  CheckCircle,
  Coins,
  Download,
  Eye,
  EyeSlash,
  HandCoins,
  Rocket,
  SlidersHorizontal,
  Sparkle,
  Target,
  Wallet,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BALANCE_MASK, cn, formatCurrency, formatShortDate } from "@/lib/utils";
import { STORYBOARD_URL, isCredit } from "@/data/mockData";
import { FinancialAdjusterDialog } from "@/components/FinancialAdjusterDialog";
import type {
  AppTab,
  BalancePrivacy,
  FinancialAdjustment,
  FundingApplication,
  MemberState,
  MetricKey,
  Transaction,
} from "@/types";

const TX_ICONS: Record<Transaction["type"], ReactNode> = {
  deposit: <ArrowDownLeft size={15} weight="bold" />,
  grant_disbursement: <Sparkle size={15} weight="bold" />,
  loan_disbursement: <Bank size={15} weight="bold" />,
  project_allocation: <Target size={15} weight="bold" />,
  loan_repayment: <ArrowUpRight size={15} weight="bold" />,
};

function CountUp({ value, reduced }: { value: number; reduced: boolean }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 850, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  return <span className="tabular-nums">{formatCurrency(display)}</span>;
}

interface MetricCard {
  label: string;
  value: number;
  hint: string;
  icon: ReactNode;
  metricKey: MetricKey;
  featured?: boolean;
}

interface DashboardOverviewProps {
  state: MemberState;
  onNavigate: (tab: AppTab) => void;
  onOpenDeposit: () => void;
  onRequestRepay: (application: FundingApplication) => void;
  onToggleAdmin: (value: boolean) => void;
  privacy: BalancePrivacy;
  onToggleMetric: (key: MetricKey) => void;
  onToggleBalances: () => void;
  onApplyFinances: (values: FinancialAdjustment) => void;
  onSettleLoan: (applicationId: string) => void;
}

export function DashboardOverview({
  state,
  onNavigate,
  onOpenDeposit,
  onRequestRepay,
  onToggleAdmin,
  privacy,
  onToggleMetric,
  onToggleBalances,
  onApplyFinances,
  onSettleLoan,
}: DashboardOverviewProps) {
  const reduced = useReducedMotion() ?? false;
  const [zoom, setZoom] = useState(1);
  const [storyboardOpen, setStoryboardOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const hideAmounts =
    privacy.walletBalance && privacy.outstanding && privacy.grants && privacy.portfolio;

  const metrics = useMemo<MetricCard[]>(() => {
    const outstanding = state.applications
      .filter((app) => app.type === "micro_loan")
      .reduce((total, app) => total + app.outstanding, 0);
    const grants = state.applications
      .filter((app) => app.type === "grant" && app.status === "Approved & Disbursed")
      .reduce((total, app) => total + app.amount, 0);
    const goalTotal = state.projects.reduce((total, project) => total + project.goal, 0);
    const savedTotal = state.projects.reduce((total, project) => total + project.saved, 0);
    const portfolioIndex = goalTotal === 0 ? 0 : Math.round((savedTotal / goalTotal) * 100);

    return [
      {
        label: "Available savings",
        value: state.walletBalance,
        hint: "Ready to allocate or withdraw",
        icon: <Wallet size={18} weight="duotone" />,
        metricKey: "walletBalance",
        featured: true,
      },
      {
        label: "Outstanding micro-loan",
        value: outstanding,
        hint: outstanding > 0 ? "Next instalment due in 12 days" : "All micro-loans settled",
        icon: <HandCoins size={18} weight="duotone" />,
        metricKey: "outstanding",
      },
      {
        label: "Grants disbursed",
        value: grants,
        hint: "Interest-free community capital",
        icon: <CheckCircle size={18} weight="duotone" />,
        metricKey: "grants",
      },
      {
        label: "Portfolio funded",
        value: portfolioIndex,
        hint: "Average progress across all projects",
        icon: <Target size={18} weight="duotone" />,
        metricKey: "portfolio",
      },
    ];
  }, [state]);

  const recent = useMemo(
    () =>
      [...state.transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [state.transactions],
  );

  const nextInstalment = state.applications.find(
    (app) => app.type === "micro_loan" && app.outstanding > 0,
  );

  const container = reduced
    ? {}
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      };
  const item = reduced
    ? {}
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
      };

  return (
    <motion.div
      variants={container}
      initial={reduced ? false : "hidden"}
      animate="show"
      className="space-y-6"
    >
      <motion.section variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Member dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            Welcome back, {state.profile.name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track your savings, live micro-loans and livelihood projects for{" "}
            {state.profile.branch}. Member {state.profile.memberId}, joined{" "}
            {formatShortDate(state.profile.joinedAt)}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1.5">
            Credit score {state.profile.creditScore}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1.5">
            Repayment rate {state.profile.repaymentRate}%
          </Badge>
          {nextInstalment && (
            <Badge className="rounded-full bg-gold-soft px-3 py-1.5 text-gold-foreground hover:bg-gold-soft">
              {hideAmounts ? BALANCE_MASK : formatCurrency(nextInstalment.monthlyPayment)} due
              monthly
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            aria-pressed={hideAmounts}
            onClick={onToggleBalances}
            className="rounded-full px-3.5"
          >
            {hideAmounts ? (
              <EyeSlash size={15} weight="bold" />
            ) : (
              <Eye size={15} weight="bold" />
            )}
            {hideAmounts ? "Reveal balances" : "Hide balances"}
          </Button>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => {
          const masked = privacy[metric.metricKey];
          return (
            <div
              key={metric.label}
              className={cn(
                "tile-hover relative overflow-hidden rounded-2xl border p-5",
                metric.featured
                  ? "border-primary/40 bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-lg"
                  : "border-border bg-card",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-[0.14em]",
                  metric.featured ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                <span className="min-w-0 truncate">{metric.label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={masked ? `Reveal ${metric.label}` : `Hide ${metric.label}`}
                    aria-pressed={masked}
                    onClick={() => onToggleMetric(metric.metricKey)}
                    className={cn(
                      "grid size-8 place-items-center rounded-xl transition-colors",
                      metric.featured
                        ? "bg-white/15 hover:bg-white/25"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
                    )}
                  >
                    {masked ? (
                      <EyeSlash size={16} weight="duotone" />
                    ) : (
                      <Eye size={16} weight="duotone" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-xl",
                      metric.featured ? "bg-white/15" : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {metric.icon}
                  </span>
                </span>
              </div>
              <p className="mt-4 font-display text-3xl font-semibold tracking-tight">
                {masked ? (
                  <span className="tracking-[0.2em]">{BALANCE_MASK}</span>
                ) : metric.metricKey === "portfolio" ? (
                  <span className="tabular-nums">{metric.value}%</span>
                ) : (
                  <CountUp value={metric.value} reduced={reduced} />
                )}
              </p>
              <p
                className={cn(
                  "mt-2 text-xs",
                  metric.featured ? "text-primary-foreground/75" : "text-muted-foreground",
                )}
              >
                {masked ? "Hidden while masking is on" : metric.hint}
              </p>
              {metric.metricKey === "outstanding" && nextInstalment && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSettleLoan(nextInstalment.id)}
                  className="mt-3 h-8 rounded-full text-xs"
                >
                  <CheckCircle size={14} weight="bold" /> Settle loan now
                </Button>
              )}
            </div>
          );
        })}
      </motion.section>

      <motion.section
        variants={item}
        className="grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-[1.1fr_1fr]"
      >
        <div className="relative min-h-[240px] border-b border-border lg:border-b-0 lg:border-r">
          <img
            src={STORYBOARD_URL}
            alt="Optima Livelihood Project prototype storyboard showing wallet, loan and project screens"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
              Prototype storyboard
            </span>
            <Button
              size="sm"
              onClick={() => setStoryboardOpen(true)}
              className="rounded-full bg-white/90 text-slate-900 hover:bg-white"
            >
              <Eye size={15} weight="bold" /> Expand
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Design blueprint
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-tight">
              The livelihood app, screen by screen
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every screen in this hub follows the supplied storyboard: a savings wallet, a
              step-by-step funding application, a project tracker and an officer review
              console.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Wallet ledger", "Loan wizard", "Project tracker", "Officer review"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStoryboardOpen(true)} className="rounded-full">
              Open full storyboard <CaretRight size={15} weight="bold" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("funding")}
              className="rounded-full"
            >
              Review funding flow
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg tracking-tight">Quick actions</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Move money, apply for capital or export a statement.
          </p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAdjustOpen(true)}
              className="group flex items-start gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3.5 text-left transition-colors hover:border-primary/60 hover:bg-primary/10 sm:col-span-2"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                <SlidersHorizontal size={16} weight="bold" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Adjust financial values</span>
                <span className="block truncate text-xs text-muted-foreground">
                  Set realistic savings, micro-loan, grant and portfolio figures
                </span>
              </span>
              <CaretRight
                size={14}
                weight="bold"
                className="ml-auto mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </button>
            {[
              {
                label: "Deposit savings",
                detail: "Mobile money, cooperative or bank",
                icon: <ArrowDownLeft size={16} weight="bold" />,
                run: onOpenDeposit,
              },
              {
                label: "Request funding",
                detail: "Grant or subsidised micro-loan",
                icon: <Rocket size={16} weight="bold" />,
                run: () => onNavigate("funding"),
              },
              {
                label: "Make loan payment",
                detail: nextInstalment
                  ? hideAmounts
                    ? `${BALANCE_MASK} instalment`
                    : `${formatCurrency(nextInstalment.monthlyPayment)} instalment`
                  : "No active instalments",
                icon: <Bank size={16} weight="bold" />,
                run: () =>
                  nextInstalment ? onRequestRepay(nextInstalment) : onNavigate("funding"),
              },
              {
                label: "Generate statement",
                detail: "Download the ledger as CSV",
                icon: <Download size={16} weight="bold" />,
                run: () => onNavigate("ledger"),
              },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.run}
                className="group flex items-start gap-3 rounded-xl border border-border bg-background/60 p-3.5 text-left transition-colors hover:border-primary/50 hover:bg-secondary/60"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                  {action.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{action.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {action.detail}
                  </span>
                </span>
                <CaretRight
                  size={14}
                  weight="bold"
                  className="ml-auto mt-1 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg tracking-tight">Recent activity</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("ledger")}
              className="rounded-full text-xs"
            >
              View all
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {recent.map((tx) => {
              const credit = isCredit(tx.type);
              return (
                <li key={tx.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg",
                      credit
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-gold-soft text-gold-foreground",
                    )}
                  >
                    {TX_ICONS[tx.type]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{tx.label}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {formatShortDate(tx.date)} / {tx.channel}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      credit ? "text-primary" : "text-foreground",
                    )}
                  >
                    {hideAmounts ? (
                      <span className="tracking-[0.18em] text-muted-foreground">
                        {BALANCE_MASK}
                      </span>
                    ) : (
                      <>
                        {credit ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="rounded-2xl border border-border bg-gradient-to-r from-secondary/70 via-card to-gold-soft/60 p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Coins size={18} weight="duotone" />
            </span>
            <div>
              <p className="font-display text-base font-semibold">
                Cooperative impact this cycle
              </p>
              <p className="text-xs text-muted-foreground">
                Figures across the six branches sharing this pool.
              </p>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Members financed", "12,480"],
              ["Projects funded", "3,140"],
              ["Repayment rate", "98.9%"],
              ["Avg. monthly return", "41%"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <Dialog open={storyboardOpen} onOpenChange={setStoryboardOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display">Prototype storyboard blueprint</DialogTitle>
            <DialogDescription>
              The supplied screen flow laid out end to end. Toggle between fit and full size
              to inspect the wallet, loan and review screens.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Fit", value: 1 },
              { label: "1.5x", value: 1.5 },
              { label: "2x", value: 2 },
            ].map((option) => (
              <Button
                key={option.label}
                size="sm"
                variant={zoom === option.value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setZoom(option.value)}
              >
                {option.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => onToggleAdmin(true)}
            >
              <HandCoins size={15} weight="bold" /> Try officer review
            </Button>
          </div>
          <div className="max-h-[70vh] overflow-auto rounded-xl border border-border bg-muted/40 p-2">
            <img
              src={STORYBOARD_URL}
              alt="Full Optima Livelihood Project prototype storyboard"
              style={{ width: `${zoom * 100}%` }}
              className="mx-auto block h-auto rounded-lg"
            />
          </div>
          {!state.projects.length && (
            <p className="text-sm text-muted-foreground">
              No projects yet. Create one from the Livelihood Projects tab to activate the
              tracker.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <FinancialAdjusterDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        state={state}
        onApply={onApplyFinances}
        onSettleLoan={onSettleLoan}
      />
    </motion.div>
  );
}