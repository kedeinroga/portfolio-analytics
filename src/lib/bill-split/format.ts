/** Number parsing and Peruvian formatting. No dependency on the browser locale. */

const DECIMAL_SEPARATORS = /[.,]/g;

/**
 * Accepts comma or dot as the decimal separator.
 * - "187,50" and "187.50" → 187.5
 * - "1,234.50" and "1.234,50" → 1234.5 (the last separator is the decimal one)
 * - "1,234,567" → 1234567 (a repeated separator means thousands)
 * Returns undefined when the text is empty or not a number.
 */
export function parseNumber(text: string): number | undefined {
  let normalized = text.trim().replace(/\s/g, '').replace(/^S\/\.?/i, '');
  if (!normalized || !/^\d[\d.,]*$|^[.,]\d+$/.test(normalized)) return undefined;

  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  const lastSeparatorIndex = Math.max(lastComma, lastDot);

  if (lastSeparatorIndex >= 0) {
    const separator = normalized[lastSeparatorIndex];
    const isRepeated = normalized.split(separator).length > 2;
    const hasOtherSeparator = separator === ',' ? lastDot >= 0 : lastComma >= 0;

    if (isRepeated && !hasOtherSeparator) {
      normalized = normalized.split(separator).join('');
    } else {
      const integerPart = normalized.slice(0, lastSeparatorIndex).replace(DECIMAL_SEPARATORS, '');
      normalized = `${integerPart || '0'}.${normalized.slice(lastSeparatorIndex + 1)}`;
    }
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

/** Soles (decimal) → integer cents. */
export const toCents = (soles: number): number => Math.round(soles * 100);

/** 123450 → "1,234.50" */
export function formatAmount(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const integerPart = Math.floor(absolute / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimals = String(absolute % 100).padStart(2, '0');
  return `${sign}${integerPart}.${decimals}`;
}

/** 123450 → "S/ 1,234.50" */
export const formatSoles = (cents: number): string => `S/ ${formatAmount(cents)}`;

/** Consumption quantities: up to 3 decimals, no trailing zeros. */
export const formatQuantity = (value: number): string => String(Math.round(value * 1000) / 1000);

/** dd/mm/yyyy */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}
