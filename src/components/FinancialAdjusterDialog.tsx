import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bank, CheckCircle, Coins, SlidersHorizontal, Sparkle, Target } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";
import type { FinancialAdjustment, MemberState } from "@/types";

const clamp = (value: number): number => (Number.isFinite(value) ? Math.max(value, 0) : 0);
const money = (value: number): number => Math.round(clamp(value) * 100) / 100;

/** Stored as a fraction (0.08), edited and displayed as a percentage (8). */
const toPercentInput = (fraction: number): number => Number((clamp(fraction) * 100).toFixed(2));
const fromPercentInput = (percent: number): number => clamp(percent) / 100;

function buildDraft(state: MemberState): FinancialAdjustment {
  const loans = state.applications.filter((app) => app.type === "micro_loan");
  const grants = state.applications.filter(
    (app) => app.type === "grant" && app.status === "Approved & Disbursed",
  );
  const returnTotal = state.projects.reduce((total, project) => total + project.monthlyReturn, 0);

  return {
    walletBalance: money(state.walletBalance),
    allocatedSavings: money(state.projects.reduce((total, project) => total + project.saved, 0)),
    monthlyReturn: money(state.projects.length ? returnTotal / state.projects.length : 0),
    annualRate: money(loans[0]?.annualRate ?? 0),
    loanOutstanding: Object.fromEntries(
      loans.map((app) => [app.id, app.outstanding] as [string, number]),
    ),
    grantAmounts: Object.fromEntries(
      grants.map((app) => [app.id, app.amount] as [string, number]),
    ),
    projectGoals: Object.fromEntries(
      state.projects.map((project) => [project.id, project.goal] as [string, number]),
    ),
  };
}

interface FieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  hint?: string;
}

function Field({ id, label, value, onChange, suffix, hint }: FieldProps) {
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText((prev) => (Number(prev) === value ? prev : String(value)));
  }, [value]);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            if (next.trim() === "") {
              onChange(0);
              return;
            }
            const parsed = Number(next);
            if (Number.isFinite(parsed)) onChange(Math.max(parsed, 0));
          }}
          className={cn(
            "h-10 rounded-xl bg-background font-semibold tabular-nums",
            suffix && "pr-9",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

interface FinancialAdjusterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: MemberState;
  onApply: (values: FinancialAdjustment) => void;
  onSettleLoan: (applicationId: string) => void;
}

export function FinancialAdjusterDialog({
  open,
  onOpenChange,
  state,
  onApply,
  onSettleLoan,
}: FinancialAdjusterDialogProps) {
  const [draft, setDraft] = useState<FinancialAdjustment>(() => buildDraft(state));

  useEffect(() => {
    if (open) setDraft(buildDraft(state));
  }, [open, state]);

  const loans = useMemo(
    () => state.applications.filter((app) => app.type === "micro_loan"),
    [state.applications],
  );
  const grants = useMemo(
    () =>
      state.applications.filter(
        (app) => app.type === "grant" && app.status === "Approved & Disbursed",
      ),
    [state.applications],
  );

  const projections = useMemo(() => {
    const goalTotal = Object.values(draft.projectGoals).reduce((total, goal) => total + goal, 0);
    const savedTotal = Math.min(draft.allocatedSavings, goalTotal);
    const outstanding = Object.values(draft.loanOutstanding).reduce((total, value) => total + value, 0);
    const grantTotal = Object.values(draft.grantAmounts).reduce((total, value) => total + value, 0);
    return {
      goalTotal,
      outstanding,
      grantTotal,
      portfolio: goalTotal > 0 ? Math.round((savedTotal / goalTotal) * 100) : 0,
    };
  }, [draft]);

  const setNumber = (
    key: "walletBalance" | "allocatedSavings" | "monthlyReturn" | "annualRate",
    value: number,
  ) => setDraft((prev) => ({ ...prev, [key]: value }));

  const setGoal = (id: string, value: number) =>
    setDraft((prev) => ({ ...prev, projectGoals: { ...prev.projectGoals, [id]: value } }));

  const setOutstanding = (id: string, value: number) =>
    setDraft((prev) => ({ ...prev, loanOutstanding: { ...prev.loanOutstanding, [id]: value } }));

  const setGrant = (id: string, value: number) =>
    setDraft((prev) => ({ ...prev, grantAmounts: { ...prev.grantAmounts, [id]: value } }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <SlidersHorizontal size={18} weight="duotone" className="text-primary" />
            Adjust financial values
          </DialogTitle>
          <DialogDescription>
            Enter realistic savings, micro-loan, grant and portfolio figures. Totals recalculate
            instantly and the result is saved on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
          <section className="grid gap-4 sm:grid-cols-2">
            <Field
              id="adjust-wallet"
              label="Available savings"
              value={draft.walletBalance}
              onChange={(value) => setNumber("walletBalance", value)}
              hint="Balance held in your savings wallet"
            />
            <Field
              id="adjust-rate"
              label="Micro-loan annual rate"
              value={toPercentInput(draft.annualRate)}
              suffix="%"
              onChange={(value) => setNumber("annualRate", fromPercentInput(value))}
              hint="Recomputes every monthly instalment"
            />
            {state.projects.length > 0 && (
              <Field
                id="adjust-allocated"
                label="Allocated across projects"
                value={draft.allocatedSavings}
                onChange={(value) => setNumber("allocatedSavings", value)}
                hint="Filled into projects in list order"
              />
            )}
            {state.projects.length > 0 && (
              <Field
                id="adjust-return"
                label="Average monthly return"
                value={draft.monthlyReturn}
                suffix="%"
                onChange={(value) => setNumber("monthlyReturn", value)}
                hint="Applied to every livelihood project"
              />
            )}
          </section>

          {state.projects.length > 0 && (
            <section className="space-y-3">
              <SectionHeading
                icon={<Target size={16} weight="duotone" />}
                title="Project goals"
                hint="Target funding for each livelihood project"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {state.projects.map((project) => (
                  <Field
                    key={project.id}
                    id={`adjust-goal-${project.id}`}
                    label={project.name}
                    value={draft.projectGoals[project.id] ?? project.goal}
                    onChange={(value) => setGoal(project.id, value)}
                    hint={`${formatCurrency(project.saved)} allocated so far`}
                  />
                ))}
              </div>
            </section>
          )}

          {loans.length > 0 && (
            <section className="space-y-3">
              <SectionHeading
                icon={<Bank size={16} weight="duotone" />}
                title="Micro-loans"
                hint="Set the remaining balance or close a loan instantly"
              />
              <div className="space-y-2">
                {loans.map((loan) => {
                  const remaining = draft.loanOutstanding[loan.id] ?? loan.outstanding;
                  return (
                    <div
                      key={loan.id}
                      className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-background/60 p-3"
                    >
                      <div className="min-w-[9rem] flex-1">
                        <p className="truncate text-sm font-medium">{loan.projectName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatCurrency(loan.amount)} over {loan.termMonths} months
                        </p>
                      </div>
                      <div className="w-40">
                        <Field
                          id={`adjust-loan-${loan.id}`}
                          label="Remaining balance"
                          value={remaining}
                          onChange={(value) => setOutstanding(loan.id, value)}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={remaining <= 0}
                        onClick={() => onSettleLoan(loan.id)}
                        className="h-10 rounded-xl"
                      >
                        <CheckCircle size={14} weight="bold" /> Close loan
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {grants.length > 0 && (
            <section className="space-y-3">
              <SectionHeading
                icon={<Sparkle size={16} weight="duotone" />}
                title="Disbursed grants"
                hint="Adjust the value of grants already paid out"
              />
              <div className="space-y-2">
                {grants.map((grant) => (
                  <div
                    key={grant.id}
                    className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-background/60 p-3"
                  >
                    <div className="min-w-[9rem] flex-1">
                      <p className="truncate text-sm font-medium">{grant.projectName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {grant.reference} / disbursed{" "}
                        {formatShortDate(grant.reviewedAt ?? grant.submittedAt)}
                      </p>
                    </div>
                    <div className="w-40">
                      <Field
                        id={`adjust-grant-${grant.id}`}
                        label="Grant value"
                        value={draft.grantAmounts[grant.id] ?? grant.amount}
                        onChange={(value) => setGrant(grant.id, value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {loans.length === 0 && grants.length === 0 && state.projects.length === 0 && (
            <p className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              No projects, micro-loans or disbursed grants yet. Create a livelihood project or
              request capital first, then return here to fine-tune the figures.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-muted/40 p-3">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Portfolio funded {projections.portfolio}%
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Outstanding {formatCurrency(projections.outstanding)}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Grants {formatCurrency(projections.grantTotal)}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Target {formatCurrency(projections.goalTotal)}
          </Badge>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => setDraft(buildDraft(state))}
          >
            Reset fields
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
          >
            <Coins size={15} weight="bold" /> Apply values
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}