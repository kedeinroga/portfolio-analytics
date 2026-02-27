/**
 * Unit tests for /finanzas financial logic
 *
 * The three pure functions live inside page.tsx; they are re-declared
 * here (identical implementations) so they can be tested in isolation
 * without importing a 'use client' Next.js page module.
 */

// ─── Logic (mirrors page.tsx) ────────────────────────────────────────────────

const calculatePMT = (principal: number, annualRate: number, months: number): number => {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

const findRate = (principal: number, months: number, targetPayment: number): number => {
  if (targetPayment <= principal / months) return 0;
  let low = 0;
  let high = 500;
  let foundRate = 0;
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const payment = calculatePMT(principal, mid, months);
    if (Math.abs(payment - targetPayment) < 0.000001) return mid;
    if (payment > targetPayment) high = mid;
    else low = mid;
    foundRate = mid;
  }
  return foundRate;
};

interface Prepayment {
  month: number;
  amount: number;
}

interface ScheduleRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  extra: number;
  balance: number;
}

const generateSchedule = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  prepayments: Prepayment[] = []
): ScheduleRow[] => {
  const schedule: ScheduleRow[] = [];
  let balance = principal;
  const r = annualRate / 100 / 12;
  let monthlyPayment = calculatePMT(principal, annualRate, totalMonths);

  const prepayMap: Record<number, number> = prepayments.reduce(
    (acc, curr) => {
      acc[curr.month] = (acc[curr.month] || 0) + curr.amount;
      return acc;
    },
    {} as Record<number, number>
  );

  let currentMonth = 1;
  while (balance > 0.01 && currentMonth <= totalMonths * 2) {
    const interest = balance * r;
    let principalPayment = monthlyPayment - interest;

    if (balance < principalPayment) {
      principalPayment = balance;
      monthlyPayment = interest + principalPayment;
    }

    const extraPayment = prepayMap[currentMonth] || 0;
    const totalPrincipalPaid = principalPayment + extraPayment;
    const endBalance = balance - totalPrincipalPaid;

    schedule.push({
      month: currentMonth,
      payment: monthlyPayment,
      interest,
      principal: principalPayment,
      extra: extraPayment,
      balance: endBalance < 0 ? 0 : endBalance,
    });

    balance = endBalance;
    if (balance <= 0) break;
    currentMonth++;
  }

  return schedule;
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('calculatePMT', () => {
  it('returns principal/months when rate is 0%', () => {
    expect(calculatePMT(12000, 0, 12)).toBeCloseTo(1000, 2);
  });

  it('returns a higher payment when there is interest', () => {
    const noInterest = calculatePMT(12000, 0, 12);
    const withInterest = calculatePMT(12000, 12, 12);
    expect(withInterest).toBeGreaterThan(noInterest);
  });

  it('calculates a known PMT value (12 000 @ 12% / 12 months)', () => {
    // Verified with Google Sheets PMT(1%,12,-12000)
    expect(calculatePMT(12000, 12, 12)).toBeCloseTo(1066.19, 2);
  });

  it('calculates a known PMT value (10 000 @ 18% / 24 months)', () => {
    // PMT(1.5%,24,-10000) ≈ 499.24
    expect(calculatePMT(10000, 18, 24)).toBeCloseTo(499.24, 2);
  });

  it('returns a lower payment for a longer term at the same rate', () => {
    const short = calculatePMT(50000, 12, 12);
    const long = calculatePMT(50000, 12, 60);
    expect(long).toBeLessThan(short);
  });

  it('returns a higher payment for a higher rate with same term', () => {
    const low = calculatePMT(10000, 5, 12);
    const high = calculatePMT(10000, 24, 12);
    expect(high).toBeGreaterThan(low);
  });

  it('payment is always positive for positive inputs', () => {
    expect(calculatePMT(5000, 10, 6)).toBeGreaterThan(0);
  });

  it('handles a very small rate (0.01%)', () => {
    const pmt = calculatePMT(12000, 0.01, 12);
    expect(pmt).toBeCloseTo(1000.05, 1);
  });
});

describe('findRate', () => {
  it('returns 0 when the payment covers only principal (no interest)', () => {
    const rate = findRate(12000, 12, 1000); // exactly principal/months
    expect(rate).toBe(0);
  });

  it('returns 0 when the payment is below principal/months', () => {
    const rate = findRate(12000, 12, 500); // below the minimum possible
    expect(rate).toBe(0);
  });

  it('recovers a known annual rate from a PMT value', () => {
    const knownRate = 12; // %
    const pmt = calculatePMT(12000, knownRate, 12);
    const recovered = findRate(12000, 12, pmt);
    expect(recovered).toBeCloseTo(knownRate, 2);
  });

  it('recovers 18% annual rate correctly', () => {
    const pmt = calculatePMT(10000, 18, 24);
    const recovered = findRate(10000, 24, pmt);
    expect(recovered).toBeCloseTo(18, 2);
  });

  it('produces a higher rate for a higher target payment', () => {
    const lowPayment = calculatePMT(10000, 10, 12);
    const highPayment = calculatePMT(10000, 30, 12);
    const lowRate = findRate(10000, 12, lowPayment);
    const highRate = findRate(10000, 12, highPayment);
    expect(highRate).toBeGreaterThan(lowRate);
  });

  it('does not return a negative rate', () => {
    const pmt = calculatePMT(5000, 6, 6);
    const rate = findRate(5000, 6, pmt);
    expect(rate).toBeGreaterThanOrEqual(0);
  });
});

describe('generateSchedule', () => {
  describe('basic schedule (no prepayments)', () => {
    it('generates exactly N rows for N months', () => {
      const schedule = generateSchedule(12000, 12, 12);
      expect(schedule).toHaveLength(12);
    });

    it('first row has month = 1', () => {
      const schedule = generateSchedule(10000, 10, 6);
      expect(schedule[0].month).toBe(1);
    });

    it('last row balance is 0 (or near 0)', () => {
      const schedule = generateSchedule(12000, 12, 12);
      const last = schedule[schedule.length - 1];
      expect(last.balance).toBeCloseTo(0, 1);
    });

    it('interest portion decreases over time', () => {
      const schedule = generateSchedule(10000, 12, 12);
      expect(schedule[0].interest).toBeGreaterThan(
        schedule[schedule.length - 1].interest
      );
    });

    it('principal portion increases over time', () => {
      const schedule = generateSchedule(10000, 12, 12);
      expect(schedule[schedule.length - 1].principal).toBeGreaterThan(
        schedule[0].principal
      );
    });

    it('every row has extra = 0 when no prepayments', () => {
      const schedule = generateSchedule(12000, 12, 12);
      schedule.forEach((row) => expect(row.extra).toBe(0));
    });

    it('running sum of principal + extra ≈ original principal', () => {
      const principal = 10000;
      const schedule = generateSchedule(principal, 12, 12);
      const totalPrincipal = schedule.reduce(
        (sum, row) => sum + row.principal + row.extra,
        0
      );
      expect(totalPrincipal).toBeCloseTo(principal, 1);
    });

    it('handles 0% rate: all rows have interest = 0', () => {
      const schedule = generateSchedule(12000, 0, 12);
      schedule.forEach((row) => expect(row.interest).toBeCloseTo(0, 6));
    });

    it('handles 0% rate: payment equals principal/months', () => {
      const schedule = generateSchedule(12000, 0, 12);
      schedule.forEach((row) => expect(row.payment).toBeCloseTo(1000, 2));
    });

    it('balance never goes negative', () => {
      const schedule = generateSchedule(10000, 15, 24);
      schedule.forEach((row) => expect(row.balance).toBeGreaterThanOrEqual(0));
    });
  });

  describe('schedule with prepayments', () => {
    it('finishes in fewer months when a prepayment is applied', () => {
      const baseline = generateSchedule(10000, 12, 12);
      const withExtra = generateSchedule(10000, 12, 12, [
        { month: 1, amount: 2000 },
      ]);
      expect(withExtra.length).toBeLessThan(baseline.length);
    });

    it('records the correct extra amount on the prepayment row', () => {
      const schedule = generateSchedule(10000, 12, 12, [
        { month: 3, amount: 1500 },
      ]);
      const row3 = schedule.find((r) => r.month === 3);
      expect(row3?.extra).toBe(1500);
    });

    it('rows that are not prepayment months have extra = 0', () => {
      const schedule = generateSchedule(10000, 12, 12, [
        { month: 2, amount: 500 },
      ]);
      const notPrepayRows = schedule.filter((r) => r.month !== 2);
      notPrepayRows.forEach((row) => expect(row.extra).toBe(0));
    });

    it('multiple prepayments in the same month are summed', () => {
      const schedule = generateSchedule(10000, 12, 12, [
        { month: 1, amount: 1000 },
        { month: 1, amount: 500 },
      ]);
      expect(schedule[0].extra).toBe(1500);
    });

    it('a prepayment that covers the full remaining balance ends the schedule', () => {
      const schedule = generateSchedule(10000, 12, 12, [
        { month: 1, amount: 9999 }, // near-full payoff in month 1
      ]);
      expect(schedule.length).toBe(1);
      expect(schedule[0].balance).toBeCloseTo(0, 0);
    });

    it('total principal repaid still equals original principal with prepayments', () => {
      const principal = 10000;
      const schedule = generateSchedule(principal, 12, 12, [
        { month: 3, amount: 2000 },
      ]);
      const totalPrincipal = schedule.reduce(
        (sum, row) => sum + row.principal + row.extra,
        0
      );
      expect(totalPrincipal).toBeCloseTo(principal, 1);
    });

    it('does not generate rows past the loan term (safety limit)', () => {
      const schedule = generateSchedule(10000, 1, 6); // very low rate
      expect(schedule.length).toBeLessThanOrEqual(12); // totalMonths * 2 safety ceiling
    });
  });

  describe('edge cases', () => {
    it('handles a single-month loan', () => {
      const schedule = generateSchedule(1000, 12, 1);
      expect(schedule).toHaveLength(1);
      expect(schedule[0].balance).toBeCloseTo(0, 1);
    });

    it('handles a very large principal', () => {
      const schedule = generateSchedule(1_000_000, 8, 360);
      expect(schedule).toHaveLength(360);
      expect(schedule[0].interest).toBeGreaterThan(0);
    });

    it('handles a very small principal', () => {
      const schedule = generateSchedule(100, 24, 6);
      expect(schedule.length).toBeGreaterThan(0);
      expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 0);
    });
  });
});

describe('Integration: findRate → calculatePMT → generateSchedule', () => {
  it('recovering the rate from a payment produces the same schedule length', () => {
    const principal = 15000;
    const originalRate = 20;
    const term = 18;

    const pmt = calculatePMT(principal, originalRate, term);
    const recoveredRate = findRate(principal, term, pmt);
    const schedule = generateSchedule(principal, recoveredRate, term);

    expect(schedule).toHaveLength(term);
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 0);
  });

  it('a prepayment in month 1 using the recovered rate still zeroes the balance', () => {
    const principal = 10000;
    const rate = 15;
    const term = 12;

    const pmt = calculatePMT(principal, rate, term);
    const recovered = findRate(principal, term, pmt);
    const schedule = generateSchedule(principal, recovered, term, [
      { month: 1, amount: 3000 },
    ]);

    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 0);
  });
});
