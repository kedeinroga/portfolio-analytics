import { Cuarto, Entrada, Metodo, Servicio } from './dominio';
import { aCentimos, parseNumero } from './formato';

/** Lo que el usuario escribe: texto crudo, para no pelear con el teclado. */
export interface CuartoForm {
  id: string;
  nombre: string;
  anterior: string;
  actual: string;
  participa: boolean;
}

export interface Formulario {
  servicio?: Servicio;
  total: string;
  principal: string;
  metodo: Metodo;
  cuartos: CuartoForm[];
  /** Solo internet. Las copias guardadas antes de este campo no lo traen. */
  incluyePropietario?: boolean;
}

let contador = 0;
export const nuevoId = (): string => `c${Date.now().toString(36)}${(contador++).toString(36)}`;

export const cuartoVacio = (n: number): CuartoForm => ({
  id: nuevoId(),
  nombre: `Cuarto ${n}`,
  anterior: '',
  actual: '',
  participa: true,
});

export const formularioInicial = (): Formulario => ({
  total: '',
  principal: '',
  metodo: 'A_consumo_propio',
  cuartos: [cuartoVacio(1), cuartoVacio(2)],
});

/**
 * Convierte el texto del formulario en una Entrada del dominio.
 * `errores` trae los campos que no son número; el dominio valida el resto.
 */
export function entradaDesdeFormulario(f: Formulario): { entrada: Entrada; errores: string[] } {
  const errores: string[] = [];
  const servicio = f.servicio ?? 'luz';
  const medido = servicio !== 'internet';

  const totalNum = parseNumero(f.total);
  if (f.total.trim() && totalNum === undefined) {
    errores.push(`No entendimos el total "${f.total}". Escribe solo números, por ejemplo 187.50.`);
  }

  let consumoPrincipal: number | undefined;
  if (medido && f.principal.trim()) {
    consumoPrincipal = parseNumero(f.principal);
    if (consumoPrincipal === undefined) {
      errores.push(`No entendimos el consumo del medidor general "${f.principal}". Escribe solo números, por ejemplo 320.`);
    }
  }

  const cuartos: Cuarto[] = f.cuartos.map((c, i) => {
    const base: Cuarto = { id: c.id, nombre: c.nombre, participa: c.participa };
    if (!medido) return base;
    const nombre = c.nombre.trim() || `Cuarto ${i + 1}`;
    const ant = parseNumero(c.anterior);
    const act = parseNumero(c.actual);
    if (c.anterior.trim() && ant === undefined) errores.push(`No entendimos la lectura anterior "${c.anterior}" de "${nombre}". Escribe solo números.`);
    if (c.actual.trim() && act === undefined) errores.push(`No entendimos la lectura actual "${c.actual}" de "${nombre}". Escribe solo números.`);
    return { ...base, lecturaAnterior: ant, lecturaActual: act };
  });

  return {
    errores,
    entrada: {
      servicio,
      totalCentimos: totalNum === undefined ? 0 : aCentimos(totalNum),
      consumoPrincipal,
      // Sin medidor general solo se puede repartir todo el recibo.
      metodo: medido && consumoPrincipal !== undefined ? f.metodo : 'B_repartir_todo',
      cuartos,
      incluyePropietario: !medido && !!f.incluyePropietario,
    },
  };
}
