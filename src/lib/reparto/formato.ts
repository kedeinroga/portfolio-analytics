/** Parseo y formato peruano. Sin dependencias de locale del navegador. */

/**
 * Acepta coma o punto como separador decimal.
 * - "187,50" y "187.50" → 187.5
 * - "1,234.50" y "1.234,50" → 1234.5 (el último separador es el decimal)
 * - "1,234,567" → 1234567 (separador repetido = miles)
 * Devuelve undefined si está vacío o no es un número.
 */
export function parseNumero(texto: string): number | undefined {
  let t = texto.trim().replace(/\s/g, '').replace(/^S\/\.?/i, '');
  if (!t || !/^\d[\d.,]*$|^[.,]\d+$/.test(t)) return undefined;

  const ultimaComa = t.lastIndexOf(',');
  const ultimoPunto = t.lastIndexOf('.');
  const ultimo = Math.max(ultimaComa, ultimoPunto);

  if (ultimo >= 0) {
    const sep = t[ultimo];
    const repetido = t.split(sep).length > 2;
    const hayOtro = sep === ',' ? ultimoPunto >= 0 : ultimaComa >= 0;
    if (repetido && !hayOtro) {
      t = t.split(sep).join('');
    } else {
      const entero = t.slice(0, ultimo).replace(/[.,]/g, '');
      t = `${entero || '0'}.${t.slice(ultimo + 1)}`;
    }
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/** Soles (decimal) → céntimos enteros. */
export const aCentimos = (soles: number): number => Math.round(soles * 100);

/** 123450 → "1,234.50" */
export function formatoMonto(centimos: number): string {
  const negativo = centimos < 0;
  const abs = Math.abs(centimos);
  const enteros = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dec = String(abs % 100).padStart(2, '0');
  return `${negativo ? '-' : ''}${enteros}.${dec}`;
}

/** 123450 → "S/ 1,234.50" */
export const formatoSoles = (centimos: number): string => `S/ ${formatoMonto(centimos)}`;

/** Cantidades de consumo: hasta 3 decimales, sin ceros sobrantes. */
export const formatoCantidad = (n: number): string => String(Math.round(n * 1000) / 1000);

/** Fecha dd/mm/aaaa */
export function formatoFecha(fecha: Date): string {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${fecha.getFullYear()}`;
}
