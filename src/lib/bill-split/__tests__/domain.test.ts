import {
  SplitError,
  SplitInput,
  calculateSplit,
  distributeProportionally,
  ownerDifferenceThreshold,
  validateInput,
} from '../domain';
import { amountsOf, goldenInput, internetInput, room, sum } from '../test-fixtures';

describe('golden case', () => {
  it('OWN_CONSUMPTION: S/ 1.25 per kWh and the owner absorbs 43.75', () => {
    const result = calculateSplit(goldenInput('OWN_CONSUMPTION'));
    expect(amountsOf(result)).toEqual([11250, 7500, 11250, 5625]);
    expect(result.lines.map((line) => line.consumption)).toEqual([90, 60, 90, 45]);
    expect(result.unitPrice).toBe(1.25);
    expect(result.totalChargedCents).toBe(35625);
    expect(result.ownerDifferenceCents).toBe(4375);
    expect(result.warnings).toEqual([]);
  });

  it('SPLIT_ALL: adds up to exactly 400.00 with the documented tie-break (first room wins)', () => {
    const result = calculateSplit(goldenInput('SPLIT_ALL'));
    // Exact: 126.3158, 84.2105, 126.3158, 63.1579. Two cents are left over:
    // D has the largest remainder (.79), then A and C tie at .58 and A comes first.
    expect(amountsOf(result)).toEqual([12632, 8421, 12631, 6316]);
    expect(sum(amountsOf(result))).toBe(40000);
    expect(result.totalChargedCents).toBe(40000);
    expect(result.ownerDifferenceCents).toBe(0);
    expect(result.unitPrice).toBeUndefined();
  });

  it('SPLIT_ALL does not need the main meter', () => {
    expect(sum(amountsOf(calculateSplit(goldenInput('SPLIT_ALL', null))))).toBe(40000);
  });
});

describe('rounding', () => {
  it('always adds up exactly for assorted totals and consumptions', () => {
    for (const totalCents of [1, 2, 3, 100, 9999, 123457, 1000001]) {
      for (const consumptions of [[1, 1, 1], [7, 13, 29], [0.5, 0.25, 0.125, 3], [1, 0, 2]]) {
        let previous = 0;
        const rooms = consumptions.map((consumption, index) => room(String(index), (previous += 10), previous + consumption));
        const amounts = amountsOf(calculateSplit({ service: 'water', totalCents, method: 'SPLIT_ALL', rooms }));
        expect(sum(amounts)).toBe(totalCents);
        amounts.forEach((amount) => expect(amount).toBeGreaterThanOrEqual(0));
      }
    }
  });

  it('a room with no consumption pays 0 under SPLIT_ALL', () => {
    const input = goldenInput('SPLIT_ALL');
    input.rooms[3] = room('D', 300, 300);
    const amounts = amountsOf(calculateSplit(input));
    expect(amounts[3]).toBe(0);
    expect(sum(amounts)).toBe(40000);
  });

  it('tie-break: with equal remainders the first room gets the cent', () => {
    expect(distributeProportionally(100, [BigInt(1), BigInt(1), BigInt(1)])).toEqual([34, 33, 33]);
    expect(distributeProportionally(101, [BigInt(1), BigInt(1), BigInt(1)])).toEqual([34, 34, 33]);
  });

  it('decimal readings do not accumulate floating-point error', () => {
    const input: SplitInput = {
      service: 'water',
      totalCents: 5000,
      method: 'SPLIT_ALL',
      rooms: [room('A', 0.1, 0.3), room('B', 0, 0.2)],
    };
    // 0.3 - 0.1 and 0.2 - 0 must be equal: 25.00 each
    expect(amountsOf(calculateSplit(input))).toEqual([2500, 2500]);
  });
});

describe('validation', () => {
  it('current reading below previous gives a specific message', () => {
    const input = goldenInput('OWN_CONSUMPTION');
    input.rooms[0] = room('A', 90, 80);
    expect(validateInput(input)).toContain(
      'La lectura actual (80) de "Cuarto A" es menor que la anterior (90). Revisa que no se hayan intercambiado.',
    );
    expect(() => calculateSplit(input)).toThrow(SplitError);
  });

  it('total <= 0', () => {
    expect(validateInput({ ...goldenInput('OWN_CONSUMPTION'), totalCents: 0 })[0]).toMatch(/mayor a S\/ 0/);
  });

  it('SPLIT_ALL with zero total consumption', () => {
    const input = goldenInput('SPLIT_ALL');
    input.rooms = input.rooms.map((item) => ({ ...item, currentReading: item.previousReading }));
    expect(validateInput(input).join(' ')).toMatch(/Ningún cuarto tiene consumo/);
    expect(() => calculateSplit(input)).toThrow(SplitError);
  });

  it('missing readings', () => {
    const input = goldenInput('SPLIT_ALL');
    input.rooms[1] = { ...input.rooms[1], currentReading: undefined };
    expect(validateInput(input).join(' ')).toMatch(/Falta la lectura/);
  });

  it('negative readings', () => {
    const input = goldenInput('SPLIT_ALL');
    input.rooms[1] = room('B', -5, 10);
    expect(validateInput(input).join(' ')).toMatch(/no pueden ser negativas/);
  });

  it('blank room name', () => {
    const input = goldenInput('SPLIT_ALL');
    input.rooms[0].name = '  ';
    expect(validateInput(input).join(' ')).toMatch(/Escribe un nombre/);
  });

  it('main meter must be positive when given', () => {
    expect(validateInput(goldenInput('OWN_CONSUMPTION', 0)).join(' ')).toMatch(/mayor a 0 kWh/);
  });

  it('OWN_CONSUMPTION without the main meter', () => {
    expect(validateInput(goldenInput('OWN_CONSUMPTION', null)).join(' ')).toMatch(/medidor general/);
  });

  it('more than 20 rooms', () => {
    const input = goldenInput('SPLIT_ALL');
    input.rooms = Array.from({ length: 21 }, (_, index) => room(String(index), 0, 1));
    expect(validateInput(input).join(' ')).toMatch(/máximo de 20/);
  });
});

describe('warnings', () => {
  it('rooms summing above the main meter warn without blocking', () => {
    const result = calculateSplit(goldenInput('OWN_CONSUMPTION', 200));
    expect(result.warnings.join(' ')).toMatch(/suman más/);
    expect(result.ownerDifferenceCents).toBeLessThan(0);
  });

  it('threshold depends on the number of tenants', () => {
    expect(ownerDifferenceThreshold(1)).toBeCloseTo(0.6);
    expect(ownerDifferenceThreshold(4)).toBeCloseTo(0.3);
    expect(ownerDifferenceThreshold(9)).toBeCloseTo(0.2);
  });

  it('warns when the owner absorbs more than expected (4 tenants: 30%)', () => {
    const result = calculateSplit(goldenInput('OWN_CONSUMPTION', 600)); // owner absorbs ~52%
    expect(result.warnings.join(' ')).toMatch(/mayor al 30% .* 4 inquilinos/);
  });

  it('the same share with 1 tenant does not warn', () => {
    const input = { ...goldenInput('OWN_CONSUMPTION', 600), rooms: [room('A', 1200, 1500)] }; // 300 of 600 kWh: owner absorbs 50% < 60%
    expect(calculateSplit(input).warnings).toEqual([]);
  });
});

describe('single room', () => {
  const single = (method: SplitInput['method']): SplitInput => ({ ...goldenInput(method), rooms: [room('A', 1200, 1290)] });

  it('OWN_CONSUMPTION with 1 tenant: they pay their consumption, the owner absorbs the rest', () => {
    const result = calculateSplit(single('OWN_CONSUMPTION'));
    expect(amountsOf(result)).toEqual([11250]);
    expect(result.ownerDifferenceCents).toBe(40000 - 11250);
  });

  it('SPLIT_ALL with 1 room still asks for 2 and explains what to do', () => {
    const errors = validateInput(single('SPLIT_ALL')).join(' ');
    expect(errors).toMatch(/al menos 2 cuartos/);
    expect(errors).toMatch(/medidor general/);
  });

  it('no rooms at all', () => {
    expect(validateInput({ ...goldenInput('OWN_CONSUMPTION'), rooms: [] }).join(' ')).toMatch(/al menos 1 cuarto/);
  });
});

describe('internet', () => {
  it('equal parts with cent adjustment', () => {
    expect(amountsOf(calculateSplit(internetInput([true, true, true])))).toEqual([3334, 3333, 3333]);
  });

  it('rooms that do not participate pay 0', () => {
    expect(amountsOf(calculateSplit(internetInput([true, false, true])))).toEqual([5000, 0, 5000]);
  });

  it('no participants: error', () => {
    expect(validateInput(internetInput([false, false])).join(' ')).toMatch(/al menos un cuarto/);
  });

  it('1 room plus the owner: half and half, the room gets the tie cent', () => {
    const result = calculateSplit(internetInput([true], 10001, true));
    expect(amountsOf(result)).toEqual([5001]);
    expect(result.ownerDifferenceCents).toBe(5000);
    expect(result.totalChargedCents + result.ownerDifferenceCents).toBe(10001);
  });
});
