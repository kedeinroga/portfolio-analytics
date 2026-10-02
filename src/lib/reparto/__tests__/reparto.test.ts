import {
  calcularReparto,
  validarEntrada,
  repartirProporcional,
  RepartoError,
  umbralDiferencia,
  Entrada,
  Cuarto,
} from '../dominio';
import { parseNumero, formatoSoles, formatoFecha } from '../formato';
import { explicarCalculo, mensajeWhatsApp, textoGeneral, urlWhatsApp } from '../texto';
import { entradaDesdeFormulario, formularioInicial } from '../formulario';
import { guardarFormulario, leerFormulario } from '../almacenamiento';

const cuarto = (id: string, ant: number, act: number): Cuarto => ({
  id,
  nombre: `Cuarto ${id}`,
  lecturaAnterior: ant,
  lecturaActual: act,
  participa: true,
});

const dorado = (metodo: Entrada['metodo'], principal: number | null = 320): Entrada => ({
  servicio: 'luz',
  totalCentimos: 40000,
  consumoPrincipal: principal ?? undefined,
  metodo,
  cuartos: [cuarto('A', 1200, 1290), cuarto('B', 800, 860), cuarto('C', 500, 590), cuarto('D', 300, 345)],
});

const montos = (e: Entrada) => calcularReparto(e).lineas.map((l) => l.montoCentimos);
const suma = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

describe('caso dorado', () => {
  it('Método A: S/ 1.25 por kWh y el propietario asume 43.75', () => {
    const r = calcularReparto(dorado('A_consumo_propio'));
    expect(r.lineas.map((l) => l.montoCentimos)).toEqual([11250, 7500, 11250, 5625]);
    expect(r.lineas.map((l) => l.consumo)).toEqual([90, 60, 90, 45]);
    expect(r.precioUnitario).toBe(1.25);
    expect(r.totalCobradoCentimos).toBe(35625);
    expect(r.diferenciaPropietarioCentimos).toBe(4375);
    expect(r.avisos).toEqual([]);
  });

  it('Método B: suma exactamente 400.00 y regla de desempate (primero de la lista)', () => {
    const r = calcularReparto(dorado('B_repartir_todo'));
    // Exactos: 126.3158, 84.2105, 126.3158, 63.1579. Quedan 2 céntimos:
    // D (residuo .79) y luego A (empata con C en .58, gana el primero).
    expect(r.lineas.map((l) => l.montoCentimos)).toEqual([12632, 8421, 12631, 6316]);
    expect(suma(r.lineas.map((l) => l.montoCentimos))).toBe(40000);
    expect(r.totalCobradoCentimos).toBe(40000);
    expect(r.diferenciaPropietarioCentimos).toBe(0);
    expect(r.precioUnitario).toBeUndefined();
  });

  it('Método B no necesita el medidor general', () => {
    expect(suma(montos(dorado('B_repartir_todo', null)))).toBe(40000);
  });
});

describe('redondeo', () => {
  it('la suma siempre es exacta para varios totales y consumos', () => {
    for (const total of [1, 2, 3, 100, 9999, 123457, 1000001]) {
      for (const consumos of [[1, 1, 1], [7, 13, 29], [0.5, 0.25, 0.125, 3], [1, 0, 2]]) {
        let ant = 0;
        const cuartos = consumos.map((c, i) => cuarto(String(i), (ant += 10), ant + c));
        const m = montos({ servicio: 'agua', totalCentimos: total, metodo: 'B_repartir_todo', cuartos });
        expect(suma(m)).toBe(total);
        m.forEach((x) => expect(x).toBeGreaterThanOrEqual(0));
      }
    }
  });

  it('un cuarto sin consumo paga 0 en el Método B', () => {
    const e = dorado('B_repartir_todo');
    e.cuartos[3] = cuarto('D', 300, 300);
    expect(montos(e)[3]).toBe(0);
    expect(suma(montos(e))).toBe(40000);
  });

  it('desempate: con residuos iguales el céntimo va al primero', () => {
    expect(repartirProporcional(100, [BigInt(1), BigInt(1), BigInt(1)])).toEqual([34, 33, 33]);
    expect(repartirProporcional(101, [BigInt(1), BigInt(1), BigInt(1)])).toEqual([34, 34, 33]);
  });

  it('consumos decimales no acumulan error de coma flotante', () => {
    const e: Entrada = {
      servicio: 'agua',
      totalCentimos: 5000,
      metodo: 'B_repartir_todo',
      cuartos: [cuarto('A', 0.1, 0.3), cuarto('B', 0, 0.2)],
    };
    // 0.3 - 0.1 y 0.2 - 0 deben ser iguales: 25.00 cada uno
    expect(montos(e)).toEqual([2500, 2500]);
  });
});

describe('validaciones', () => {
  it('lectura actual menor que la anterior: mensaje específico', () => {
    const e = dorado('A_consumo_propio');
    e.cuartos[0] = cuarto('A', 90, 80);
    const errores = validarEntrada(e);
    expect(errores).toContain(
      'La lectura actual (80) de "Cuarto A" es menor que la anterior (90). Revisa que no se hayan intercambiado.',
    );
    expect(() => calcularReparto(e)).toThrow(RepartoError);
  });

  it('total <= 0', () => {
    const e = dorado('A_consumo_propio');
    e.totalCentimos = 0;
    expect(validarEntrada(e)[0]).toMatch(/mayor a S\/ 0/);
  });

  it('suma de consumos = 0 en Método B', () => {
    const e = dorado('B_repartir_todo');
    e.cuartos = e.cuartos.map((c) => ({ ...c, lecturaActual: c.lecturaAnterior }));
    expect(validarEntrada(e).join(' ')).toMatch(/Ningún cuarto tiene consumo/);
    expect(() => calcularReparto(e)).toThrow(RepartoError);
  });

  it('lecturas vacías', () => {
    const e = dorado('B_repartir_todo');
    e.cuartos[1] = { ...e.cuartos[1], lecturaActual: undefined };
    expect(validarEntrada(e).join(' ')).toMatch(/Falta la lectura/);
  });

  it('nombre vacío', () => {
    const e = dorado('B_repartir_todo');
    e.cuartos[0].nombre = '  ';
    expect(validarEntrada(e).join(' ')).toMatch(/Escribe un nombre/);
  });

  it('un solo cuarto no alcanza; más de 20 tampoco', () => {
    const e = dorado('B_repartir_todo');
    e.cuartos = [e.cuartos[0]];
    expect(validarEntrada(e).join(' ')).toMatch(/al menos 2 cuartos/);
    e.cuartos = Array.from({ length: 21 }, (_, i) => cuarto(String(i), 0, 1));
    expect(validarEntrada(e).join(' ')).toMatch(/máximo de 20/);
  });

  it('Método A sin medidor general', () => {
    expect(validarEntrada(dorado('A_consumo_propio', null)).join(' ')).toMatch(/medidor general/);
  });

  it('aviso (no bloquea) si los cuartos suman más que el medidor general', () => {
    const r = calcularReparto(dorado('A_consumo_propio', 200));
    expect(r.avisos.join(' ')).toMatch(/suman más/);
    expect(r.diferenciaPropietarioCentimos).toBeLessThan(0);
  });

  it('el umbral del aviso depende de la cantidad de inquilinos', () => {
    expect(umbralDiferencia(1)).toBeCloseTo(0.6);
    expect(umbralDiferencia(4)).toBeCloseTo(0.3);
    expect(umbralDiferencia(9)).toBeCloseTo(0.2);
  });

  it('aviso si el propietario asume más de lo esperable (4 inquilinos: 30%)', () => {
    const r = calcularReparto(dorado('A_consumo_propio', 600)); // asume ~52%
    expect(r.avisos.join(' ')).toMatch(/mayor al 30% .* 4 inquilinos/);
  });

  it('con 1 inquilino la misma diferencia relativa no avisa', () => {
    const e = { ...dorado('A_consumo_propio', 600), cuartos: [cuarto('A', 1200, 1500)] }; // 300 de 600 kWh: asume 50% < 60%
    expect(calcularReparto(e).avisos).toEqual([]);
  });

  it('los avisos no se cuelan en los textos para compartir', () => {
    const e = dorado('A_consumo_propio', 600);
    const r = calcularReparto(e);
    expect(r.avisos.length).toBeGreaterThan(0);
    const textos = [textoGeneral(e, r), ...e.cuartos.map((_, i) => mensajeWhatsApp(e, r, i))].join('\n');
    expect(textos).not.toMatch(/diferencia que asumes|Revisa que las lecturas/i);
  });
});

describe('internet', () => {
  const internet = (participan: boolean[], total = 10000): Entrada => ({
    servicio: 'internet',
    totalCentimos: total,
    metodo: 'B_repartir_todo',
    cuartos: participan.map((p, i) => ({ id: String(i), nombre: `C${i}`, participa: p })),
  });

  it('partes iguales con ajuste de céntimos', () => {
    expect(montos(internet([true, true, true]))).toEqual([3334, 3333, 3333]);
  });

  it('los cuartos que no participan pagan 0', () => {
    expect(montos(internet([true, false, true]))).toEqual([5000, 0, 5000]);
  });

  it('ningún participante: error', () => {
    expect(validarEntrada(internet([false, false])).join(' ')).toMatch(/al menos un cuarto/);
  });
});

describe('un solo cuarto', () => {
  const uno = (metodo: Entrada['metodo']): Entrada => ({
    ...dorado(metodo),
    cuartos: [cuarto('A', 1200, 1290)],
  });

  it('Método A con 1 inquilino: paga su consumo y el propietario asume el resto', () => {
    const r = calcularReparto(uno('A_consumo_propio'));
    expect(r.lineas.map((l) => l.montoCentimos)).toEqual([11250]);
    expect(r.diferenciaPropietarioCentimos).toBe(40000 - 11250);
  });

  it('Método B con 1 cuarto sigue pidiendo 2 y explica qué hacer', () => {
    const errores = validarEntrada(uno('B_repartir_todo')).join(' ');
    expect(errores).toMatch(/al menos 2 cuartos/);
    expect(errores).toMatch(/medidor general/);
  });

  it('sin cuartos: error', () => {
    const e = { ...dorado('A_consumo_propio'), cuartos: [] };
    expect(validarEntrada(e).join(' ')).toMatch(/al menos 1 cuarto/);
  });

  it('internet con 1 cuarto + propietario: mitad y mitad', () => {
    const e: Entrada = {
      servicio: 'internet',
      totalCentimos: 10001,
      metodo: 'B_repartir_todo',
      incluyePropietario: true,
      cuartos: [{ id: 'x', nombre: 'Juan', participa: true }],
    };
    const r = calcularReparto(e);
    expect(r.lineas[0].montoCentimos).toBe(5001); // el cuarto gana el céntimo del empate
    expect(r.diferenciaPropietarioCentimos).toBe(5000);
    expect(r.totalCobradoCentimos + r.diferenciaPropietarioCentimos).toBe(10001);
    expect(explicarCalculo(e, r, 0).join(' ')).toMatch(/2 personas/);
  });
});

describe('formato y entrada', () => {
  it('parseNumero acepta coma y punto', () => {
    expect(parseNumero('187,50')).toBe(187.5);
    expect(parseNumero('187.50')).toBe(187.5);
    expect(parseNumero('1,234.50')).toBe(1234.5);
    expect(parseNumero('1.234,50')).toBe(1234.5);
    expect(parseNumero('1,234,567')).toBe(1234567);
    expect(parseNumero(' S/ 400 ')).toBe(400);
    expect(parseNumero('')).toBeUndefined();
    expect(parseNumero('abc')).toBeUndefined();
    expect(parseNumero('-5')).toBeUndefined();
  });

  it('formato peruano', () => {
    expect(formatoSoles(123450)).toBe('S/ 1,234.50');
    expect(formatoSoles(5)).toBe('S/ 0.05');
    expect(formatoFecha(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  it('formulario → entrada; sin medidor general cae al Método B', () => {
    const f = formularioInicial();
    f.servicio = 'luz';
    f.total = '400,00';
    f.cuartos[0] = { ...f.cuartos[0], anterior: '10', actual: '20' };
    f.cuartos[1] = { ...f.cuartos[1], anterior: '5', actual: '10' };
    const { entrada, errores } = entradaDesdeFormulario(f);
    expect(errores).toEqual([]);
    expect(entrada.totalCentimos).toBe(40000);
    expect(entrada.metodo).toBe('B_repartir_todo');
    expect(montos(entrada)).toEqual([26667, 13333]);
  });

  it('formulario con texto no numérico da error amable', () => {
    const f = formularioInicial();
    f.total = 'doscientos';
    expect(entradaDesdeFormulario(f).errores[0]).toMatch(/No entendimos el total/);
  });
});

describe('textos', () => {
  it('WhatsApp usa la plantilla y el enlace codifica el texto', () => {
    const e = dorado('A_consumo_propio');
    const r = calcularReparto(e);
    const msg = mensajeWhatsApp(e, r, 0);
    expect(msg).toBe(
      [
        'Hola Cuarto A. Este mes de luz te corresponde pagar S/ 112.50.',
        'Tu consumo: 90 kWh (lectura 1200 a 1290).',
        'Total del recibo: S/ 400.00. Precio por kWh: S/ 1.2500.',
        'Cualquier duda, avísame.',
      ].join('\n'),
    );
    const url = urlWhatsApp(msg);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(msg);
  });

  it('la fórmula muestra los números reales', () => {
    const e = dorado('A_consumo_propio');
    const txt = explicarCalculo(e, calcularReparto(e), 0).join('\n');
    expect(txt).toContain('1290 − lectura anterior 1200 = 90 kWh');
    expect(txt).toContain('S/ 400.00 ÷ 320 kWh');
    expect(txt).toContain('= S/ 112.50');
  });

  it('la fórmula del Método B muestra total × consumo ÷ suma', () => {
    const e = dorado('B_repartir_todo');
    expect(explicarCalculo(e, calcularReparto(e), 1).join('\n')).toContain('S/ 400.00 × 60 ÷ 285 = S/ 84.21');
  });
});

describe('almacenamiento resiliente', () => {
  it('funciona si localStorage lanza errores', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(guardarFormulario(formularioInicial())).toBe(false);
    expect(leerFormulario()).toBeNull();
    spy.mockRestore();
    get.mockRestore();
  });

  it('guarda y recupera', () => {
    const f = formularioInicial();
    f.total = '123';
    expect(guardarFormulario(f)).toBe(true);
    expect(leerFormulario()?.total).toBe('123');
  });
});
