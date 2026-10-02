import { calculateSplit } from '../domain';
import { buildSummaryText, buildWhatsAppMessage, buildWhatsAppUrl, explainCalculation } from '../messages';
import { goldenInput } from '../test-fixtures';

describe('share messages', () => {
  const input = goldenInput('OWN_CONSUMPTION');
  const result = calculateSplit(input);

  it('WhatsApp message follows the template and the link encodes it', () => {
    const message = buildWhatsAppMessage(input, result, 0);
    expect(message).toBe(
      [
        'Hola Cuarto A. Este mes de luz te corresponde pagar S/ 112.50.',
        'Tu consumo: 90 kWh (lectura 1200 a 1290).',
        'Total del recibo: S/ 400.00. Precio por kWh: S/ 1.2500.',
        'Cualquier duda, avísame.',
      ].join('\n'),
    );
    const url = buildWhatsAppUrl(message);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(message);
  });

  it('warnings never leak into shareable text', () => {
    const noisyInput = goldenInput('OWN_CONSUMPTION', 600);
    const noisyResult = calculateSplit(noisyInput);
    expect(noisyResult.warnings.length).toBeGreaterThan(0);
    const texts = [
      buildSummaryText(noisyInput, noisyResult),
      ...noisyInput.rooms.map((_, index) => buildWhatsAppMessage(noisyInput, noisyResult, index)),
    ].join('\n');
    expect(texts).not.toMatch(/diferencia que asumes|Revisa que las lecturas/i);
  });
});

describe('explainCalculation', () => {
  it('OWN_CONSUMPTION shows the real numbers', () => {
    const text = explainCalculation(goldenInput('OWN_CONSUMPTION'), calculateSplit(goldenInput('OWN_CONSUMPTION')), 0).join('\n');
    expect(text).toContain('1290 − lectura anterior 1200 = 90 kWh');
    expect(text).toContain('S/ 400.00 ÷ 320 kWh');
    expect(text).toContain('= S/ 112.50');
  });

  it('SPLIT_ALL shows total × consumption ÷ sum', () => {
    const splitAll = goldenInput('SPLIT_ALL');
    expect(explainCalculation(splitAll, calculateSplit(splitAll), 1).join('\n')).toContain(
      'S/ 400.00 × 60 ÷ 285 = S/ 84.21',
    );
  });

  it('internet with the owner counts people, not rooms', () => {
    const input = { ...goldenInput('SPLIT_ALL'), service: 'internet' as const, includeOwner: true, rooms: [{ id: 'x', name: 'Juan', participates: true }] };
    expect(explainCalculation(input, calculateSplit(input), 0).join(' ')).toMatch(/2 personas/);
  });
});
