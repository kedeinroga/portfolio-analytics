import { Room, ServiceType, SplitInput, SplitMethod } from './domain';
import { copy } from './copy.es';
import { parseNumber, toCents } from './format';

/** What the user types: raw text, so we never fight the keyboard. */
export interface RoomForm {
  id: string;
  name: string;
  previous: string;
  current: string;
  participates: boolean;
}

export interface SplitForm {
  service?: ServiceType;
  total: string;
  mainMeter: string;
  method: SplitMethod;
  rooms: RoomForm[];
  /** Internet only. */
  includeOwner: boolean;
}

/** A form field whose text is not a number. */
export interface FormError {
  field: 'total' | 'mainMeter' | 'previous' | 'current';
  message: string;
}

let idCounter = 0;
export const newId = (): string => `r${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export const emptyRoom = (position: number): RoomForm => ({
  id: newId(),
  name: copy.defaultRoomName(position),
  previous: '',
  current: '',
  participates: true,
});

export const initialForm = (): SplitForm => ({
  total: '',
  mainMeter: '',
  method: 'OWN_CONSUMPTION',
  rooms: [emptyRoom(1), emptyRoom(2)],
  includeOwner: false,
});

/**
 * Turns the typed text into a domain SplitInput. `errors` lists the fields that
 * are not numbers; the domain validates everything else.
 */
export function formToInput(form: SplitForm): { input: SplitInput; errors: FormError[] } {
  const errors: FormError[] = [];
  const service = form.service ?? 'electricity';
  const isMetered = service !== 'internet';

  const total = parseNumber(form.total);
  if (form.total.trim() && total === undefined) {
    errors.push({ field: 'total', message: copy.formErrors.unreadableTotal(form.total) });
  }

  let mainMeterConsumption: number | undefined;
  if (isMetered && form.mainMeter.trim()) {
    mainMeterConsumption = parseNumber(form.mainMeter);
    if (mainMeterConsumption === undefined) {
      errors.push({ field: 'mainMeter', message: copy.formErrors.unreadableMainMeter(form.mainMeter) });
    }
  }

  const rooms: Room[] = form.rooms.map((roomForm, index) => {
    const room: Room = { id: roomForm.id, name: roomForm.name, participates: roomForm.participates };
    if (!isMetered) return room;

    const label = roomForm.name.trim() || copy.defaultRoomName(index + 1);
    const previousReading = parseNumber(roomForm.previous);
    const currentReading = parseNumber(roomForm.current);
    if (roomForm.previous.trim() && previousReading === undefined) {
      errors.push({ field: 'previous', message: copy.formErrors.unreadablePrevious(roomForm.previous, label) });
    }
    if (roomForm.current.trim() && currentReading === undefined) {
      errors.push({ field: 'current', message: copy.formErrors.unreadableCurrent(roomForm.current, label) });
    }
    return { ...room, previousReading, currentReading };
  });

  return {
    errors,
    input: {
      service,
      totalCents: total === undefined ? 0 : toCents(total),
      mainMeterConsumption,
      // Without the main meter the only possible method is to split the whole bill.
      method: isMetered && mainMeterConsumption !== undefined ? form.method : 'SPLIT_ALL',
      rooms,
      includeOwner: !isMetered && form.includeOwner,
    },
  };
}
