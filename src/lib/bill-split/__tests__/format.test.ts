import { formatDate, formatSoles, parseNumber } from '../format';

describe('parseNumber', () => {
  it.each([
    ['187,50', 187.5],
    ['187.50', 187.5],
    ['1,234.50', 1234.5],
    ['1.234,50', 1234.5],
    ['1,234,567', 1234567],
    [' S/ 400 ', 400],
  ])('reads %p as %p', (text, expected) => {
    expect(parseNumber(text)).toBe(expected);
  });

  it.each(['', 'abc', '-5'])('rejects %p', (text) => {
    expect(parseNumber(text)).toBeUndefined();
  });
});

describe('Peruvian formatting', () => {
  it('formats soles', () => {
    expect(formatSoles(123450)).toBe('S/ 1,234.50');
    expect(formatSoles(5)).toBe('S/ 0.05');
  });

  it('formats dates as dd/mm/yyyy', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });
});
