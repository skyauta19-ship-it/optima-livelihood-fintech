import { memo } from "react";
import { motion } from "framer-motion";
import {
  ArrowsClockwise,
  Bell,
  BellRinging,
  Eye,
  EyeSlash,
  HandCoins,
  Moon,
  ShieldCheck,
  Sun,
  Wallet,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { BALANCE_MASK, cn, formatCurrency } from "@/lib/utils";
import type { AppTab } from "@/types";

const TABS: { id: AppTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Livelihood Projects" },
  { id: "funding", label: "Funding & Loans" },
  { id: "ledger", label: "Wallet Ledger" },
];

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  balance: number;
  projectCount: number;
  pendingCount: number;
  memberName: string;
  memberId: string;
  currency: string;
  onCurrencyChange: (code: string) => void;
  dark: boolean;
  onToggleTheme: () => void;
  adminMode: boolean;
  onToggleAdmin: (value: boolean) => void;
  balancesHidden: boolean;
  onToggleBalances: () => void;
  onReset: () => void;
  onNotify: () => void;
}

function HeaderBase({
  activeTab,
  onTabChange,
  balance,
  projectCount,
  pendingCount,
  memberName,
  memberId,
  currency,
  onCurrencyChange,
  dark,
  onToggleTheme,
  adminMode,
  onToggleAdmin,
  balancesHidden,
  onToggleBalances,
  onReset,
  onNotify,
}: HeaderProps) {
  const initials = memberName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl",
        adminMode ? "border-gold/50" : "border-border/70",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onTabChange("overview")}
          className="flex shrink-0 items-center gap-2.5 text-left"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <HandCoins size={20} weight="bold" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-[15px] font-semibold tracking-tight">
              Optima Livelihood
            </span>
            <span className="block text-[11px] font-medium text-muted-foreground">
              Project finance hub
            </span>
          </span>
        </button>

        <nav aria-label="Primary" className="ml-1 hidden items-center gap-1 rounded-full border border-border bg-muted/50 p-1 lg:flex">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="header-tab-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-primary shadow-sm"
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm sm:flex">
                <Wallet size={16} weight="duotone" className="text-primary" />
                <span className="text-sm font-semibold tabular-nums">
                  {balancesHidden ? (
                    <span className="tracking-[0.16em]">{BALANCE_MASK}</span>
                  ) : (
                    formatCurrency(balance)
                  )}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {projectCount} {projectCount === 1 ? "project" : "projects"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {balancesHidden
                ? "Balances are masked"
                : `Stored as ${formatCurrency(balance, "USD")}, converted for display`}
            </TooltipContent>
          </Tooltip>

          <CurrencySwitcher
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            balance={balance}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={balancesHidden ? "Reveal all balances" : "Mask all balances"}
                aria-pressed={balancesHidden}
                onClick={onToggleBalances}
                className={cn("size-9 rounded-full", balancesHidden && "text-primary")}
              >
                {balancesHidden ? (
                  <EyeSlash size={18} weight="duotone" />
                ) : (
                  <Eye size={18} weight="duotone" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {balancesHidden ? "Reveal all balances" : "Mask all balances"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={onNotify}
                className="relative size-9 rounded-full"
              >
                {pendingCount > 0 ? (
                  <>
                    <BellRinging size={18} weight="duotone" />
                    <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-gold text-[10px] font-bold text-white">
                      {pendingCount}
                    </span>
                  </>
                ) : (
                  <Bell size={18} weight="duotone" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {pendingCount > 0
                ? `${pendingCount} application waiting for review`
                : "No new alerts"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reset demo data"
                onClick={onReset}
                className="hidden size-9 rounded-full sm:inline-flex"
              >
                <ArrowsClockwise size={18} weight="duotone" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset demo data</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
                onClick={onToggleTheme}
                className="size-9 rounded-full"
              >
                {dark ? <Sun size={18} weight="duotone" /> : <Moon size={18} weight="duotone" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{dark ? "Light theme" : "Dark theme"}</TooltipContent>
          </Tooltip>

          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-2.5 py-1 transition-colors",
              adminMode ? "border-gold/60 bg-gold-soft" : "border-border bg-card",
            )}
          >
            <ShieldCheck
              size={16}
              weight="duotone"
              className={adminMode ? "text-gold-foreground" : "text-muted-foreground"}
            />
            <Switch
              checked={adminMode}
              onCheckedChange={onToggleAdmin}
              aria-label="Toggle simulated admin officer mode"
            />
          </div>

          <span
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-secondary text-xs font-semibold text-secondary-foreground"
            title={`${memberName}, member ${memberId}`}
          >
            {initials}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-2 sm:px-6 lg:hidden">
        <div className="no-scrollbar -mx-1 flex flex-1 items-center gap-1.5 overflow-x-auto px-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                tab.id === activeTab
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-2 sm:px-6 lg:hidden">
        {adminMode && (
          <Badge className="rounded-full bg-gold-soft text-gold-foreground hover:bg-gold-soft">
            <ShieldCheck size={13} weight="bold" /> Simulated admin officer mode
          </Badge>
        )}
        <span className="rounded-full border border-border bg-card px-3 py-1 text-[12px] font-semibold tabular-nums">
          {balancesHidden ? (
            <span className="tracking-[0.16em]">{BALANCE_MASK}</span>
          ) : (
            formatCurrency(balance)
          )}
        </span>
        <CurrencySwitcher
          currency={currency}
          onCurrencyChange={onCurrencyChange}
          balance={balance}
        />
      </div>
    </header>
  );
}

export const Header = memo(HeaderBase);