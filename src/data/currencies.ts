export type CurrencyRegion =
  | "Americas"
  | "Europe"
  | "Africa"
  | "Asia Pacific"
  | "Middle East";

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  region: CurrencyRegion;
  /** Benchmark units of this currency per 1 US dollar. */
  perUsd: number;
  locale: string;
  decimals: number;
}

/** All ledger amounts are stored in this canonical unit. */
export const BASE_CURRENCY = "USD";
export const BASE_CURRENCY_NAME = "US Dollar";
export const RATE_NOTE = "Benchmark rates, reviewed manually. Stored amounts stay in USD.";
export const CURRENCY_STORAGE_KEY = "optima-livelihood-currency-v1";

export const REGION_ORDER: CurrencyRegion[] = [
  "Americas",
  "Europe",
  "Africa",
  "Asia Pacific",
  "Middle East",
];

export const POPULAR_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "KES",
  "GHS",
  "ZAR",
  "INR",
  "JPY",
  "BRL",
  "AED",
  "CAD",
];

export const CURRENCIES: CurrencyConfig[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", region: "Americas", perUsd: 1, locale: "en-US", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦", region: "Americas", perUsd: 1.36, locale: "en-CA", decimals: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽", region: "Americas", perUsd: 18.2, locale: "es-MX", decimals: 0 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", region: "Americas", perUsd: 5.55, locale: "pt-BR", decimals: 2 },
  { code: "ARS", name: "Argentine Peso", symbol: "$", flag: "🇦🇷", region: "Americas", perUsd: 1010, locale: "es-AR", decimals: 0 },
  { code: "CLP", name: "Chilean Peso", symbol: "$", flag: "🇨🇱", region: "Americas", perUsd: 950, locale: "es-CL", decimals: 0 },
  { code: "COP", name: "Colombian Peso", symbol: "$", flag: "🇨🇴", region: "Americas", perUsd: 4100, locale: "es-CO", decimals: 0 },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", flag: "🇵🇪", region: "Americas", perUsd: 3.75, locale: "es-PE", decimals: 2 },
  { code: "JMD", name: "Jamaican Dollar", symbol: "$", flag: "🇯🇲", region: "Americas", perUsd: 156, locale: "en-JM", decimals: 0 },
  { code: "TTD", name: "Trinidad Dollar", symbol: "$", flag: "🇹🇹", region: "Americas", perUsd: 6.78, locale: "en-TT", decimals: 2 },

  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", region: "Europe", perUsd: 0.92, locale: "de-DE", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", region: "Europe", perUsd: 0.79, locale: "en-GB", decimals: 2 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", region: "Europe", perUsd: 0.88, locale: "de-CH", decimals: 2 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", region: "Europe", perUsd: 10.6, locale: "sv-SE", decimals: 0 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", region: "Europe", perUsd: 10.8, locale: "nb-NO", decimals: 0 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", region: "Europe", perUsd: 6.9, locale: "da-DK", decimals: 0 },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", region: "Europe", perUsd: 3.95, locale: "pl-PL", decimals: 2 },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿", region: "Europe", perUsd: 23.2, locale: "cs-CZ", decimals: 0 },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺", region: "Europe", perUsd: 355, locale: "hu-HU", decimals: 0 },
  { code: "RON", name: "Romanian Leu", symbol: "lei", flag: "🇷🇴", region: "Europe", perUsd: 4.6, locale: "ro-RO", decimals: 2 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", region: "Europe", perUsd: 34.5, locale: "tr-TR", decimals: 0 },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", flag: "🇺🇦", region: "Europe", perUsd: 41.5, locale: "uk-UA", decimals: 0 },

  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", region: "Africa", perUsd: 1530, locale: "en-NG", decimals: 0 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", region: "Africa", perUsd: 129, locale: "en-KE", decimals: 0 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", region: "Africa", perUsd: 15.4, locale: "en-GH", decimals: 2 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", region: "Africa", perUsd: 17.9, locale: "en-ZA", decimals: 2 },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬", region: "Africa", perUsd: 48.5, locale: "ar-EG", decimals: 0 },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", region: "Africa", perUsd: 2600, locale: "sw-TZ", decimals: 0 },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", region: "Africa", perUsd: 3700, locale: "en-UG", decimals: 0 },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", flag: "🇷🇼", region: "Africa", perUsd: 1350, locale: "rw-RW", decimals: 0 },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", flag: "🇿🇲", region: "Africa", perUsd: 26.5, locale: "en-ZM", decimals: 2 },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK", flag: "🇲🇼", region: "Africa", perUsd: 1735, locale: "en-MW", decimals: 0 },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", flag: "🌍", region: "Africa", perUsd: 605, locale: "fr-SN", decimals: 0 },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", flag: "🌍", region: "Africa", perUsd: 605, locale: "fr-CM", decimals: 0 },
  { code: "MAD", name: "Moroccan Dirham", symbol: "DH", flag: "🇲🇦", region: "Africa", perUsd: 9.9, locale: "ar-MA", decimals: 2 },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", region: "Africa", perUsd: 120, locale: "am-ET", decimals: 0 },

  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", region: "Asia Pacific", perUsd: 84.2, locale: "en-IN", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", region: "Asia Pacific", perUsd: 152, locale: "ja-JP", decimals: 0 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", region: "Asia Pacific", perUsd: 7.25, locale: "zh-CN", decimals: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", region: "Asia Pacific", perUsd: 1360, locale: "ko-KR", decimals: 0 },
  { code: "AUD", name: "Australian Dollar", symbol: "$", flag: "🇦🇺", region: "Asia Pacific", perUsd: 1.52, locale: "en-AU", decimals: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "$", flag: "🇳🇿", region: "Asia Pacific", perUsd: 1.66, locale: "en-NZ", decimals: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", flag: "🇸🇬", region: "Asia Pacific", perUsd: 1.34, locale: "en-SG", decimals: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$", flag: "🇭🇰", region: "Asia Pacific", perUsd: 7.78, locale: "en-HK", decimals: 2 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", region: "Asia Pacific", perUsd: 15800, locale: "id-ID", decimals: 0 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", region: "Asia Pacific", perUsd: 4.45, locale: "ms-MY", decimals: 2 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", region: "Asia Pacific", perUsd: 58, locale: "en-PH", decimals: 0 },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", region: "Asia Pacific", perUsd: 34.2, locale: "th-TH", decimals: 0 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", region: "Asia Pacific", perUsd: 25400, locale: "vi-VN", decimals: 0 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", region: "Asia Pacific", perUsd: 278, locale: "en-PK", decimals: 0 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", region: "Asia Pacific", perUsd: 120, locale: "bn-BD", decimals: 0 },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰", region: "Asia Pacific", perUsd: 295, locale: "si-LK", decimals: 0 },

  { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪", region: "Middle East", perUsd: 3.67, locale: "ar-AE", decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦", region: "Middle East", perUsd: 3.75, locale: "ar-SA", decimals: 2 },
  { code: "QAR", name: "Qatari Riyal", symbol: "QAR", flag: "🇶🇦", region: "Middle East", perUsd: 3.64, locale: "ar-QA", decimals: 2 },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪", flag: "🇮🇱", region: "Middle East", perUsd: 3.7, locale: "he-IL", decimals: 2 },
  { code: "JOD", name: "Jordanian Dinar", symbol: "JD", flag: "🇯🇴", region: "Middle East", perUsd: 0.71, locale: "ar-JO", decimals: 2 },
];

export function getCurrency(code: string): CurrencyConfig {
  const match = CURRENCIES.find((item) => item.code === code.toUpperCase());
  return match ?? CURRENCIES[0];
}

export function isSupportedCurrency(code: string): boolean {
  return CURRENCIES.some((item) => item.code === code.toUpperCase());
}

export function convertFromUsd(amountUsd: number, code: string): number {
  const safe = Number.isFinite(amountUsd) ? amountUsd : 0;
  return safe * getCurrency(code).perUsd;
}

export function toUsd(amount: number, code: string): number {
  const config = getCurrency(code);
  if (config.perUsd === 0) return Number.isFinite(amount) ? amount : 0;
  return (Number.isFinite(amount) ? amount : 0) / config.perUsd;
}

export function convertAmount(amount: number, from: string, to: string): number {
  return convertFromUsd(toUsd(amount, from), to);
}