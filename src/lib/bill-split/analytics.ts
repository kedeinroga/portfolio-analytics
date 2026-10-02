import * as gtag from '@/lib/gtag';

/**
 * Analytics events. The names are the ones agreed for the pilot, so they stay
 * in Spanish. Never send amounts or names: only the service type or the step.
 */
export const EVENTS = {
  calculationCompleted: 'calculo_completado',
  serviceChosen: 'servicio_elegido',
  shareWhatsApp: 'compartir_whatsapp',
  sharePdf: 'compartir_pdf',
  abandonedAtStep: (step: number) => `abandono_paso_${step}`,
} as const;

const CATEGORY = 'reparto';

export const trackEvent = (action: string, label: string): void =>
  gtag.event({ action, category: CATEGORY, label, value: 1 });
