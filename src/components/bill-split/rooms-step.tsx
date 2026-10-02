import { MAX_ROOMS } from '@/lib/bill-split/domain';
import { RoomForm, SplitForm, emptyRoom } from '@/lib/bill-split/form';
import { ActionButton, Notice, Panel, StepHeading, TextField } from './ui';

interface RoomsStepProps {
  form: SplitForm;
  isMetered: boolean;
  onChange: (changes: Partial<SplitForm>) => void;
  onChangeRoom: (roomId: string, changes: Partial<RoomForm>) => void;
}

const checkboxRow =
  'flex min-h-14 cursor-pointer items-center gap-4 text-lg font-semibold';

export function RoomsStep({ form, isMetered, onChange, onChangeRoom }: RoomsStepProps) {
  const { rooms } = form;
  const needsMainMeter = isMetered && rooms.length === 1 && form.mainMeter.trim() === '';

  return (
    <section className="flex flex-col gap-5">
      <StepHeading>Tus cuartos</StepHeading>
      {isMetered ? (
        <p>
          Mira el medidor de cada cuarto y escribe el número de la lectura anterior (del mes pasado) y de la lectura actual
          (de hoy).
        </p>
      ) : (
        <p>Escribe el nombre de cada cuarto. Si alguno no participa en el pago, desmárcalo.</p>
      )}
      {needsMainMeter && (
        <Notice>con un solo cuarto necesitamos el consumo del medidor general. Vuelve al paso 2 para escribirlo.</Notice>
      )}

      {rooms.map((room, index) => (
        <Panel key={room.id} className="flex flex-col gap-4">
          <TextField
            id={`name-${room.id}`}
            label={`Nombre del cuarto ${index + 1}`}
            placeholder="Ej: Cuarto 1 o Juan"
            autoComplete="off"
            value={room.name}
            onChange={(event) => onChangeRoom(room.id, { name: event.target.value })}
          />
          {isMetered ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id={`previous-${room.id}`}
                label="Lectura anterior"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ej: 1200"
                value={room.previous}
                onChange={(event) => onChangeRoom(room.id, { previous: event.target.value })}
              />
              <TextField
                id={`current-${room.id}`}
                label="Lectura actual"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ej: 1290"
                value={room.current}
                onChange={(event) => onChangeRoom(room.id, { current: event.target.value })}
              />
            </div>
          ) : (
            <label htmlFor={`participates-${room.id}`} className={checkboxRow}>
              <input
                id={`participates-${room.id}`}
                type="checkbox"
                checked={room.participates}
                onChange={(event) => onChangeRoom(room.id, { participates: event.target.checked })}
                className="h-8 w-8 accent-blue-800"
              />
              Participa en el pago
            </label>
          )}
          {rooms.length > 1 && (
            <ActionButton
              variant="secondary"
              aria-label={`Quitar ${room.name.trim() || `cuarto ${index + 1}`}`}
              onClick={() => onChange({ rooms: rooms.filter((other) => other.id !== room.id) })}
            >
              Quitar este cuarto
            </ActionButton>
          )}
        </Panel>
      ))}

      {!isMetered && (
        <label
          htmlFor="include-owner"
          className="flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border-2 border-slate-600 p-4 text-lg font-semibold"
        >
          <input
            id="include-owner"
            type="checkbox"
            checked={form.includeOwner}
            onChange={(event) => onChange({ includeOwner: event.target.checked })}
            className="h-8 w-8 shrink-0 accent-blue-800"
          />
          Yo también pago mi parte (dividir con el propietario)
        </label>
      )}

      {rooms.length < MAX_ROOMS ? (
        <ActionButton variant="secondary" onClick={() => onChange({ rooms: [...rooms, emptyRoom(rooms.length + 1)] })}>
          Agregar otro cuarto
        </ActionButton>
      ) : (
        <p className="text-base text-slate-700">Llegaste al máximo de {MAX_ROOMS} cuartos.</p>
      )}
    </section>
  );
}
