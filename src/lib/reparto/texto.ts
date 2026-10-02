import { Cuarto, Entrada, Resultado, unidadDe } from './dominio';
import { formatoCantidad, formatoSoles } from './formato';

const NOMBRE_SERVICIO = { luz: 'luz', agua: 'agua', internet: 'internet o cable' } as const;

const nombreDe = (c: Cuarto, i: number) => c.nombre.trim() || `Cuarto ${i + 1}`;

/** Fórmula en palabras y números, una línea por paso. */
export function explicarCalculo(entrada: Entrada, resultado: Resultado, indice: number): string[] {
  const cuarto = entrada.cuartos[indice];
  const linea = resultado.lineas[indice];
  const total = formatoSoles(entrada.totalCentimos);
  const monto = formatoSoles(linea.montoCentimos);

  if (entrada.servicio === 'internet') {
    const propietario = entrada.incluyePropietario ? 1 : 0;
    const n = entrada.cuartos.filter((c) => c.participa).length + propietario;
    if (!cuarto.participa) return ['Este cuarto no participa en el pago, por eso no paga nada.'];
    return [
      propietario
        ? `El recibo es de ${total} y lo pagan ${n} personas en partes iguales (los cuartos que participan y tú, el propietario).`
        : `El recibo es de ${total} y lo pagan ${n} cuartos en partes iguales.`,
      `${total} ÷ ${n} = ${monto}.`,
      ...(n > 1 ? ['Si la división no es exacta, los céntimos sobrantes se asignan uno a uno, empezando por el primer cuarto de la lista.'] : []),
    ];
  }

  const u = unidadDe(entrada.servicio);
  const consumo = linea.consumo ?? 0;
  const pasos = [
    `Lo que gastó el cuarto: lectura actual ${formatoCantidad(cuarto.lecturaActual ?? 0)} − lectura anterior ${formatoCantidad(cuarto.lecturaAnterior ?? 0)} = ${formatoCantidad(consumo)} ${u}.`,
  ];

  if (entrada.metodo === 'A_consumo_propio') {
    const principal = entrada.consumoPrincipal ?? 0;
    pasos.push(
      `Precio por ${u}: ${total} ÷ ${formatoCantidad(principal)} ${u} del medidor general = S/ ${(resultado.precioUnitario ?? 0).toFixed(4)}.`,
      `Monto: ${formatoCantidad(consumo)} ${u} × S/ ${(resultado.precioUnitario ?? 0).toFixed(4)} = ${monto}.`,
      'El propietario asume la diferencia (áreas comunes y pérdidas).',
    );
  } else {
    const suma = resultado.lineas.reduce((s, l) => s + (l.consumo ?? 0), 0);
    pasos.push(
      `Entre todos los cuartos gastaron ${formatoCantidad(suma)} ${u}.`,
      `Monto: ${total} × ${formatoCantidad(consumo)} ÷ ${formatoCantidad(suma)} = ${monto}.`,
      'Los céntimos sobrantes del redondeo se asignan a los cuartos con mayor parte decimal para que la suma sea exactamente el total del recibo.',
    );
  }
  return pasos;
}

/** Mensaje de WhatsApp para un cuarto (plantilla del PRP). */
export function mensajeWhatsApp(entrada: Entrada, resultado: Resultado, indice: number): string {
  const cuarto = entrada.cuartos[indice];
  const linea = resultado.lineas[indice];
  const servicio = NOMBRE_SERVICIO[entrada.servicio];
  const lineas = [`Hola ${nombreDe(cuarto, indice)}. Este mes de ${servicio} te corresponde pagar ${formatoSoles(linea.montoCentimos)}.`];

  if (entrada.servicio !== 'internet') {
    const u = unidadDe(entrada.servicio);
    lineas.push(
      `Tu consumo: ${formatoCantidad(linea.consumo ?? 0)} ${u} (lectura ${formatoCantidad(cuarto.lecturaAnterior ?? 0)} a ${formatoCantidad(cuarto.lecturaActual ?? 0)}).`,
    );
    const precio =
      resultado.precioUnitario !== undefined
        ? `. Precio por ${u}: S/ ${resultado.precioUnitario.toFixed(4)}.`
        : '.';
    lineas.push(`Total del recibo: ${formatoSoles(entrada.totalCentimos)}${precio}`);
  } else {
    lineas.push(`Total del recibo: ${formatoSoles(entrada.totalCentimos)}, repartido en partes iguales${entrada.incluyePropietario ? ' (incluida la parte del propietario)' : ''}.`);
  }
  lineas.push('Cualquier duda, avísame.');
  return lineas.join('\n');
}

/** Texto general con todos los cuartos, para copiar o enviar de una vez. */
export function textoGeneral(entrada: Entrada, resultado: Resultado): string {
  const servicio = NOMBRE_SERVICIO[entrada.servicio];
  const filas = entrada.cuartos.map((c, i) => {
    const l = resultado.lineas[i];
    const u = unidadDe(entrada.servicio);
    const consumo = l.consumo !== undefined ? ` (${formatoCantidad(l.consumo)} ${u})` : '';
    return `• ${nombreDe(c, i)}${consumo}: ${formatoSoles(l.montoCentimos)}`;
  });
  return [
    `Reparto del recibo de ${servicio}. Total del recibo: ${formatoSoles(entrada.totalCentimos)}.`,
    ...filas,
    'Cualquier duda, avísame.',
  ].join('\n');
}

export const urlWhatsApp = (texto: string): string => `https://wa.me/?text=${encodeURIComponent(texto)}`;
