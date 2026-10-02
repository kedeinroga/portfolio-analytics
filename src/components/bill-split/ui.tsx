import * as React from 'react';

/**
 * Visual building blocks for the bill-split wizard. They are custom instead of
 * the shadcn ones because the minimums here are larger (56 px buttons, 18 px
 * text) and the contrast is fixed (independent of the light/dark theme).
 */

const baseButton =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold text-center transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 disabled:opacity-60';

const buttonVariants = {
  primary: 'bg-blue-800 text-white hover:bg-blue-900',
  secondary: 'border-2 border-slate-700 bg-white text-slate-900 hover:bg-slate-100',
  whatsapp: 'bg-green-800 text-white hover:bg-green-900',
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export const buttonClass = (variant: ButtonVariant = 'primary', extra = '') =>
  `${baseButton} ${buttonVariants[variant]} ${extra}`;

export function ActionButton({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  /** Always-visible hint under the field ("where do I find this?"). */
  help?: string;
}

export function TextField({ id, label, help, ...input }: TextFieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-lg font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={helpId}
        className="h-14 w-full rounded-lg border-2 border-slate-600 bg-white px-4 text-lg text-slate-900 placeholder:text-slate-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950"
        {...input}
      />
      {help && (
        <p id={helpId} className="text-base text-slate-700">
          <span className="font-semibold">¿Dónde encuentro este dato?</span> {help}
        </p>
      )}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border-2 border-slate-300 bg-white p-5 ${className}`}>{children}</div>;
}

export function Notice({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p role="note" className={`rounded-lg border-2 border-amber-800 bg-amber-50 p-4 text-lg text-amber-950 ${className}`}>
      <span className="font-bold">Aviso: </span>
      {children}
    </p>
  );
}

export function ErrorList({ errors }: { errors: string[] }) {
  return (
    <div aria-live="assertive" role="alert" className={errors.length ? '' : 'hidden'}>
      {errors.length > 0 && (
        <div className="rounded-lg border-2 border-red-800 bg-red-50 p-4 text-lg text-red-950">
          <p className="font-bold">Revisa estos datos antes de seguir:</p>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Each step's title. The wizard moves focus here on every step change. */
export function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 data-step-heading tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">
      {children}
    </h1>
  );
}
