import { SplitForm, initialForm } from './form';

// Bump the version when the stored shape changes so old copies are ignored.
const STORAGE_KEY = 'bill-split:last-calculation:v2';

/**
 * localStorage can be blocked, full or missing: every access is wrapped in
 * try/catch and the app keeps working without saving.
 * Only room names, readings and amounts are stored; nothing personal.
 */
export function saveForm(form: SplitForm): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    return true;
  } catch {
    return false;
  }
}

export function loadForm(): SplitForm | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<SplitForm>;
    if (!Array.isArray(stored?.rooms) || stored.rooms.length === 0) return null;
    return { ...initialForm(), ...stored };
  } catch {
    return null;
  }
}

export function clearForm(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}
