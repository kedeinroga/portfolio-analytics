/**
 * Spanish user-facing text produced by the domain layer (validation errors and
 * warnings). Keeping it here leaves the domain logic free of display strings.
 */

export const copy = {
  defaultRoomName: (position: number) => `Cuarto ${position}`,

  errors: {
    totalNotPositive: 'El total del recibo debe ser mayor a S/ 0. Escribe el monto tal como aparece en el recibo.',
    noRooms: 'Agrega al menos 1 cuarto para poder repartir el recibo.',
    splitAllNeedsTwoRooms:
      'Para repartir todo el recibo entre inquilinos agrega al menos 2 cuartos. Si tienes un solo inquilino, vuelve al paso 2, escribe el consumo del medidor general y elige que cada inquilino pague solo lo que consumió.',
    tooManyRooms: (max: number) => `Puedes repartir entre un máximo de ${max} cuartos.`,
    roomNameMissing: (position: number) =>
      `Escribe un nombre para el cuarto ${position} (por ejemplo "Cuarto ${position}" o el nombre del inquilino).`,
    noParticipants: 'Marca al menos un cuarto que participe en el pago. Ahora ninguno está marcado.',
    missingReadings: (room: string) =>
      `Falta la lectura anterior o la lectura actual de "${room}". Búscalas en el medidor del cuarto.`,
    negativeReadings: (room: string) => `Las lecturas de "${room}" no pueden ser negativas.`,
    currentBelowPrevious: (room: string, current: number, previous: number) =>
      `La lectura actual (${current}) de "${room}" es menor que la anterior (${previous}). Revisa que no se hayan intercambiado.`,
    mainMeterNotPositive: (unit: string) =>
      `El consumo del medidor general debe ser mayor a 0 ${unit}. Si no lo tienes, déjalo vacío.`,
    ownConsumptionNeedsMainMeter:
      'Para que cada inquilino pague solo lo que consumió necesitamos el consumo del medidor general del recibo. Escríbelo o elige repartir todo el recibo.',
    noConsumption:
      'Ningún cuarto tiene consumo: todas las lecturas actuales son iguales a las anteriores. Revisa las lecturas, así no se puede repartir el recibo.',
    nothingToSplit: 'No hay consumo para repartir.',
    unexpected: 'Algo salió mal al calcular. Revisa los datos e inténtalo otra vez.',
  },

  formErrors: {
    totalRequired: 'Escribe el total a pagar que aparece en el recibo, por ejemplo 187.50.',
    unreadableTotal: (text: string) => `No entendimos el total "${text}". Escribe solo números, por ejemplo 187.50.`,
    unreadableMainMeter: (text: string) =>
      `No entendimos el consumo del medidor general "${text}". Escribe solo números, por ejemplo 320.`,
    unreadablePrevious: (text: string, room: string) =>
      `No entendimos la lectura anterior "${text}" de "${room}". Escribe solo números.`,
    unreadableCurrent: (text: string, room: string) =>
      `No entendimos la lectura actual "${text}" de "${room}". Escribe solo números.`,
  },

  warnings: {
    roomsExceedMainMeter: (roomsSum: string, mainMeter: string, unit: string) =>
      `Los medidores de los cuartos suman más (${roomsSum} ${unit}) que el medidor general (${mainMeter} ${unit}). Revisa las lecturas.`,
    ownerDifferenceTooHigh: (percent: number, tenants: number) =>
      `La diferencia que asumes es mayor al ${percent}% del recibo, que es lo esperable con ${tenants} ${tenants === 1 ? 'inquilino' : 'inquilinos'}. Revisa que las lecturas y el consumo del medidor general sean correctos.`,
  },
};
