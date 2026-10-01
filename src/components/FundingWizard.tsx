import { useMemo, useState, type ReactNode } from "react";
import {
  Bank,
  CaretLeft,
  CaretRight,
  HandCoins,
  Sparkle,
  TrendUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import {
  GRANT_CEILING,
  LOAN_CEILING,
  MICRO_LOAN_RATE,
  computeMonthlyPayment,
} from "@/data/mockData";
import type { FundingRequestDraft, FundingType, LivelihoodProject } from "@/types";

export const GENERAL_FUND = "general";
const STEPS = ["Funding type", "Amount", "Purpose", "Repayment"];
const TERMS = [3, 6, 12, 18];

const PRODUCTS: { id: FundingType; title: string; detail: string; icon: ReactNode }[] = [
  {
    id: "grant",
    title: "Starter grant",
    detail: `Interest-free community capital up to ${formatCurrency(GRANT_CEILING)}. No repayment schedule.`,
    icon: <Sparkle size={17} weight="duotone" />,
  },
  {
    id: "micro_loan",
    title: "Expansion micro-loan",
    detail: `Subsidised ${Math.round(MICRO_LOAN_RATE * 100)}% a year, up to ${formatCurrency(LOAN_CEILING)} across 3 to 18 months.`,
    icon: <Bank size={17} weight="duotone" />,
  },
];

interface FundingWizardProps {
  projects: LivelihoodProject[];
  walletBalance: number;
  onSubmit: (draft: FundingRequestDraft) => void;
}

export function FundingWizard({ projects, walletBalance, onSubmit }: FundingWizardProps) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<FundingType>("grant");
  const [amount, setAmount] = useState(800);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? GENERAL_FUND);
  const [purpose, setPurpose] = useState("");
  const [plan, setPlan] = useState("");
  const [termMonths, setTermMonths] = useState(12);

  const isGrant = type === "grant";
  const ceiling = isGrant ? GRANT_CEILING : LOAN_CEILING;
  const rate = isGrant ? 0 : MICRO_LOAN_RATE;
  const months = isGrant ? 0 : termMonths;
  const monthly = computeMonthlyPayment(amount, rate, months);

  const projectName = useMemo(
    () =>
      projectId === GENERAL_FUND
        ? "General livelihood fund"
        : (projects.find((item) => item.id === projectId)?.name ?? "Livelihood project"),
    [projectId, projects],
  );

  const nextStep = () => {
    if (step === 1) {
      if (amount < 50) {
        toast.error(
          `Request at least ${formatCurrency(50)} so the committee can process it.`,
        );
        return;
      }
      if (amount > ceiling) {
        toast.error(
          `${isGrant ? "Grants" : "Micro-loans"} are capped at ${formatCurrency(ceiling)}.`,
        );
        return;
      }
    }
    if (step === 2) {
      if (purpose.trim().length < 6) {
        toast.error("Describe what the funds will be used for.");
        return;
      }
      if (plan.trim().length < 20) {
        toast.error("Add a short delivery or repayment plan (20 characters minimum).");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const submit = () => {
    onSubmit({
      type,
      amount,
      projectId,
      projectName,
      purpose: purpose.trim(),
      planSummary: plan.trim(),
      termMonths: months,
      annualRate: rate,
      monthlyPayment: monthly,
    });
    setStep(0);
    setPurpose("");
    setPlan("");
    setAmount(800);
  };

  const liveRows: [string, string][] = [
    ["Product", isGrant ? "Starter grant" : "Expansion micro-loan"],
    ["Amount", formatCurrency(amount)],
    ["Allocation", projectName],
    ["Instalment", isGrant ? "No instalment" : `${formatCurrency(monthly)} / month`],
    ["Total cost", formatCurrency(monthly * months)],
  ];

  const reviewRows: [string, string][] = [
    ["Requested", formatCurrency(amount)],
    ["Rate", isGrant ? "0% interest-free" : `${Math.round(rate * 100)}% a year, subsidised`],
    ["Allocated to", projectName],
    ["Term", isGrant ? "No repayment" : `${months} months`],
    ["Instalment", isGrant ? "Not applicable" : formatCurrency(monthly)],
    ["Total repayment", formatCurrency(monthly * months)],
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          Capital desk
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Funding &amp; loans</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Apply for an interest-free starter grant or a subsidised expansion micro-loan, then
          track every request through officer review in the history below.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-1.5">
            {STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => index < step && setStep(index)}
                className={cn(
                  "min-w-0 flex-1 truncate rounded-full border px-2 py-1.5 text-[11px] font-medium transition-colors",
                  index === step
                    ? "border-primary bg-primary text-primary-foreground"
                    : index < step
                      ? "border-primary/40 bg-secondary text-secondary-foreground"
                      : "border-border bg-muted/50 text-muted-foreground",
                )}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {PRODUCTS.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setType(product.id);
                      setAmount(product.id === "grant" ? 800 : 1500);
                    }}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      type === product.id
                        ? "border-primary/60 bg-secondary/60 ring-2 ring-primary/25"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="grid size-8 place-items-center rounded-lg bg-card text-primary">
                        {product.icon}
                      </span>
                      {product.title}
                    </span>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {product.detail}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="request-amount">Requested amount</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="request-amount"
                      inputMode="numeric"
                      value={String(amount)}
                      onChange={(event) =>
                        setAmount(Number(event.target.value.replace(/[^0-9]/g, "")) || 0)
                      }
                      className="max-w-[9rem] text-lg font-semibold"
                    />
                    <span className="text-xs text-muted-foreground">
                      Ceiling {formatCurrency(ceiling)}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[Math.min(amount, ceiling)]}
                  min={50}
                  max={ceiling}
                  step={50}
                  onValueChange={(value) => setAmount(value[0] ?? 50)}
                />
                <div className="flex flex-wrap gap-2">
                  {[500, 1000, 1500, 2500]
                    .filter((preset) => preset <= ceiling)
                    .map((preset) => (
                      <Button
                        key={preset}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setAmount(preset)}
                      >
                        {formatCurrency(preset)}
                      </Button>
                    ))}
                </div>
                <div className="grid gap-2">
                  <Label>Allocate to</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                      <SelectItem value={GENERAL_FUND}>General livelihood fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="request-purpose">Purpose</Label>
                  <Input
                    id="request-purpose"
                    value={purpose}
                    placeholder="Chilled display unit and health permitting"
                    onChange={(event) => setPurpose(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="request-plan">Delivery and repayment plan</Label>
                  <Textarea
                    id="request-plan"
                    rows={4}
                    value={plan}
                    placeholder="Who buys the output, expected weekly sales, and how each instalment is covered."
                    onChange={(event) => setPlan(event.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {plan.trim().length}/20 characters minimum for the committee note.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4">
                {isGrant ? (
                  <p className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                    Starter grants carry no repayment schedule and no interest.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    <Label>Repayment term</Label>
                    <div className="flex flex-wrap gap-2">
                      {TERMS.map((term) => (
                        <Button
                          key={term}
                          size="sm"
                          variant={termMonths === term ? "default" : "outline"}
                          className="rounded-full"
                          onClick={() => setTermMonths(term)}
                        >
                          {term} months
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <dl className="grid gap-2.5 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
                  {reviewRows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-semibold tabular-nums">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              className="rounded-full"
              disabled={step === 0}
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            >
              <CaretLeft size={15} weight="bold" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button className="rounded-full" onClick={nextStep}>
                Continue <CaretRight size={15} weight="bold" />
              </Button>
            ) : (
              <Button className="rounded-full" onClick={submit}>
                <HandCoins size={16} weight="bold" /> Submit application
              </Button>
            )}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Available savings balance: {formatCurrency(walletBalance)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/70 to-card p-5">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <TrendUp size={16} weight="duotone" />
            </span>
            <h2 className="font-display text-lg tracking-tight">Live estimate</h2>
          </div>
          <dl className="mt-4 grid gap-2.5">
            {liveRows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/70 px-3 py-2"
              >
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="text-sm font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Approval credits the amount to your wallet and adds it to the allocated funds of
            the linked project.
          </p>
        </div>
      </section>
    </div>
  );
}