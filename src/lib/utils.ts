import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BASE_CURRENCY,
  convertFromUsd,
  getCurrency,
  type CurrencyConfig,
} from "@/data/currencies";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let activeCurrency: CurrencyConfig = getCurrency(BASE_CURRENCY);
const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(config: CurrencyConfig): Intl.NumberFormat {
  const cached = formatters.get(config.code);
  if (cached) return cached;
  const next = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: config.decimals,
  });
  formatters.set(config.code, next);
  return next;
}

/** Switches the display currency used by every formatCurrency call. */
export function setActiveCurrency(code: string): void {
  activeCurrency = getCurrency(code);
}

export function getActiveCurrency(): CurrencyConfig {
  return activeCurrency;
}

/**
 * Formats a canonical USD ledger amount in the active display currency.
 * Pass an explicit currency code for previews of other currencies.
 */
export function formatCurrency(value: number, code?: string): string {
  const config = code ? getCurrency(code) : activeCurrency;
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatterFor(config).format(convertFromUsd(safeValue, config.code));
}

/** Converts a canonical USD amount into the active currency and rounds it. */
export function convertActive(value: number, code?: string): number {
  const config = code ? getCurrency(code) : activeCurrency;
  const converted = convertFromUsd(Number.isFinite(value) ? value : 0, config.code);
  const factor = 10 ** config.decimals;
  return Math.round(converted * factor) / factor;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Placeholder shown in place of a monetary amount while privacy masking is on. */
export const BALANCE_MASK = "••••••";