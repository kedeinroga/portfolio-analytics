import { ServiceType, unitOf } from '@/lib/bill-split/domain';
import { SplitForm } from '@/lib/bill-split/form';
import { StepHeading, TextField } from './ui';

interface BillStepProps {
  service: ServiceType;
  form: SplitForm;
  onChange: (changes: Partial<SplitForm>) => void;
}

export function BillStep({ service, form, onChange }: BillStepProps) {
  const isMetered = service !== 'internet';
  const unit = unitOf(service);

  return (
    <section className="flex flex-col gap-5">
      <StepHeading>Datos del recibo</StepHeading>
      <TextField
        id="total"
        label="Total a pagar según el recibo (S/)"
        inputMode="decimal"
        autoComplete="off"
        placeholder="Ej: 187.50"
        value={form.total}
        onChange={(event) => onChange({ total: event.target.value })}
        help="Es el monto final que aparece en tu recibo, el que tienes que pagar."
      />
      {isMetered && (
        <TextField
          id="main-meter"
          label={`Consumo del medidor general del recibo (${unit}) — opcional`}
          inputMode="decimal"
          autoComplete="off"
          placeholder={service === 'electricity' ? 'Ej: 320' : 'Ej: 24'}
          value={form.mainMeter}
          onChange={(event) => onChange({ mainMeter: event.target.value })}
          help="Lo encuentras en el recibo, en el detalle de consumo. Si no lo tienes, déjalo vacío."
        />
      )}
    </section>
  );
}
