import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bank, CheckCircle, Clock, Sparkle, XCircle } from "@phosphor-icons/react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn, formatCurrency, formatShortDate } from "@/lib/utils";
import type { ApplicationStatus, FundingApplication } from "@/types";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Pending: "bg-gold-soft text-gold-foreground",
  "Approved & Disbursed": "bg-secondary text-secondary-foreground",
  "Needs Revision": "bg-destructive/12 text-destructive",
};

const STATUS_ICONS: Record<ApplicationStatus, ReactNode> = {
  Pending: <Clock size={13} weight="bold" />,
  "Approved & Disbursed": <CheckCircle size={13} weight="bold" />,
  "Needs Revision": <XCircle size={13} weight="bold" />,
};

const field = "rounded-xl border border-border bg-background/60 p-2.5";

interface FundingApplicationsProps {
  applications: FundingApplication[];
  adminMode: boolean;
  onReview: (id: string, status: ApplicationStatus, note?: string) => void;
  onRequestRepay: (application: FundingApplication) => void;
  onEnableAdmin: (value: boolean) => void;
}

export function FundingApplications({
  applications,
  adminMode,
  onReview,
  onRequestRepay,
  onEnableAdmin,
}: FundingApplicationsProps) {
  const reduced = useReducedMotion() ?? false;
  const [revision, setRevision] = useState<{ id: string; note: string } | null>(null);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Application history</h2>
          <p className="text-xs text-muted-foreground">
            {applications.length} request{applications.length === 1 ? "" : "s"} from this member
            account.
          </p>
        </div>
        <Badge
          className={cn(
            "rounded-full px-3 py-1.5",
            adminMode
              ? "border-0 bg-gold-soft text-gold-foreground hover:bg-gold-soft"
              : "border-border",
          )}
          variant={adminMode ? "default" : "outline"}
        >
          {adminMode ? "Officer review enabled" : "Member view"}
        </Badge>
      </div>

      {applications.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-2 p-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
            <Sparkle size={22} weight="duotone" />
          </span>
          <p className="font-display text-lg">No applications submitted yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Use the wizard above to request a starter grant or a subsidised micro-loan. Requests
            appear here for officer review.
          </p>
        </div>
      ) : (
        <motion.ul
          initial={reduced ? false : "hidden"}
          animate="show"
          variants={reduced ? {} : { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid gap-3 md:grid-cols-2"
        >
          {applications.map((application) => {
            const facts: [string, string][] = [
              ["Submitted", formatShortDate(application.submittedAt)],
              ["Term", application.termMonths === 0 ? "Grant" : `${application.termMonths} mo`],
              ["Outstanding", formatCurrency(application.outstanding)],
            ];
            const canRepay =
              application.type === "micro_loan" &&
              application.status === "Approved & Disbursed" &&
              application.outstanding > 0;

            return (
              <motion.li
                key={application.id}
                variants={
                  reduced
                    ? {}
                    : {
                        hidden: { opacity: 0, y: 12 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                      }
                }
                className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold">
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg",
                          application.type === "grant"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-foreground",
                        )}
                      >
                        {application.type === "grant" ? (
                          <Sparkle size={14} weight="bold" />
                        ) : (
                          <Bank size={14} weight="bold" />
                        )}
                      </span>
                      <span className="truncate">
                        {formatCurrency(application.amount)}{" "}
                        {application.type === "grant" ? "grant" : "micro-loan"}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {application.projectName} / {application.reference}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "shrink-0 gap-1 rounded-full border-0 text-[11px]",
                      STATUS_STYLES[application.status],
                    )}
                  >
                    {STATUS_ICONS[application.status]}
                    {application.status}
                  </Badge>
                </div>

                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                  {application.purpose}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  {facts.map(([label, value]) => (
                    <div key={label} className={field}>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 truncate font-semibold tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>

                {application.reviewerNote && (
                  <p className="mt-3 rounded-xl border border-border bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
                    Officer note: {application.reviewerNote}
                  </p>
                )}

                {canRepay && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {formatCurrency(application.monthlyPayment)} monthly instalment
                    </span>
                    <Button
                      size="sm"
                      className="ml-auto rounded-full"
                      onClick={() => onRequestRepay(application)}
                    >
                      Make a payment
                    </Button>
                  </div>
                )}

                {application.type === "micro_loan" &&
                  application.status === "Approved & Disbursed" &&
                  application.outstanding === 0 && (
                    <Badge className="mt-3 w-fit gap-1 rounded-full bg-secondary text-secondary-foreground">
                      <CheckCircle size={13} weight="bold" /> Fully repaid
                    </Badge>
                  )}

                {application.status === "Pending" && (
                  <div className="mt-3 border-t border-border pt-3">
                    {adminMode ? (
                      revision?.id === application.id ? (
                        <div className="grid gap-2">
                          <Textarea
                            rows={2}
                            value={revision.note}
                            placeholder="What must the member supply before resubmission?"
                            onChange={(event) =>
                              setRevision({ id: application.id, note: event.target.value })
                            }
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-full"
                              onClick={() => setRevision(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                onReview(
                                  application.id,
                                  "Needs Revision",
                                  revision.note.trim() ||
                                    "Attach a supplier quotation and resubmit.",
                                );
                                setRevision(null);
                              }}
                            >
                              Send note
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() =>
                              onReview(
                                application.id,
                                "Approved & Disbursed",
                                "Approved and disbursed by the branch committee.",
                              )
                            }
                          >
                            <CheckCircle size={14} weight="bold" /> Approve &amp; disburse
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => setRevision({ id: application.id, note: "" })}
                          >
                            Request revision
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span>Switch to officer mode to review this request.</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => onEnableAdmin(true)}
                        >
                          Enter officer mode
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </section>
  );
}

interface RepayDialogProps {
  application: FundingApplication | null;
  walletBalance: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: (application: FundingApplication, amount: number) => void;
}

export function RepayDialog({
  application,
  walletBalance,
  onOpenChange,
  onConfirm,
}: RepayDialogProps) {
  const [value, setValue] = useState("");
  const due = application?.monthlyPayment ?? 0;
  const outstanding = application?.outstanding ?? 0;

  const submit = () => {
    if (!application) return;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a repayment amount greater than zero.");
      return;
    }
    if (parsed > outstanding) {
      toast.error(`Only ${formatCurrency(outstanding)} is outstanding on this loan.`);
      return;
    }
    if (parsed > walletBalance) {
      toast.error("That is more than your available savings balance.");
      return;
    }
    onConfirm(application, parsed);
    setValue("");
    onOpenChange(false);
  };

  const quick = [due, due * 2, outstanding].filter(
    (option, index, all) => option > 0 && all.indexOf(option) === index,
  );

  return (
    <Dialog
      open={application !== null}
      onOpenChange={(open) => {
        if (!open) setValue("");
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Make a loan payment</DialogTitle>
          <DialogDescription>
            {formatCurrency(outstanding)} outstanding on {application?.projectName ?? "this loan"}
            . Wallet balance {formatCurrency(walletBalance)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="repay-amount">Repayment amount</Label>
            <Input
              id="repay-amount"
              inputMode="numeric"
              value={value}
              placeholder={String(due)}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {quick.map((option, index) => (
              <Button
                key={option}
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setValue(String(option))}
              >
                {outstanding === option && quick.length > 1 && index === quick.length - 1
                  ? `Settle ${formatCurrency(option)}`
                  : formatCurrency(option)}
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={submit}>
              Record payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}