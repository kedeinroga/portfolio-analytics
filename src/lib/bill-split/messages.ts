/** Spanish text built from a calculation: step-by-step explanation and shareable messages. */

import { Room, ServiceType, SplitInput, SplitResult, unitOf } from './domain';
import { copy } from './copy.es';
import { formatQuantity, formatSoles } from './format';

export const SERVICE_LABELS: Record<ServiceType, string> = {
  electricity: 'luz',
  water: 'agua',
  internet: 'internet o cable',
};

const roomName = (room: Room, index: number): string => room.name.trim() || copy.defaultRoomName(index + 1);

const SIGN_OFF = 'Cualquier duda, avísame.';

function explainInternet(input: SplitInput, index: number, amount: string): string[] {
  const total = formatSoles(input.totalCents);
  if (!input.rooms[index].participates) return ['Este cuarto no participa en el pago, por eso no paga nada.'];

  const ownerShare = input.includeOwner ? 1 : 0;
  const payers = input.rooms.filter((room) => room.participates).length + ownerShare;
  const intro = ownerShare
    ? `El recibo es de ${total} y lo pagan ${payers} personas en partes iguales (los cuartos que participan y tú, el propietario).`
    : `El recibo es de ${total} y lo pagan ${payers} cuartos en partes iguales.`;

  return [
    intro,
    `${total} ÷ ${payers} = ${amount}.`,
    ...(payers > 1
      ? ['Si la división no es exacta, los céntimos sobrantes se asignan uno a uno, empezando por el primer cuarto de la lista.']
      : []),
  ];
}

/** Calculation steps in words and real numbers, one line per step. */
export function explainCalculation(input: SplitInput, result: SplitResult, index: number): string[] {
  const room = input.rooms[index];
  const line = result.lines[index];
  const total = formatSoles(input.totalCents);
  const amount = formatSoles(line.amountCents);

  if (input.service === 'internet') return explainInternet(input, index, amount);

  const unit = unitOf(input.service);
  const consumption = line.consumption ?? 0;
  const steps = [
    `Lo que gastó el cuarto: lectura actual ${formatQuantity(room.currentReading ?? 0)} − lectura anterior ${formatQuantity(room.previousReading ?? 0)} = ${formatQuantity(consumption)} ${unit}.`,
  ];

  if (input.method === 'OWN_CONSUMPTION') {
    const unitPrice = (result.unitPrice ?? 0).toFixed(4);
    steps.push(
      `Precio por ${unit}: ${total} ÷ ${formatQuantity(input.mainMeterConsumption ?? 0)} ${unit} del medidor general = S/ ${unitPrice}.`,
      `Monto: ${formatQuantity(consumption)} ${unit} × S/ ${unitPrice} = ${amount}.`,
      'El propietario asume la diferencia (áreas comunes y pérdidas).',
    );
  } else {
    const roomsTotal = result.lines.reduce((sum, item) => sum + (item.consumption ?? 0), 0);
    steps.push(
      `Entre todos los cuartos gastaron ${formatQuantity(roomsTotal)} ${unit}.`,
      `Monto: ${total} × ${formatQuantity(consumption)} ÷ ${formatQuantity(roomsTotal)} = ${amount}.`,
      'Los céntimos sobrantes del redondeo se asignan a los cuartos con mayor parte decimal para que la suma sea exactamente el total del recibo.',
    );
  }
  return steps;
}

/** WhatsApp message for one room. */
export function buildWhatsAppMessage(input: SplitInput, result: SplitResult, index: number): string {
  const room = input.rooms[index];
  const line = result.lines[index];
  const total = formatSoles(input.totalCents);
  const lines = [
    `Hola ${roomName(room, index)}. Este mes de ${SERVICE_LABELS[input.service]} te corresponde pagar ${formatSoles(line.amountCents)}.`,
  ];

  if (input.service === 'internet') {
    const ownerNote = input.includeOwner ? ' (incluida la parte del propietario)' : '';
    lines.push(`Total del recibo: ${total}, repartido en partes iguales${ownerNote}.`);
  } else {
    const unit = unitOf(input.service);
    const unitPrice = result.unitPrice !== undefined ? ` Precio por ${unit}: S/ ${result.unitPrice.toFixed(4)}.` : '';
    lines.push(
      `Tu consumo: ${formatQuantity(line.consumption ?? 0)} ${unit} (lectura ${formatQuantity(room.previousReading ?? 0)} a ${formatQuantity(room.currentReading ?? 0)}).`,
      `Total del recibo: ${total}.${unitPrice}`,
    );
  }
  lines.push(SIGN_OFF);
  return lines.join('\n');
}

/** Summary of every room, to copy or send in one go. */
export function buildSummaryText(input: SplitInput, result: SplitResult): string {
  const unit = unitOf(input.service);
  const rows = input.rooms.map((room, index) => {
    const line = result.lines[index];
    const consumption = line.consumption !== undefined ? ` (${formatQuantity(line.consumption)} ${unit})` : '';
    return `• ${roomName(room, index)}${consumption}: ${formatSoles(line.amountCents)}`;
  });
  return [
    `Reparto del recibo de ${SERVICE_LABELS[input.service]}. Total del recibo: ${formatSoles(input.totalCents)}.`,
    ...rows,
    SIGN_OFF,
  ].join('\n');
}

export const buildWhatsAppUrl = (text: string): string => `https://wa.me/?text=${encodeURIComponent(text)}`;
