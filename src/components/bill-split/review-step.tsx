import { ServiceType, SplitMethod, unitOf } from '@/lib/bill-split/domain';
import { copy } from '@/lib/bill-split/copy.es';
import { SplitForm } from '@/lib/bill-split/form';
import { SERVICE_LABELS } from '@/lib/bill-split/messages';
import { ActionButton, Panel, StepHeading } from './ui';
import { Step } from './steps';

const METHOD_OPTIONS: { id: SplitMethod; text: string }[] = [
  { id: 'OWN_CONSUMPTION', text: 'Cada inquilino paga solo lo que consumió. Yo asumo la diferencia.' },
  { id: 'SPLIT_ALL', text: 'Se reparte todo el recibo entre los inquilinos según lo que consumió cada uno.' },
];

interface SummaryRowProps {
  label: string;
  value: string;
  editStep: Step;
  onEdit: (step: Step) => void;
}

function SummaryRow({ label, value, editStep, onEdit }: SummaryRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div>
        <p className="text-base text-slate-700">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      <ActionButton variant="secondary" onClick={() => onEdit(editStep)} aria-label={`Corregir: ${label}`}>
        Corregir
      </ActionButton>
    </div>
  );
}

function roomSummary(room: SplitForm['rooms'][number], isMetered: boolean): string {
  if (isMetered) return `Lectura ${room.previous || '—'} a ${room.current || '—'}`;
  return room.participates ? 'Participa en el pago' : 'No participa';
}

interface ReviewStepProps {
  form: SplitForm;
  service: ServiceType;
  onMethodChange: (method: SplitMethod) => void;
  onEdit: (step: Step) => void;
}

export function ReviewStep({ form, service, onMethodChange, onEdit }: ReviewStepProps) {
  const isMetered = service !== 'internet';
  const unit = unitOf(service);
  const hasMainMeter = isMetered && form.mainMeter.trim() !== '';
  // Without the main meter the only possible method is to split the whole bill.
  const method = hasMainMeter ? form.method : 'SPLIT_ALL';

  return (
    <section className="flex flex-col gap-5">
      <StepHeading>Revisa los datos</StepHeading>
      <Panel>
        <SummaryRow label="Servicio" value={SERVICE_LABELS[service]} editStep={Step.SERVICE} onEdit={onEdit} />
        <SummaryRow
          label="Total del recibo"
          value={form.total ? `S/ ${form.total}` : '—'}
          editStep={Step.BILL}
          onEdit={onEdit}
        />
        {isMetered && (
          <SummaryRow
            label="Medidor general del recibo"
            value={hasMainMeter ? `${form.mainMeter} ${unit}` : 'No lo escribiste'}
            editStep={Step.BILL}
            onEdit={onEdit}
          />
        )}
        {!isMetered && (
          <SummaryRow
            label="Parte del propietario"
            value={form.includeOwner ? 'Yo también pago una parte' : 'Yo no pago'}
            editStep={Step.ROOMS}
            onEdit={onEdit}
          />
        )}
        {form.rooms.map((room, index) => (
          <SummaryRow
            key={room.id}
            label={room.name.trim() || copy.defaultRoomName(index + 1)}
            value={roomSummary(room, isMetered)}
            editStep={Step.ROOMS}
            onEdit={onEdit}
          />
        ))}
      </Panel>

      {isMetered && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-xl font-bold">¿Cómo quieres repartir?</legend>
          {METHOD_OPTIONS.map(({ id, text }) => {
            const disabled = id === 'OWN_CONSUMPTION' && !hasMainMeter;
            return (
              <label
                key={id}
                className={`flex min-h-14 items-start gap-4 rounded-xl border-2 p-4 ${
                  method === id ? 'border-brand bg-secondary' : 'border-slate-600'
                } ${disabled ? 'opacity-70' : 'cursor-pointer'}`}
              >
                <input
                  type="radio"
                  name="method"
                  value={id}
                  checked={method === id}
                  disabled={disabled}
                  onChange={() => onMethodChange(id)}
                  className="mt-1 h-6 w-6 shrink-0 accent-brand"
                />
                <span>
                  {text}
                  {disabled && (
                    <span className="mt-1 block text-base">
                      No disponible: falta el consumo del medidor general. Puedes escribirlo en el paso 2.
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}
    </section>
  );
}
