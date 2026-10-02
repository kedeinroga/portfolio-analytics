/**
 * Pure domain logic for splitting a utility bill. It knows nothing about the
 * DOM or localStorage.
 *
 * Money is always handled in cents (integers). Readings and consumptions are
 * converted to integer thousandths and divisions use BigInt, so results are
 * exact and the amounts add up to the bill total to the cent.
 *
 * Cent-adjustment tie-break (SPLIT_ALL method and internet): largest
 * remainder. Leftover cents go to the rooms with the largest remainder; when
 * two remainders are equal, the room listed first gets the cent.
 */

import { copy } from './copy.es';
import { formatQuantity } from './format';

export type ServiceType = 'electricity' | 'water' | 'internet';

/**
 * OWN_CONSUMPTION: each tenant pays what they consumed; the owner absorbs the
 * difference (common areas and losses). Needs the main meter consumption.
 * SPLIT_ALL: the whole bill is split in proportion to each room's consumption.
 */
export type SplitMethod = 'OWN_CONSUMPTION' | 'SPLIT_ALL';

export interface Room {
  id: string;
  name: string;
  previousReading?: number;
  currentReading?: number;
  /** Internet only: whether the room takes part in the payment. */
  participates: boolean;
}

export interface SplitInput {
  service: ServiceType;
  totalCents: number;
  /** Consumption shown on the bill's main meter (kWh or m³). */
  mainMeterConsumption?: number;
  method: SplitMethod;
  rooms: Room[];
  /** Internet only: the owner also pays one share, equal to a room's. */
  includeOwner?: boolean;
}

export interface ResultLine {
  roomId: string;
  consumption?: number;
  amountCents: number;
}

export interface SplitResult {
  lines: ResultLine[];
  totalChargedCents: number;
  /** What the owner absorbs. Negative when tenants were charged more than the bill. */
  ownerDifferenceCents: number;
  /** Soles per unit (kWh or m³). OWN_CONSUMPTION only. */
  unitPrice?: number;
  warnings: string[];
}

export class SplitError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join(' '));
    this.name = 'SplitError';
  }
}

/** Minimum rooms to split the whole bill; OWN_CONSUMPTION and internet work with 1. */
export const MIN_ROOMS_SPLIT_ALL = 2;
export const MAX_ROOMS = 20;

const THOUSANDTHS = 1000;
const OWNER_DIFFERENCE_MARGIN = 0.1;

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const unitOf = (service: ServiceType): 'kWh' | 'm³' | '' =>
  service === 'electricity' ? 'kWh' : service === 'water' ? 'm³' : '';

const roomLabel = (room: Room, index: number): string => room.name.trim() || copy.defaultRoomName(index + 1);

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** Integer thousandths: avoids binary floating-point noise when subtracting readings. */
const toThousandths = (value: number): bigint => BigInt(Math.round(value * THOUSANDTHS));

/** Units consumed by a room, rounded to thousandths. */
export const consumptionOf = (room: Room): number =>
  Number(toThousandths(room.currentReading ?? 0) - toThousandths(room.previousReading ?? 0)) / THOUSANDTHS;

const sumBigInt = (values: bigint[]): bigint => values.reduce((sum, value) => sum + value, ZERO);

/** Integer division rounded to nearest, halves up. */
const divideRounded = (numerator: bigint, denominator: bigint): bigint =>
  (TWO * numerator + denominator) / (TWO * denominator);

/**
 * Share of the bill the owner may absorb before it looks suspicious.
 * With n tenants the owner is "one more" among n + 1 users (their own use and
 * the common areas), so they would bear 1/(n + 1), plus a 10% margin.
 * 1 tenant: 60%, 4 tenants: 30%, 9 tenants: 20%.
 */
export const ownerDifferenceThreshold = (tenants: number): number =>
  1 / (Math.max(tenants, 1) + 1) + OWNER_DIFFERENCE_MARGIN;

// ─── Validation ──────────────────────────────────────────────────────────────

const validateTotal = ({ totalCents }: SplitInput): string[] =>
  isNumber(totalCents) && totalCents > 0 ? [] : [copy.errors.totalNotPositive];

const validateRoomList = ({ rooms, service, method }: SplitInput): string[] => {
  const errors: string[] = [];
  if (rooms.length < 1) {
    errors.push(copy.errors.noRooms);
  } else if (service !== 'internet' && method === 'SPLIT_ALL' && rooms.length < MIN_ROOMS_SPLIT_ALL) {
    errors.push(copy.errors.splitAllNeedsTwoRooms);
  }
  if (rooms.length > MAX_ROOMS) errors.push(copy.errors.tooManyRooms(MAX_ROOMS));

  rooms.forEach((room, index) => {
    if (!room.name.trim()) errors.push(copy.errors.roomNameMissing(index + 1));
  });
  return errors;
};

const validateParticipants = ({ rooms }: SplitInput): string[] =>
  rooms.length > 0 && !rooms.some((room) => room.participates) ? [copy.errors.noParticipants] : [];

const validateReadings = ({ rooms }: SplitInput): string[] => {
  const errors: string[] = [];
  rooms.forEach((room, index) => {
    const label = roomLabel(room, index);
    const { previousReading: previous, currentReading: current } = room;
    if (!isNumber(previous) || !isNumber(current)) {
      errors.push(copy.errors.missingReadings(label));
    } else if (previous < 0 || current < 0) {
      errors.push(copy.errors.negativeReadings(label));
    } else if (current < previous) {
      errors.push(copy.errors.currentBelowPrevious(label, current, previous));
    }
  });
  return errors;
};

const validateMainMeter = ({ mainMeterConsumption, method, service }: SplitInput): string[] => {
  const errors: string[] = [];
  if (mainMeterConsumption !== undefined && (!isNumber(mainMeterConsumption) || mainMeterConsumption <= 0)) {
    errors.push(copy.errors.mainMeterNotPositive(unitOf(service)));
  }
  if (method === 'OWN_CONSUMPTION' && mainMeterConsumption === undefined) {
    errors.push(copy.errors.ownConsumptionNeedsMainMeter);
  }
  return errors;
};

const validateSomeConsumption = ({ rooms, method }: SplitInput): string[] => {
  if (method !== 'SPLIT_ALL') return [];
  const total = sumBigInt(rooms.map((room) => toThousandths(consumptionOf(room))));
  return total === ZERO ? [copy.errors.noConsumption] : [];
};

/** Returns user-facing error messages; an empty list means the input is valid. */
export function validateInput(input: SplitInput): string[] {
  const errors = [...validateTotal(input), ...validateRoomList(input)];

  if (input.service === 'internet') return [...errors, ...validateParticipants(input)];

  errors.push(...validateReadings(input), ...validateMainMeter(input));
  // Consumption can only be summed once readings are known to be valid.
  if (errors.length === 0) errors.push(...validateSomeConsumption(input));
  return errors;
}

// ─── Calculation ─────────────────────────────────────────────────────────────

/**
 * Splits `totalCents` in proportion to `weights` (non-negative integers) using
 * the largest remainder method. The returned amounts add up to exactly `totalCents`.
 */
export function distributeProportionally(totalCents: number, weights: bigint[]): number[] {
  const total = BigInt(totalCents);
  const weightSum = sumBigInt(weights);
  if (weightSum === ZERO) throw new SplitError([copy.errors.nothingToSplit]);

  const floors = weights.map((weight) => (total * weight) / weightSum);
  const remainders = weights.map((weight) => (total * weight) % weightSum);
  let leftoverCents = Number(total - sumBigInt(floors));

  const byRemainderDesc = weights
    .map((_, index) => index)
    .sort((a, b) => {
      if (remainders[a] === remainders[b]) return a - b;
      return remainders[a] > remainders[b] ? -1 : 1;
    });

  const amounts = floors.map(Number);
  for (const index of byRemainderDesc) {
    if (leftoverCents <= 0) break;
    amounts[index] += 1;
    leftoverCents -= 1;
  }
  return amounts;
}

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

function splitEqually(input: SplitInput): SplitResult {
  const { rooms, totalCents } = input;
  const weights = rooms.map((room) => (room.participates ? ONE : ZERO));
  // The owner goes last: on a cent tie the first room wins, not the owner.
  if (input.includeOwner) weights.push(ONE);

  const amounts = distributeProportionally(totalCents, weights);
  const charged = sum(amounts.slice(0, rooms.length));
  return {
    lines: rooms.map((room, index) => ({ roomId: room.id, amountCents: amounts[index] })),
    totalChargedCents: charged,
    ownerDifferenceCents: totalCents - charged,
    warnings: [],
  };
}

interface Charges {
  amounts: number[];
  unitPrice?: number;
  warnings: string[];
}

function chargeOwnConsumption(input: SplitInput, consumptions: bigint[]): Charges {
  const mainMeter = input.mainMeterConsumption;
  if (mainMeter === undefined) throw new SplitError([copy.errors.ownConsumptionNeedsMainMeter]);

  const mainMeterThousandths = toThousandths(mainMeter);
  const total = BigInt(input.totalCents);
  const warnings: string[] = [];

  const roomsSum = sumBigInt(consumptions);
  if (roomsSum > mainMeterThousandths) {
    warnings.push(
      copy.warnings.roomsExceedMainMeter(
        formatQuantity(Number(roomsSum) / THOUSANDTHS),
        formatQuantity(mainMeter),
        unitOf(input.service),
      ),
    );
  }
  return {
    amounts: consumptions.map((consumption) => Number(divideRounded(total * consumption, mainMeterThousandths))),
    unitPrice: input.totalCents / 100 / mainMeter,
    warnings,
  };
}

function splitByConsumption(input: SplitInput): SplitResult {
  const { rooms, totalCents } = input;
  const consumptions = rooms.map(consumptionOf);
  const thousandths = consumptions.map(toThousandths);

  const { amounts, unitPrice, warnings } =
    input.method === 'OWN_CONSUMPTION'
      ? chargeOwnConsumption(input, thousandths)
      : { amounts: distributeProportionally(totalCents, thousandths), unitPrice: undefined, warnings: [] };

  const charged = sum(amounts);
  const ownerDifference = totalCents - charged;

  const threshold = ownerDifferenceThreshold(rooms.length);
  if (Math.abs(ownerDifference) > totalCents * threshold) {
    warnings.push(copy.warnings.ownerDifferenceTooHigh(Math.round(threshold * 100), rooms.length));
  }

  return {
    lines: rooms.map((room, index) => ({
      roomId: room.id,
      consumption: consumptions[index],
      amountCents: amounts[index],
    })),
    totalChargedCents: charged,
    ownerDifferenceCents: ownerDifference,
    unitPrice,
    warnings,
  };
}

/** Validates the input and computes what each room pays. Throws SplitError if invalid. */
export function calculateSplit(input: SplitInput): SplitResult {
  const errors = validateInput(input);
  if (errors.length > 0) throw new SplitError(errors);

  return input.service === 'internet' ? splitEqually(input) : splitByConsumption(input);
}
