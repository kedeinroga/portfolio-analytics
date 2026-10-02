'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ServiceType, SplitError, calculateSplit } from '@/lib/bill-split/domain';
import { copy } from '@/lib/bill-split/copy.es';
import { formatDate } from '@/lib/bill-split/format';
import { RoomForm, SplitForm, formToInput, initialForm } from '@/lib/bill-split/form';
import { clearForm, loadForm, saveForm } from '@/lib/bill-split/storage';
import { validateStep } from '@/lib/bill-split/step-validation';
import { EVENTS, trackEvent } from '@/lib/bill-split/analytics';
import { ActionButton, ErrorList, StepHeading } from './ui';
import { Step, WIZARD_STEP_COUNT } from './steps';
import { ServiceStep } from './service-step';
import { BillStep } from './bill-step';
import { RoomsStep } from './rooms-step';
import { ReviewStep } from './review-step';
import { Calculation, ResultStep } from './result-step';

/** Steps the user can leave without finishing, i.e. where abandonment is tracked. */
const isInProgress = (step: Step) => step !== Step.HOME && step !== Step.RESULT;

export function BillSplitApp() {
  const [step, setStep] = useState<Step>(Step.HOME);
  const [form, setForm] = useState<SplitForm>(initialForm);
  const [hasSavedForm, setHasSavedForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<Step>(Step.HOME);

  const { service } = form;
  const isMetered = service === 'electricity' || service === 'water';

  useEffect(() => {
    setHasSavedForm(loadForm() !== null);
  }, []);

  // Track which step the user was on if they close the page before finishing.
  useEffect(() => {
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    const onPageHide = () => {
      if (isInProgress(stepRef.current)) trackEvent(EVENTS.abandonedAtStep(stepRef.current), `paso_${stepRef.current}`);
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, []);

  // On every step change, move focus to the step title (screen readers and keyboard users).
  useEffect(() => {
    containerRef.current?.querySelector<HTMLElement>('[data-step-heading]')?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  const goTo = (target: Step) => {
    setErrors([]);
    setStep(target);
  };

  const updateForm = (changes: Partial<SplitForm>) => {
    setErrors([]);
    setForm((current) => ({ ...current, ...changes }));
  };

  const updateRoom = (roomId: string, changes: Partial<RoomForm>) =>
    updateForm({ rooms: form.rooms.map((room) => (room.id === roomId ? { ...room, ...changes } : room)) });

  const start = (resumeSaved: boolean) => {
    setForm((resumeSaved ? loadForm() : null) ?? initialForm());
    goTo(Step.SERVICE);
  };

  const restart = () => {
    clearForm();
    setHasSavedForm(false);
    setCalculation(null);
    setForm(initialForm());
    goTo(Step.HOME);
  };

  const chooseService = (chosen: ServiceType) => {
    trackEvent(EVENTS.serviceChosen, chosen);
    setForm((current) => ({
      ...current,
      service: chosen,
      method: chosen === 'internet' ? 'SPLIT_ALL' : current.method,
    }));
    goTo(Step.BILL);
  };

  const goNext = () => {
    if (step === Step.BILL || step === Step.ROOMS) {
      const stepErrors = validateStep(step === Step.BILL ? 'bill' : 'rooms', form);
      if (stepErrors.length > 0) return setErrors(stepErrors);
      // Without the main meter the only possible method is to split the whole bill.
      if (step === Step.BILL && !form.mainMeter.trim()) setForm((current) => ({ ...current, method: 'SPLIT_ALL' }));
    }
    goTo((step + 1) as Step);
  };

  const calculate = () => {
    const { input, errors: formErrors } = formToInput(form);
    try {
      if (formErrors.length > 0) throw new SplitError(formErrors.map(({ message }) => message));
      const result = calculateSplit(input);
      setCalculation({ input, result, date: formatDate(new Date()) });
      saveForm(form);
      setHasSavedForm(true);
      trackEvent(EVENTS.calculationCompleted, input.service);
      goTo(Step.RESULT);
    } catch (error) {
      setErrors(error instanceof SplitError ? error.errors : [copy.errors.unexpected]);
    }
  };

  return (
    <div lang="es" className="min-h-screen bg-background font-body text-lg text-foreground print:min-h-0">
      <div
        ref={containerRef}
        className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-6 print:min-h-0 print:max-w-none"
      >
        <header className="border-b-4 border-accent pb-3 print:border-b print:border-border">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              aria-label="KRG, volver al inicio de kedein.com"
              className="rounded text-2xl font-bold text-primary focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-hover print:no-underline"
            >
              KRG
            </Link>
            <p className="text-base font-semibold text-slate-700">Reparto de recibos</p>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6">
          {step !== Step.HOME && (
            <p className="text-lg font-semibold text-slate-800 print:hidden" aria-live="polite">
              Paso {step} de {WIZARD_STEP_COUNT}
            </p>
          )}

          {step === Step.HOME && (
            <section className="flex flex-col gap-6">
              <StepHeading>Reparte el recibo entre tus inquilinos</StepHeading>
              <p>
                Escribe los datos del recibo y de los medidores. Te mostramos cuánto paga cada cuarto y cómo se calculó, para
                que todos puedan comprobarlo.
              </p>
              <ActionButton onClick={() => start(false)}>Empezar</ActionButton>
              {hasSavedForm && (
                <ActionButton variant="secondary" onClick={() => start(true)}>
                  Continuar con mi último cálculo
                </ActionButton>
              )}
              <p className="text-base text-slate-700">
                Todo se calcula en tu teléfono o computadora. No guardamos tus datos en ningún servidor.
              </p>
            </section>
          )}

          {step === Step.SERVICE && <ServiceStep selected={service} onSelect={chooseService} />}
          {step === Step.BILL && service && <BillStep service={service} form={form} onChange={updateForm} />}
          {step === Step.ROOMS && service && (
            <RoomsStep form={form} isMetered={isMetered} onChange={updateForm} onChangeRoom={updateRoom} />
          )}
          {step === Step.REVIEW && service && (
            <ReviewStep
              form={form}
              service={service}
              onMethodChange={(method) => updateForm({ method })}
              onEdit={goTo}
            />
          )}
          {step === Step.RESULT && calculation && (
            <ResultStep calculation={calculation} onEditData={() => goTo(Step.REVIEW)} onRestart={restart} />
          )}

          <ErrorList errors={errors} />

          {step >= Step.SERVICE && step <= Step.REVIEW && (
            <nav aria-label="Navegación del asistente" className="mt-auto grid grid-cols-2 gap-4 print:hidden">
              <ActionButton variant="secondary" onClick={() => goTo((step - 1) as Step)}>
                Atrás
              </ActionButton>
              {step === Step.REVIEW ? (
                <ActionButton onClick={calculate}>Calcular</ActionButton>
              ) : step === Step.SERVICE ? (
                <span aria-hidden="true" />
              ) : (
                <ActionButton onClick={goNext}>Siguiente</ActionButton>
              )}
            </nav>
          )}
        </main>

        <footer className="flex flex-col gap-3 border-t-2 border-border pt-4 text-base text-slate-700">
          <p>
            Esta herramienta ayuda a calcular. Usa solo montos que reflejen el recibo y acuerda con tus inquilinos el método
            de reparto.
          </p>
          <p>
            © {new Date().getFullYear()} Kedein Rodriguez Gatica ·{' '}
            <Link href="/" className="font-semibold text-brand underline">
              kedein.com
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
