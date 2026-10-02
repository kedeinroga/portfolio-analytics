import { ServiceType } from '@/lib/bill-split/domain';
import { StepHeading } from './ui';

const SERVICES: { id: ServiceType; title: string; detail: string }[] = [
  { id: 'electricity', title: 'Luz', detail: 'Se reparte según el medidor de cada cuarto' },
  { id: 'water', title: 'Agua', detail: 'Se reparte según el medidor de cada cuarto' },
  { id: 'internet', title: 'Internet o cable', detail: 'Se divide en partes iguales' },
];

interface ServiceStepProps {
  selected?: ServiceType;
  onSelect: (service: ServiceType) => void;
}

export function ServiceStep({ selected, onSelect }: ServiceStepProps) {
  return (
    <section className="flex flex-col gap-4">
      <StepHeading>¿Qué servicio vas a repartir?</StepHeading>
      <div role="group" aria-label="Servicios" className="flex flex-col gap-4">
        {SERVICES.map(({ id, title, detail }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={selected === id}
            className={`min-h-24 rounded-xl border-2 p-5 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 ${
              selected === id ? 'border-blue-800 bg-blue-50' : 'border-slate-600 bg-white hover:bg-slate-100'
            }`}
          >
            <span className="block text-2xl font-bold">{title}</span>
            <span className="block text-base text-slate-700">{detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
