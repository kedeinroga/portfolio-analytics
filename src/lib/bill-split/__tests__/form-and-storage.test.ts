import { calculateSplit } from '../domain';
import { formToInput, initialForm } from '../form';
import { clearForm, loadForm, saveForm } from '../storage';
import { validateStep } from '../step-validation';
import { amountsOf } from '../test-fixtures';

describe('formToInput', () => {
  it('without the main meter it falls back to SPLIT_ALL', () => {
    const form = initialForm();
    form.service = 'electricity';
    form.total = '400,00';
    form.rooms[0] = { ...form.rooms[0], previous: '10', current: '20' };
    form.rooms[1] = { ...form.rooms[1], previous: '5', current: '10' };
    const { input, errors } = formToInput(form);
    expect(errors).toEqual([]);
    expect(input.totalCents).toBe(40000);
    expect(input.method).toBe('SPLIT_ALL');
    expect(amountsOf(calculateSplit(input))).toEqual([26667, 13333]);
  });

  it('reports non-numeric text with the offending field', () => {
    const form = initialForm();
    form.total = 'doscientos';
    const { errors } = formToInput(form);
    expect(errors[0].field).toBe('total');
    expect(errors[0].message).toMatch(/No entendimos el total/);
  });
});

describe('validateStep', () => {
  it('bill step asks for the total', () => {
    expect(validateStep('bill', initialForm())[0]).toMatch(/Escribe el total a pagar/);
  });

  it('bill step ignores room readings', () => {
    const form = { ...initialForm(), service: 'electricity' as const, total: '100' };
    expect(validateStep('bill', form)).toEqual([]);
  });

  it('rooms step reports unreadable text before domain errors', () => {
    const form = initialForm();
    form.service = 'electricity';
    form.total = '100';
    form.rooms[0] = { ...form.rooms[0], previous: 'x', current: '5' };
    expect(validateStep('rooms', form)[0]).toMatch(/No entendimos la lectura anterior/);
  });

  it('rooms step surfaces domain errors', () => {
    const form = initialForm();
    form.service = 'electricity';
    form.total = '100';
    form.rooms[0] = { ...form.rooms[0], previous: '90', current: '80' };
    form.rooms[1] = { ...form.rooms[1], previous: '10', current: '20' };
    expect(validateStep('rooms', form).join(' ')).toMatch(/La lectura actual \(80\)/);
  });
});

describe('storage', () => {
  beforeEach(() => window.localStorage.clear());

  it('keeps working when localStorage throws', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(saveForm(initialForm())).toBe(false);
    expect(loadForm()).toBeNull();
    expect(() => clearForm()).not.toThrow();
    setItem.mockRestore();
    getItem.mockRestore();
  });

  it('saves and restores, filling fields missing from older copies', () => {
    const form = initialForm();
    form.total = '123';
    expect(saveForm(form)).toBe(true);
    expect(loadForm()?.total).toBe('123');

    window.localStorage.setItem('bill-split:last-calculation:v2', JSON.stringify({ total: '9', rooms: form.rooms }));
    expect(loadForm()?.includeOwner).toBe(false);
  });

  it('ignores corrupt data', () => {
    window.localStorage.setItem('bill-split:last-calculation:v2', '{not json');
    expect(loadForm()).toBeNull();
  });
});
