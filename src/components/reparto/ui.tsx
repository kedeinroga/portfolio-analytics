import * as React from 'react';

/**
 * Piezas visuales del asistente de reparto. Se usan elementos propios en vez
 * de los de shadcn porque aquí los mínimos son más grandes (botones 56 px,
 * texto 18 px) y el contraste es fijo (no depende del tema claro/oscuro).
 */

const base =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold text-center transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 disabled:opacity-60';

const variantes = {
  primario: 'bg-blue-800 text-white hover:bg-blue-900',
  secundario: 'border-2 border-slate-700 bg-white text-slate-900 hover:bg-slate-100',
  whatsapp: 'bg-green-800 text-white hover:bg-green-900',
} as const;

export type Variante = keyof typeof variantes;

export const claseBoton = (v: Variante = 'primario', extra = '') => `${base} ${variantes[v]} ${extra}`;

export function Boton({
  variante = 'primario',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button type="button" className={claseBoton(variante, className)} {...props} />;
}

export function Campo({
  id,
  etiqueta,
  ayuda,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; etiqueta: string; ayuda?: string }) {
  const ayudaId = ayuda ? `${id}-ayuda` : undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-semibold">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-describedby={ayudaId}
        className="h-14 w-full rounded-lg border-2 border-slate-600 bg-white px-4 text-lg text-slate-900 placeholder:text-slate-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950"
        {...input}
      />
      {ayuda && (
        <p id={ayudaId} className="text-base text-slate-700">
          <span className="font-semibold">¿Dónde encuentro este dato?</span> {ayuda}
        </p>
      )}
    </div>
  );
}

export function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border-2 border-slate-300 bg-white p-5 ${className}`}>{children}</div>;
}

export function Errores({ errores }: { errores: string[] }) {
  return (
    <div aria-live="assertive" role="alert" className={errores.length ? '' : 'hidden'}>
      {errores.length > 0 && (
        <div className="rounded-lg border-2 border-red-800 bg-red-50 p-4 text-lg text-red-950">
          <p className="font-bold">Revisa estos datos antes de seguir:</p>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
