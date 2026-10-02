import { render, screen, fireEvent, within } from '@testing-library/react';
import { BillSplitApp } from '../bill-split-app';

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const typeInto = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value: value } });

describe('bill split wizard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = jest.fn(); // not implemented in jsdom
  });

  it('golden case end to end (electricity, OWN_CONSUMPTION)', () => {
    render(<BillSplitApp />);
    click('Empezar');
    expect(screen.getByText('Paso 1 de 5')).toBeInTheDocument();
    click(/^Luz/);
    typeInto(/Total a pagar/, '400');
    typeInto(/medidor general/, '320');
    click('Siguiente');

    // 4 cuartos: ya hay 2, agregar 2 más
    click('Agregar otro cuarto');
    click('Agregar otro cuarto');
    const readings = [
      [1200, 1290],
      [800, 860],
      [500, 590],
      [300, 345],
    ];
    const ant = screen.getAllByLabelText('Lectura anterior');
    const act = screen.getAllByLabelText('Lectura actual');
    readings.forEach(([a, b], i) => {
      fireEvent.change(ant[i], { target: { value: String(a) } });
      fireEvent.change(act[i], { target: { value: String(b) } });
    });
    click('Siguiente');
    expect(screen.getByText('Revisa los datos')).toBeInTheDocument();
    click('Calcular');

    expect(screen.getAllByText('S/ 112.50').length).toBe(2);
    expect(screen.getByText('S/ 75.00')).toBeInTheDocument();
    expect(screen.getByText('S/ 56.25')).toBeInTheDocument();
    const resumen = screen.getByText('Resumen').parentElement as HTMLElement;
    expect(within(resumen).getByText('S/ 43.75')).toBeInTheDocument();

    const wa = screen.getByRole('link', { name: /Cuarto 1 por WhatsApp/ });
    expect(wa.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\?text=Hola%20Cuarto%201/);
  });

  it('shows a friendly error when the current reading is lower', () => {
    render(<BillSplitApp />);
    click('Empezar');
    click(/^Luz/);
    typeInto(/Total a pagar/, '100');
    click('Siguiente');
    const ant = screen.getAllByLabelText('Lectura anterior');
    const act = screen.getAllByLabelText('Lectura actual');
    fireEvent.change(ant[0], { target: { value: '90' } });
    fireEvent.change(act[0], { target: { value: '80' } });
    fireEvent.change(ant[1], { target: { value: '10' } });
    fireEvent.change(act[1], { target: { value: '20' } });
    click('Siguiente');
    expect(screen.getByRole('alert')).toHaveTextContent('La lectura actual (80)');
    expect(screen.getByRole('alert')).toHaveTextContent('menor que la anterior (90)');
  });

  it('works with localStorage blocked', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    render(<BillSplitApp />);
    expect(screen.getByText('Reparte el recibo entre tus inquilinos')).toBeInTheDocument();
    click('Empezar');
    click(/Internet/);
    typeInto(/Total a pagar/, '90');
    click('Siguiente');
    click('Siguiente');
    click('Calcular');
    expect(screen.getAllByText('S/ 45.00').length).toBe(2);
    jest.restoreAllMocks();
  });
});
