import { useMemo, useState } from "react";
import { CaretUpDown, Check, Globe, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CURRENCIES,
  POPULAR_CURRENCY_CODES,
  RATE_NOTE,
  REGION_ORDER,
  convertFromUsd,
  getCurrency,
  type CurrencyConfig,
  type CurrencyRegion,
} from "@/data/currencies";
import { cn, formatCurrency } from "@/lib/utils";

interface CurrencySwitcherProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
  /** Canonical USD wallet balance, previewed in every listed currency. */
  balance: number;
}

function matches(item: CurrencyConfig, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return (
    item.code.toLowerCase().includes(needle) ||
    item.name.toLowerCase().includes(needle) ||
    item.region.toLowerCase().includes(needle) ||
    item.symbol.toLowerCase().includes(needle)
  );
}

const RATE_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function CurrencySwitcher({ currency, onCurrencyChange, balance }: CurrencySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const active = getCurrency(currency);

  const popular = useMemo(() => POPULAR_CURRENCY_CODES.map((code) => getCurrency(code)), []);

  const results = useMemo(() => CURRENCIES.filter((item) => matches(item, term)), [term]);

  const filtering = term.trim().length > 0;

  const groups = useMemo(
    () =>
      REGION_ORDER.map((region: CurrencyRegion) => ({
        region,
        items: results.filter((item) => item.region === region),
      })).filter((group) => group.items.length > 0),
    [results],
  );

  const select = (code: string) => {
    onCurrencyChange(code);
    setOpen(false);
    setTerm("");
  };

  const renderRow = (item: CurrencyConfig) => {
    const isActive = item.code === active.code;
    return (
      <button
        key={item.code}
        type="button"
        onClick={() => select(item.code)}
        aria-pressed={isActive}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors active:scale-[0.99]",
          isActive ? "bg-primary/10" : "hover:bg-muted/70",
        )}
      >
        <span aria-hidden className="text-base leading-none">
          {item.flag}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-1.5">
            <span className="text-[13px] font-semibold">{item.code}</span>
            <span className="truncate text-[12px] text-muted-foreground">{item.name}</span>
          </span>
          <span className="mt-0.5 block text-[11px] tabular-nums text-muted-foreground">
            Your balance: {formatCurrency(balance, item.code)}
          </span>
        </span>
        {isActive ? (
          <Check size={15} weight="bold" className="shrink-0 text-primary" />
        ) : (
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {item.symbol}
          </span>
        )}
      </button>
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setTerm("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Display currency ${active.name}. Change display currency`}
          className="h-9 gap-1.5 rounded-full border border-border bg-card px-2 text-[13px] font-semibold shadow-sm sm:px-3"
        >
          <span aria-hidden className="text-base leading-none">
            {active.flag}
          </span>
          <span className="hidden sm:inline">{active.code}</span>
          <CaretUpDown size={13} weight="bold" className="hidden text-muted-foreground sm:inline" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="w-[19rem] p-0 sm:w-[23rem]">
        <div className="border-b border-border px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <Globe size={16} weight="duotone" className="text-primary" />
            <p className="font-display text-sm font-semibold tracking-tight">Display currency</p>
            <span className="ml-auto text-[11px] font-medium text-muted-foreground">
              {active.code}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Savings, project goals and instalments are stored in US dollars and converted for
            display. Switching currency never changes the stored amounts.
          </p>
          <p className="mt-2.5 inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-medium tabular-nums">
            1 USD = {RATE_FORMAT.format(convertFromUsd(1, active.code))} {active.code}
          </p>
        </div>

        <div className="px-3 pt-3">
          <div className="relative">
            <MagnifyingGlass
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              autoFocus
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search code, name or region"
              aria-label="Search currencies"
              className="h-9 pl-9 text-[13px]"
            />
            {term.length > 0 && (
              <button
                type="button"
                onClick={() => setTerm("")}
                aria-label="Clear currency search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={13} weight="bold" />
              </button>
            )}
          </div>

          <div className="no-scrollbar -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {popular.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => select(item.code)}
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  item.code === active.code
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {item.flag} {item.code}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[15rem] overflow-y-auto px-2 pb-2 pt-1">
          {results.length === 0 && (
            <div className="px-3 py-6 text-center">
              <p className="text-[13px] font-medium">
                No currency matches &quot;{term.trim()}&quot;
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Try a three-letter code such as KES or BRL.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTerm("")}
                className="mt-3 h-8 rounded-full text-[12px]"
              >
                Show all {CURRENCIES.length} currencies
              </Button>
            </div>
          )}

          {filtering && results.length > 0 && (
            <div className="pt-2">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {results.length} matches
              </p>
              {results.map(renderRow)}
            </div>
          )}

          {!filtering &&
            groups.map((group) => (
              <div key={group.region} className="pt-2">
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {group.region}
                </p>
                {group.items.map(renderRow)}
              </div>
            ))}
        </div>

        <p className="border-t border-border px-4 py-2.5 text-[10px] leading-relaxed text-muted-foreground">
          {RATE_NOTE}
        </p>
      </PopoverContent>
    </Popover>
  );
}