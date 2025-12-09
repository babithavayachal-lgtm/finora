// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  RUB: '₽',
  BRL: 'R$',
  MXN: '$',
  ZAR: 'R',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  TRY: '₺',
  NZD: 'NZ$',
  THB: '฿',
  IDR: 'Rp',
  PHP: '₱',
  MYR: 'RM',
  VND: '₫',
  AED: 'د.إ',
  SAR: '﷼',
  ILS: '₪',
  CLP: '$',
  ARS: '$',
  COP: '$',
  PEN: 'S/',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  ISK: 'kr',
  UAH: '₴',
};

export const CURRENCIES = Object.keys(CURRENCY_SYMBOLS).sort();

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyCompact(amount: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

