/**
 * Dominio puro del reparto de servicios. No conoce el DOM ni localStorage.
 *
 * Dinero: siempre en céntimos (enteros). Lecturas/consumos: se pasan a
 * milésimas enteras internamente y las divisiones usan BigInt, así el
 * resultado es exacto y la suma de montos coincide con el total al céntimo.
 *
 * Regla de desempate del ajuste de céntimos (Método B e internet):
 * método del mayor residuo. Los céntimos sobrantes van a los cuartos con mayor
 * residuo; si dos residuos son iguales, el cuarto que aparece primero en la
 * lista recibe el céntimo.
 */

export type Servicio = 'luz' | 'agua' | 'internet';
export type Metodo = 'A_consumo_propio' | 'B_repartir_todo';

export interface Cuarto {
  id: string;
  nombre: string;
  lecturaAnterior?: number;
  lecturaActual?: number;
  participa: boolean; // para internet
}

export interface Entrada {
  servicio: Servicio;
  totalCentimos: number;
  consumoPrincipal?: number;
  metodo: Metodo;
  cuartos: Cuarto[];
  /** Solo internet: el propietario también paga una parte igual a la de un cuarto. */
  incluyePropietario?: boolean;
}

export interface LineaResultado {
  cuartoId: string;
  consumo?: number;
  montoCentimos: number;
}

export interface Resultado {
  lineas: LineaResultado[];
  totalCobradoCentimos: number;
  diferenciaPropietarioCentimos: number;
  /** Soles por unidad (kWh o m³). Solo Método A. */
  precioUnitario?: number;
  avisos: string[];
}

/** Mínimo de cuartos para repartir todo el recibo (método B). Con el método A o internet basta 1. */
export const MIN_CUARTOS_REPARTIR_TODO = 2;
export const MAX_CUARTOS = 20;
const MARGEN_DIFERENCIA = 0.1;

/**
 * Fracción del recibo que el propietario puede asumir sin que sea raro.
 * Con n inquilinos, el propietario es "uno más" entre n + 1 que usan el
 * servicio (su propio uso y las áreas comunes), así que le toca 1/(n+1),
 * más un margen del 10%. Con 1 inquilino: 60%; con 4: 30%; con 9: 20%.
 */
export const umbralDiferencia = (inquilinos: number): number =>
  1 / (Math.max(inquilinos, 1) + 1) + MARGEN_DIFERENCIA;
const MILESIMAS = 1000;
const CERO = BigInt(0);
const UNO = BigInt(1);
const DOS = BigInt(2);

export class RepartoError extends Error {
  constructor(public readonly errores: string[]) {
    super(errores.join(' '));
    this.name = 'RepartoError';
  }
}

export const unidadDe = (servicio: Servicio): string =>
  servicio === 'luz' ? 'kWh' : servicio === 'agua' ? 'm³' : '';

const etiqueta = (c: Cuarto, i: number): string => c.nombre.trim() || `Cuarto ${i + 1}`;

const esNumero = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Pasa a milésimas enteras (evita decimales binarios al restar lecturas). */
const aMilesimas = (n: number): bigint => BigInt(Math.round(n * MILESIMAS));

/** Consumo de un cuarto en unidades (redondeado a milésimas). */
export const consumoDe = (c: Cuarto): number =>
  Number(aMilesimas(c.lecturaActual ?? 0) - aMilesimas(c.lecturaAnterior ?? 0)) / MILESIMAS;

const formatoUnidades = (n: number): string => String(Math.round(n * MILESIMAS) / MILESIMAS);

// ─── Validación ──────────────────────────────────────────────────────────────

export function validarEntrada(entrada: Entrada): string[] {
  const errores: string[] = [];
  const { servicio, cuartos } = entrada;
  const esMedido = servicio !== 'internet';

  if (!esNumero(entrada.totalCentimos) || entrada.totalCentimos <= 0) {
    errores.push('El total del recibo debe ser mayor a S/ 0. Escribe el monto tal como aparece en el recibo.');
  }

  if (cuartos.length < 1) {
    errores.push('Agrega al menos 1 cuarto para poder repartir el recibo.');
  } else if (esMedido && entrada.metodo === 'B_repartir_todo' && cuartos.length < MIN_CUARTOS_REPARTIR_TODO) {
    errores.push(
      'Para repartir todo el recibo entre inquilinos agrega al menos 2 cuartos. Si tienes un solo inquilino, vuelve al paso 2, escribe el consumo del medidor general y elige que cada inquilino pague solo lo que consumió.',
    );
  }
  if (cuartos.length > MAX_CUARTOS) {
    errores.push(`Puedes repartir entre un máximo de ${MAX_CUARTOS} cuartos.`);
  }

  cuartos.forEach((c, i) => {
    if (!c.nombre.trim()) {
      errores.push(`Escribe un nombre para el cuarto ${i + 1} (por ejemplo "Cuarto ${i + 1}" o el nombre del inquilino).`);
    }
  });

  if (!esMedido) {
    if (cuartos.length > 0 && !cuartos.some((c) => c.participa)) {
      errores.push('Marca al menos un cuarto que participe en el pago. Ahora ninguno está marcado.');
    }
    return errores;
  }

  const unidad = unidadDe(servicio);

  for (let i = 0; i < cuartos.length; i++) {
    const c = cuartos[i];
    const nombre = etiqueta(c, i);
    const { lecturaAnterior: ant, lecturaActual: act } = c;
    if (!esNumero(ant) || !esNumero(act)) {
      errores.push(`Falta la lectura anterior o la lectura actual de "${nombre}". Búscalas en el medidor del cuarto.`);
      continue;
    }
    if (ant < 0 || act < 0) {
      errores.push(`Las lecturas de "${nombre}" no pueden ser negativas.`);
      continue;
    }
    if (act < ant) {
      errores.push(
        `La lectura actual (${act}) de "${nombre}" es menor que la anterior (${ant}). Revisa que no se hayan intercambiado.`,
      );
    }
  }

  if (entrada.consumoPrincipal !== undefined && (!esNumero(entrada.consumoPrincipal) || entrada.consumoPrincipal <= 0)) {
    errores.push(`El consumo del medidor general debe ser mayor a 0 ${unidad}. Si no lo tienes, déjalo vacío.`);
  }

  if (entrada.metodo === 'A_consumo_propio' && entrada.consumoPrincipal === undefined) {
    errores.push(
      'Para que cada inquilino pague solo lo que consumió necesitamos el consumo del medidor general del recibo. Escríbelo o elige repartir todo el recibo.',
    );
  }

  // Solo se puede calcular la suma si no hubo errores de lectura arriba.
  if (errores.length === 0 && entrada.metodo === 'B_repartir_todo') {
    const suma = cuartos.reduce((s, c) => s + aMilesimas(consumoDe(c)), CERO);
    if (suma === CERO) {
      errores.push(
        `Ningún cuarto tiene consumo: todas las lecturas actuales son iguales a las anteriores. Revisa las lecturas, así no se puede repartir el recibo.`,
      );
    }
  }

  return errores;
}

// ─── Cálculo ─────────────────────────────────────────────────────────────────

/**
 * Reparte `total` céntimos en proporción a `pesos` (enteros no negativos)
 * con el método del mayor residuo. La suma devuelta es exactamente `total`.
 */
export function repartirProporcional(total: number, pesos: bigint[]): number[] {
  const T = BigInt(total);
  const suma = pesos.reduce((s, p) => s + p, CERO);
  if (suma === CERO) throw new RepartoError(['No hay consumo para repartir.']);

  const base = pesos.map((p) => (T * p) / suma);
  const residuos = pesos.map((p) => (T * p) % suma);
  let sobrantes = Number(T - base.reduce((s, b) => s + b, CERO));

  const orden = pesos
    .map((_, i) => i)
    .sort((a, b) => (residuos[a] === residuos[b] ? a - b : residuos[a] > residuos[b] ? -1 : 1));

  const montos = base.map(Number);
  for (const i of orden) {
    if (sobrantes <= 0) break;
    montos[i] += 1;
    sobrantes -= 1;
  }
  return montos;
}

/** División entera redondeando a lo más cercano (medios hacia arriba). */
const dividirRedondeando = (num: bigint, den: bigint): bigint => (DOS * num + den) / (DOS * den);

export function calcularReparto(entrada: Entrada): Resultado {
  const errores = validarEntrada(entrada);
  if (errores.length > 0) throw new RepartoError(errores);

  const { servicio, totalCentimos: total, cuartos } = entrada;
  const avisos: string[] = [];

  if (servicio === 'internet') {
    // El propietario va al final: en un empate de céntimos gana el primer cuarto, no él.
    const pesos = cuartos.map((c) => (c.participa ? UNO : CERO));
    if (entrada.incluyePropietario) pesos.push(UNO);
    const montos = repartirProporcional(total, pesos);
    const cobrado = montos.slice(0, cuartos.length).reduce((s, m) => s + m, 0);
    return {
      lineas: cuartos.map((c, i) => ({ cuartoId: c.id, montoCentimos: montos[i] })),
      totalCobradoCentimos: cobrado,
      diferenciaPropietarioCentimos: total - cobrado,
      avisos,
    };
  }

  const consumos = cuartos.map(consumoDe);
  const consumosMil = consumos.map(aMilesimas);
  const sumaSub = consumosMil.reduce((s, c) => s + c, CERO);
  const unidad = unidadDe(servicio);

  let montos: number[];
  let precioUnitario: number | undefined;

  if (entrada.metodo === 'A_consumo_propio') {
    const principalMil = aMilesimas(entrada.consumoPrincipal as number);
    montos = consumosMil.map((c) => Number(dividirRedondeando(BigInt(total) * c, principalMil)));
    precioUnitario = total / 100 / (entrada.consumoPrincipal as number);
    if (sumaSub > principalMil) {
      avisos.push(
        `Los medidores de los cuartos suman más (${formatoUnidades(Number(sumaSub) / MILESIMAS)} ${unidad}) que el medidor general (${formatoUnidades(entrada.consumoPrincipal as number)} ${unidad}). Revisa las lecturas.`,
      );
    }
  } else {
    montos = repartirProporcional(total, consumosMil);
  }

  const cobrado = montos.reduce((s, m) => s + m, 0);
  const diferencia = total - cobrado;

  const umbral = umbralDiferencia(cuartos.length);
  if (Math.abs(diferencia) > total * umbral) {
    avisos.push(
      `La diferencia que asumes es mayor al ${Math.round(umbral * 100)}% del recibo, que es lo esperable con ${cuartos.length} ${cuartos.length === 1 ? 'inquilino' : 'inquilinos'}. Revisa que las lecturas y el consumo del medidor general sean correctos.`,
    );
  }

  return {
    lineas: cuartos.map((c, i) => ({ cuartoId: c.id, consumo: consumos[i], montoCentimos: montos[i] })),
    totalCobradoCentimos: cobrado,
    diferenciaPropietarioCentimos: diferencia,
    precioUnitario,
    avisos,
  };
}
