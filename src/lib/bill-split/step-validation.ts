import { unitOf, validateInput } from './domain';
import { copy } from './copy.es';
import { SplitForm, formToInput } from './form';
import { parseNumber } from './format';

/** The wizard steps that validate before letting the user move on. */
export type ValidatedStep = 'bill' | 'rooms';

/** User-facing errors that block moving forward from `step`. Empty means OK. */
export function validateStep(step: ValidatedStep, form: SplitForm): string[] {
  const { input, errors: formErrors } = formToInput(form);

  if (step === 'bill') {
    const errors = formErrors.filter(({ field }) => field === 'total' || field === 'mainMeter').map(({ message }) => message);
    if (!form.total.trim()) {
      errors.push(copy.formErrors.totalRequired);
    } else if (parseNumber(form.total) !== undefined && input.totalCents <= 0) {
      errors.push(copy.errors.totalNotPositive);
    }
    if (form.mainMeter.trim() && parseNumber(form.mainMeter) === 0) {
      errors.push(copy.errors.mainMeterNotPositive(unitOf(input.service)));
    }
    return errors;
  }

  // Domain validation only makes sense once every typed value is a number.
  if (formErrors.length > 0) return formErrors.map(({ message }) => message);
  return validateInput(input);
}
