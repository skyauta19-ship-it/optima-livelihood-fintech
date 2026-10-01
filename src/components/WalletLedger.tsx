import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bank,
  Coins,
  Download,
  MagnifyingGlass,
  Sparkle,
  Target,
  Wallet,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BALANCE_MASK, cn, formatCurrency, formatDate } from "@/lib/utils";
import { DEPOSIT_CHANNELS, isCredit, signedAmount } from "@/data/mockData";
import type { DepositChannel, Transaction, TransactionType } from "@/types";

const TYPE_LABELS: Record<TransactionType, string> = {
  deposit: "Savings deposit",
  grant_disbursement: "Grant disbursed",
  loan_disbursement: "Loan disbursed",
  project_allocation: "Project allocation",
  loan_repayment: "Loan repayment",
};

const TYPE_ICONS: Record<TransactionType, ReactNode> = {
  deposit: <ArrowDownLeft size={14} weight="bold" />,
  grant_disbursement: <Sparkle size={14} weight="bold" />,
  loan_disbursement: <Bank size={14} weight="bold" />,
  project_allocation: <Target size={14} weight="bold" />,
  loan_repayment: <ArrowUpRight size={14} weight="bold" />,
};

const ALL = "All activity";

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

interface WalletLedgerProps {
  transactions: Transaction[];
  walletBalance: number;
  onOpenDeposit: () => void;
  hideAmounts?: boolean;
}

export function WalletLedger({
  transactions,
  walletBalance,
  onOpenDeposit,
  hideAmounts = false,
}: WalletLedgerProps) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const ordered = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  const withBalance = useMemo(() => {
    let balance = walletBalance;
    return ordered.map((tx) => {
      const row = { tx, balanceAfter: balance };
      balance -= signedAmount(tx);
      return row;
    });
  }, [ordered, walletBalance]);

  const typeFilters = useMemo(
    () => Array.from(new Set(transactions.map((tx) => tx.type))),
    [transactions],
  );

  const activeFilter = filter !== ALL && !typeFilters.includes(filter as TransactionType) ? ALL : filter;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return withBalance.filter(({ tx }) => {
      const matchesType = activeFilter === ALL || tx.type === activeFilter;
      const matchesQuery =
        needle.length === 0 ||
        tx.label.toLowerCase().includes(needle) ||
        tx.reference.toLowerCase().includes(needle) ||
        tx.channel.toLowerCase().includes(needle);
      return matchesType && matchesQuery;
    });
  }, [activeFilter, query, withBalance]);

  const cycle = ordered[0]?.date.slice(0, 7) ?? "";
  const inflow = transactions
    .filter((tx) => tx.date.slice(0, 7) === cycle && isCredit(tx.type))
    .reduce((total, tx) => total + tx.amount, 0);
  const outflow = transactions
    .filter((tx) => tx.date.slice(0, 7) === cycle && !isCredit(tx.type))
    .reduce((total, tx) => total + tx.amount, 0);

  const exportStatement = () => {
    const header = ["Reference", "Date", "Type", "Description", "Channel", "Amount", "Balance"];
    const rows = withBalance.map(({ tx, balanceAfter }) => [
      tx.reference,
      tx.date,
      TYPE_LABELS[tx.type],
      tx.label,
      tx.channel,
      hideAmounts ? BALANCE_MASK : String(signedAmount(tx)),
      hideAmounts ? BALANCE_MASK : String(balanceAfter),
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((cell) => escapeCsv(cell)).join(","))
      .join(String.fromCharCode(10));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `optima-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Statement downloaded as CSV.");
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary via-emerald-700 to-emerald-800 p-6 text-primary-foreground shadow-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground/80">
            Wallet ledger
          </p>
          <p className="mt-3 font-display text-4xl font-semibold tracking-tight tabular-nums">
            {hideAmounts ? BALANCE_MASK : formatCurrency(walletBalance)}
          </p>
          <p className="mt-1 text-xs text-primary-foreground/80">
            Available savings balance held with the cooperative
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={onOpenDeposit}
              className="rounded-full bg-white text-emerald-800 hover:bg-white/90"
            >
              <ArrowDownLeft size={16} weight="bold" /> Add funds
            </Button>
            <Button
              variant="outline"
              onClick={exportStatement}
              title={hideAmounts ? "Amounts stay masked in the export" : "Export this statement"}
              className="rounded-full border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Download size={16} weight="bold" /> Download statement
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <ArrowDownLeft size={12} weight="bold" /> Inflow
            </p>
            <p className="mt-2 font-display text-xl font-semibold tabular-nums text-primary">
              {hideAmounts ? BALANCE_MASK : `+${formatCurrency(inflow)}`}
            </p>
            <p className="text-[11px] text-muted-foreground">This statement cycle</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <ArrowUpRight size={12} weight="bold" /> Outflow
            </p>
            <p className="mt-2 font-display text-xl font-semibold tabular-nums">
              {hideAmounts ? BALANCE_MASK : `-${formatCurrency(outflow)}`}
            </p>
            <p className="text-[11px] text-muted-foreground">Allocations and repayments</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <Coins size={12} weight="bold" /> Entries
            </p>
            <p className="mt-2 font-display text-xl font-semibold tabular-nums">
              {transactions.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Since account opening</p>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        {[ALL, ...typeFilters].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeFilter === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {option === ALL ? <Coins size={13} weight="bold" /> : TYPE_ICONS[option as TransactionType]}
            {option === ALL ? option : TYPE_LABELS[option as TransactionType]}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <MagnifyingGlass
            size={15}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference or note"
            className="rounded-full pl-9"
            aria-label="Search transactions"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <MagnifyingGlass size={22} weight="duotone" />
            </span>
            <p className="font-display text-lg">No transactions match these filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Clear the filters or add funds to start a new ledger entry.
            </p>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setFilter(ALL);
                setQuery("");
              }}
            >
              <X size={15} weight="bold" /> Clear filters
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Channel</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(({ tx, balanceAfter }) => {
                const credit = isCredit(tx.type);
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                            credit
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-gold-soft text-gold-foreground",
                          )}
                        >
                          {TYPE_ICONS[tx.type]}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{tx.label}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            {tx.reference}
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="rounded-full text-[11px]">
                        {TYPE_LABELS[tx.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {tx.channel}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "whitespace-nowrap text-right text-sm font-semibold tabular-nums",
                        credit ? "text-primary" : "text-foreground",
                      )}
                    >
                      {credit ? "+" : "-"}
                      {hideAmounts ? BALANCE_MASK : formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground sm:table-cell">
                      {hideAmounts ? BALANCE_MASK : formatCurrency(balanceAfter)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number, channel: DepositChannel, note: string) => void;
}

export function DepositDialog({ open, onOpenChange, onConfirm }: DepositDialogProps) {
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState<DepositChannel>(DEPOSIT_CHANNELS[0]);
  const [note, setNote] = useState("");

  const submit = () => {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a deposit amount greater than zero.");
      return;
    }
    if (parsed > 50000) {
      toast.error(
        `Single deposits above ${formatCurrency(50000)} need a branch visit.`,
      );
      return;
    }
    onConfirm(parsed, channel, note);
    setAmount("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add funds to your wallet</DialogTitle>
          <DialogDescription>
            Simulated deposit flow. Funds are credited instantly and appear at the top of your
            ledger.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="deposit-amount">Amount</Label>
            <Input
              id="deposit-amount"
              inputMode="numeric"
              value={amount}
              placeholder="320"
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[100, 250, 500, 1000].map((quick) => (
              <Button
                key={quick}
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setAmount(String(quick))}
              >
                {formatCurrency(quick)}
              </Button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label>Channel</Label>
            <Select
              value={channel}
              onValueChange={(value) => setChannel(value as DepositChannel)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                {DEPOSIT_CHANNELS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deposit-note">Note (optional)</Label>
            <Textarea
              id="deposit-note"
              rows={2}
              value={note}
              placeholder="Weekly group savings"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <Wallet size={15} weight="duotone" className="shrink-0 text-primary" />
            Deposits are added to your available savings balance immediately.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={submit}>
              Credit wallet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}