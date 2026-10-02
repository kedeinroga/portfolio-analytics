import { Room, SplitInput, SplitMethod } from './domain';

export const room = (id: string, previous: number, current: number): Room => ({
  id,
  name: `Cuarto ${id}`,
  previousReading: previous,
  currentReading: current,
  participates: true,
});

/** Golden case: electricity, S/ 400.00, main meter 320 kWh, rooms consuming 90 / 60 / 90 / 45. */
export const goldenInput = (method: SplitMethod, mainMeter: number | null = 320): SplitInput => ({
  service: 'electricity',
  totalCents: 40000,
  mainMeterConsumption: mainMeter ?? undefined,
  method,
  rooms: [room('A', 1200, 1290), room('B', 800, 860), room('C', 500, 590), room('D', 300, 345)],
});

export const internetInput = (participation: boolean[], totalCents = 10000, includeOwner = false): SplitInput => ({
  service: 'internet',
  totalCents,
  method: 'SPLIT_ALL',
  includeOwner,
  rooms: participation.map((participates, index) => ({ id: String(index), name: `C${index}`, participates })),
});

export const amountsOf = (result: { lines: { amountCents: number }[] }) => result.lines.map((line) => line.amountCents);
export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
