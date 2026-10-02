import { useState } from 'react';
import { SplitInput, SplitResult, unitOf } from '@/lib/bill-split/domain';
import { copy } from '@/lib/bill-split/copy.es';
import { formatQuantity, formatSoles } from '@/lib/bill-split/format';
import {
  SERVICE_LABELS,
  buildSummaryText,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  explainCalculation,
} from '@/lib/bill-split/messages';
import { EVENTS, trackEvent } from '@/lib/bill-split/analytics';
import { ActionButton, Notice, Panel, StepHeading, buttonClass } from './ui';

export interface Calculation {
  input: SplitInput;
  result: SplitResult;
  /** dd/mm/yyyy, fixed when the calculation was made. */
  date: string;
}

interface ResultStepProps {
  calculation: Calculation;
  onEditData: () => void;
  onRestart: () => void;
}

function ownerRowLabel({ input, result }: Calculation): string {
  if (result.ownerDifferenceCents < 0) return 'Cobrado de más';
  return input.service === 'internet' && input.includeOwner ? 'Tu parte' : 'Diferencia que asumes tú';
}

export function ResultStep({ calculation, onEditData, onRestart }: ResultStepProps) {
  const { input, result, date } = calculation;
  const [expandedRoomIds, setExpandedRoomIds] = useState<Set<string>>(new Set());
  const [copyStatus, setCopyStatus] = useState('');
  const unit = unitOf(input.service);

  const toggleExpanded = (roomId: string) =>
    setExpandedRoomIds((current) => {
      const next = new Set(current);
      if (!next.delete(roomId)) next.add(roomId);
      return next;
    });

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText(input, result));
      setCopyStatus('Texto copiado. Ya puedes pegarlo en WhatsApp.');
    } catch {
      setCopyStatus('No se pudo copiar automáticamente. Usa el botón de WhatsApp o selecciona el texto a mano.');
    }
  };

  const print = () => {
    trackEvent(EVENTS.sharePdf, 'imprimir');
    window.print();
  };

  return (
    <section className="flex flex-col gap-5">
      <StepHeading>Resultado</StepHeading>
      <p className="text-base text-slate-700">
        Reparto de {SERVICE_LABELS[input.service]} · {date}
      </p>

      {/* Warnings are for the owner only: hidden when printing and never part of shared text. */}
      {result.warnings.map((warning) => (
        <Notice key={warning} className="print:hidden">
          {warning}
        </Notice>
      ))}

      <ul className="flex flex-col gap-4">
        {input.rooms.map((room, index) => {
          const line = result.lines[index];
          const isExpanded = expandedRoomIds.has(room.id);
          const name = room.name.trim() || copy.defaultRoomName(index + 1);
          const isOutOfPayment = input.service === 'internet' && !room.participates;
          return (
            <li key={room.id}>
              <Panel className="flex flex-col gap-3 break-inside-avoid">
                <h2 className="text-2xl font-bold">{name}</h2>
                {line.consumption !== undefined && (
                  <p>
                    Lo que gastó el cuarto:{' '}
                    <strong>
                      {formatQuantity(line.consumption)} {unit}
                    </strong>
                  </p>
                )}
                <p className="text-base text-slate-700">{isOutOfPayment ? 'No participa en el pago' : 'Monto a pagar'}</p>
                <p className="text-5xl font-extrabold tracking-tight">{formatSoles(line.amountCents)}</p>

                <ActionButton
                  variant="secondary"
                  className="print:hidden"
                  aria-expanded={isExpanded}
                  aria-controls={`formula-${room.id}`}
                  onClick={() => toggleExpanded(room.id)}
                >
                  {isExpanded ? 'Ocultar cómo se calculó' : 'Ver cómo se calculó'}
                </ActionButton>
                <div
                  id={`formula-${room.id}`}
                  className={`${isExpanded ? 'block' : 'hidden print:block'} rounded-lg bg-secondary p-4`}
                >
                  <p className="mb-2 font-bold">Así se calculó:</p>
                  <ol className="list-decimal space-y-2 pl-6">
                    {explainCalculation(input, result, index).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <a
                  className={buttonClass('whatsapp', 'print:hidden')}
                  href={buildWhatsAppUrl(buildWhatsAppMessage(input, result, index))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(EVENTS.shareWhatsApp, 'cuarto')}
                >
                  Enviar a {name} por WhatsApp
                </a>
              </Panel>
            </li>
          );
        })}
      </ul>

      <Panel className="break-inside-avoid">
        <h2 className="mb-2 text-2xl font-bold">Resumen</h2>
        <dl className="space-y-2">
          <div className="flex justify-between gap-4">
            <dt>Total del recibo</dt>
            <dd className="font-bold">{formatSoles(input.totalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Total cobrado a inquilinos</dt>
            <dd className="font-bold">{formatSoles(result.totalChargedCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{ownerRowLabel(calculation)}</dt>
            <dd className="font-bold">{formatSoles(Math.abs(result.ownerDifferenceCents))}</dd>
          </div>
        </dl>
      </Panel>

      <div className="flex flex-col gap-4 print:hidden">
        <a
          className={buttonClass('whatsapp')}
          href={buildWhatsAppUrl(buildSummaryText(input, result))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent(EVENTS.shareWhatsApp, 'general')}
        >
          Enviar resumen general por WhatsApp
        </a>
        <ActionButton variant="secondary" onClick={copySummary}>
          Copiar texto
        </ActionButton>
        <ActionButton variant="secondary" onClick={print}>
          Imprimir o guardar PDF
        </ActionButton>
        <p aria-live="polite" className="min-h-6 text-base font-semibold text-slate-800">
          {copyStatus}
        </p>
        <ActionButton variant="secondary" onClick={onEditData}>
          Corregir datos
        </ActionButton>
        <ActionButton variant="secondary" onClick={onRestart}>
          Empezar de nuevo
        </ActionButton>
      </div>
    </section>
  );
}
