'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Boton, Campo, Errores, Tarjeta, claseBoton } from './ui';
import {
  Entrada,
  MAX_CUARTOS,
  Metodo,
  RepartoError,
  Resultado,
  Servicio,
  calcularReparto,
  unidadDe,
  validarEntrada,
} from '@/lib/reparto/dominio';
import { formatoCantidad, formatoFecha, formatoSoles, parseNumero } from '@/lib/reparto/formato';
import {
  Formulario,
  cuartoVacio,
  entradaDesdeFormulario,
  formularioInicial,
} from '@/lib/reparto/formulario';
import { borrarFormulario, guardarFormulario, leerFormulario } from '@/lib/reparto/almacenamiento';
import { explicarCalculo, mensajeWhatsApp, textoGeneral, urlWhatsApp } from '@/lib/reparto/texto';
import * as gtag from '@/lib/gtag';

const TOTAL_PASOS = 5;

const SERVICIOS: { id: Servicio; titulo: string; detalle: string }[] = [
  { id: 'luz', titulo: 'Luz', detalle: 'Se reparte según el medidor de cada cuarto' },
  { id: 'agua', titulo: 'Agua', detalle: 'Se reparte según el medidor de cada cuarto' },
  { id: 'internet', titulo: 'Internet o cable', detalle: 'Se divide en partes iguales' },
];

const NOMBRE_SERVICIO: Record<Servicio, string> = { luz: 'luz', agua: 'agua', internet: 'internet o cable' };

// Analítica sin datos personales: nunca se envían montos ni nombres.
const evento = (action: string, label: string) =>
  gtag.event({ action, category: 'reparto', label, value: 1 });

export function RepartoApp() {
  const [paso, setPaso] = useState(0); // 0 = inicio, 1..5 = pasos
  const [form, setForm] = useState<Formulario>(formularioInicial);
  const [guardado, setGuardado] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [calculo, setCalculo] = useState<{ entrada: Entrada; resultado: Resultado; fecha: string } | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const pasoRef = useRef(0);

  useEffect(() => {
    setGuardado(leerFormulario() !== null);
  }, []);

  // Abandono: si se cierra la página antes de terminar, registrar en qué paso.
  useEffect(() => {
    pasoRef.current = paso;
  }, [paso]);
  useEffect(() => {
    const alSalir = () => {
      const p = pasoRef.current;
      if (p >= 1 && p < TOTAL_PASOS) evento(`abandono_paso_${p}`, `paso_${p}`);
    };
    window.addEventListener('pagehide', alSalir);
    return () => window.removeEventListener('pagehide', alSalir);
  }, []);

  // Al cambiar de pantalla, el foco va al título para lectores de pantalla y teclado.
  useEffect(() => {
    titulo.current?.focus();
    window.scrollTo({ top: 0 });
  }, [paso]);

  const servicio = form.servicio;
  const medido = servicio === 'luz' || servicio === 'agua';
  const unidad = servicio ? unidadDe(servicio) : '';

  const cambiar = (parcial: Partial<Formulario>) => {
    setErrores([]);
    setForm((f) => ({ ...f, ...parcial }));
  };
  const cambiarCuarto = (id: string, parcial: Partial<Formulario['cuartos'][number]>) =>
    cambiar({ cuartos: form.cuartos.map((c) => (c.id === id ? { ...c, ...parcial } : c)) });

  const erroresDelPaso = useCallback(
    (p: number): string[] => {
      const { entrada, errores: parseo } = entradaDesdeFormulario(form);
      if (p === 2) {
        const e = [...parseo.filter((m) => m.includes('total') || m.includes('medidor general'))];
        if (!form.total.trim()) e.push('Escribe el total a pagar que aparece en el recibo, por ejemplo 187.50.');
        else if (parseNumero(form.total) !== undefined && entrada.totalCentimos <= 0)
          e.push('El total del recibo debe ser mayor a S/ 0. Escribe el monto tal como aparece en el recibo.');
        if (form.principal.trim() && parseNumero(form.principal) === 0)
          e.push(`El consumo del medidor general debe ser mayor a 0 ${unidad}. Si no lo tienes, déjalo vacío.`);
        return e;
      }
      // Pasos 3 y 4: se valida todo. La validación del dominio solo corre si los textos son números.
      if (parseo.length) return parseo;
      return validarEntrada(entrada);
    },
    [form, unidad],
  );

  const ir = (destino: number) => {
    setErrores([]);
    setPaso(destino);
  };

  const siguiente = () => {
    if (paso === 2 || paso === 3) {
      const e = erroresDelPaso(paso);
      if (e.length) return setErrores(e);
      // Sin medidor general solo se puede repartir todo el recibo.
      if (paso === 2 && !form.principal.trim()) setForm((f) => ({ ...f, metodo: 'B_repartir_todo' }));
    }
    ir(paso + 1);
  };

  const calcular = () => {
    const { entrada, errores: parseo } = entradaDesdeFormulario(form);
    try {
      if (parseo.length) throw new RepartoError(parseo);
      const resultado = calcularReparto(entrada);
      setCalculo({ entrada, resultado, fecha: formatoFecha(new Date()) });
      guardarFormulario(form);
      setGuardado(true);
      evento('calculo_completado', entrada.servicio);
      ir(5);
    } catch (e) {
      setErrores(e instanceof RepartoError ? e.errores : ['Algo salió mal al calcular. Revisa los datos e inténtalo otra vez.']);
    }
  };

  const empezar = (continuar: boolean) => {
    const guardadoForm = continuar ? leerFormulario() : null;
    setForm(guardadoForm ?? formularioInicial());
    ir(1);
  };

  const empezarDeNuevo = () => {
    borrarFormulario();
    setGuardado(false);
    setCalculo(null);
    setForm(formularioInicial());
    ir(0);
  };

  const elegirServicio = (s: Servicio) => {
    evento('servicio_elegido', s);
    setForm((f) => ({ ...f, servicio: s, metodo: s === 'internet' ? 'B_repartir_todo' : f.metodo }));
    ir(2);
  };

  const encabezado = (texto: string) => (
    <h1 ref={titulo} tabIndex={-1} className="text-3xl font-bold leading-tight outline-none">
      {texto}
    </h1>
  );

  return (
    <div lang="es" className="min-h-screen bg-white text-lg text-slate-900 print:min-h-0">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-6 print:min-h-0 print:max-w-none">
        <header className="print:hidden">
          <Link href="/" className="text-base font-semibold text-blue-900 underline">
            ← Volver a kedein.com
          </Link>
        </header>

        <main className="flex flex-1 flex-col gap-6">
          {paso >= 1 && paso <= TOTAL_PASOS && (
            <p className="text-lg font-semibold text-slate-800 print:hidden" aria-live="polite">
              Paso {paso} de {TOTAL_PASOS}
            </p>
          )}

          {paso === 0 && (
            <section className="flex flex-col gap-6">
              {encabezado('Reparte el recibo entre tus inquilinos')}
              <p>
                Escribe los datos del recibo y de los medidores. Te mostramos cuánto paga cada cuarto y cómo se calculó, para
                que todos puedan comprobarlo.
              </p>
              <Boton onClick={() => empezar(false)}>Empezar</Boton>
              {guardado && (
                <Boton variante="secundario" onClick={() => empezar(true)}>
                  Continuar con mi último cálculo
                </Boton>
              )}
              <p className="text-base text-slate-700">
                Todo se calcula en tu teléfono o computadora. No guardamos tus datos en ningún servidor.
              </p>
            </section>
          )}

          {paso === 1 && (
            <section className="flex flex-col gap-4">
              {encabezado('¿Qué servicio vas a repartir?')}
              <div role="group" aria-label="Servicios" className="flex flex-col gap-4">
                {SERVICIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => elegirServicio(s.id)}
                    aria-pressed={servicio === s.id}
                    className={`min-h-24 rounded-xl border-2 p-5 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 ${
                      servicio === s.id ? 'border-blue-800 bg-blue-50' : 'border-slate-600 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-2xl font-bold">{s.titulo}</span>
                    <span className="block text-base text-slate-700">{s.detalle}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {paso === 2 && servicio && (
            <section className="flex flex-col gap-5">
              {encabezado('Datos del recibo')}
              <Campo
                id="total"
                etiqueta="Total a pagar según el recibo (S/)"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ej: 187.50"
                value={form.total}
                onChange={(e) => cambiar({ total: e.target.value })}
                ayuda="Es el monto final que aparece en tu recibo, el que tienes que pagar."
              />
              {medido && (
                <Campo
                  id="principal"
                  etiqueta={`Consumo del medidor general del recibo (${unidad}) — opcional`}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={servicio === 'luz' ? 'Ej: 320' : 'Ej: 24'}
                  value={form.principal}
                  onChange={(e) => cambiar({ principal: e.target.value })}
                  ayuda="Lo encuentras en el recibo, en el detalle de consumo. Si no lo tienes, déjalo vacío."
                />
              )}
            </section>
          )}

          {paso === 3 && servicio && (
            <section className="flex flex-col gap-5">
              {encabezado('Tus cuartos')}
              {medido && (
                <p>
                  Mira el medidor de cada cuarto y escribe el número de la lectura anterior (del mes pasado) y de la lectura
                  actual (de hoy).
                </p>
              )}
              {!medido && <p>Escribe el nombre de cada cuarto. Si alguno no participa en el pago, desmárcalo.</p>}
              {medido && form.cuartos.length === 1 && form.principal.trim() === '' && (
                <p className="rounded-lg border-2 border-amber-800 bg-amber-50 p-4 text-amber-950">
                  <span className="font-bold">Aviso: </span>
                  con un solo cuarto necesitamos el consumo del medidor general. Vuelve al paso 2 para escribirlo.
                </p>
              )}
              {form.cuartos.map((c, i) => (
                <Tarjeta key={c.id} className="flex flex-col gap-4">
                  <Campo
                    id={`nombre-${c.id}`}
                    etiqueta={`Nombre del cuarto ${i + 1}`}
                    placeholder="Ej: Cuarto 1 o Juan"
                    autoComplete="off"
                    value={c.nombre}
                    onChange={(e) => cambiarCuarto(c.id, { nombre: e.target.value })}
                  />
                  {medido ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Campo
                        id={`ant-${c.id}`}
                        etiqueta="Lectura anterior"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="Ej: 1200"
                        value={c.anterior}
                        onChange={(e) => cambiarCuarto(c.id, { anterior: e.target.value })}
                      />
                      <Campo
                        id={`act-${c.id}`}
                        etiqueta="Lectura actual"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="Ej: 1290"
                        value={c.actual}
                        onChange={(e) => cambiarCuarto(c.id, { actual: e.target.value })}
                      />
                    </div>
                  ) : (
                    <label htmlFor={`part-${c.id}`} className="flex min-h-14 cursor-pointer items-center gap-4 text-lg font-semibold">
                      <input
                        id={`part-${c.id}`}
                        type="checkbox"
                        checked={c.participa}
                        onChange={(e) => cambiarCuarto(c.id, { participa: e.target.checked })}
                        className="h-8 w-8 accent-blue-800"
                      />
                      Participa en el pago
                    </label>
                  )}
                  {form.cuartos.length > 1 && (
                    <Boton
                      variante="secundario"
                      aria-label={`Quitar ${c.nombre.trim() || `cuarto ${i + 1}`}`}
                      onClick={() => cambiar({ cuartos: form.cuartos.filter((x) => x.id !== c.id) })}
                    >
                      Quitar este cuarto
                    </Boton>
                  )}
                </Tarjeta>
              ))}
              {!medido && (
                <label htmlFor="propietario" className="flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border-2 border-slate-600 p-4 text-lg font-semibold">
                  <input
                    id="propietario"
                    type="checkbox"
                    checked={!!form.incluyePropietario}
                    onChange={(e) => cambiar({ incluyePropietario: e.target.checked })}
                    className="h-8 w-8 shrink-0 accent-blue-800"
                  />
                  Yo también pago mi parte (dividir con el propietario)
                </label>
              )}
              {form.cuartos.length < MAX_CUARTOS ? (
                <Boton
                  variante="secundario"
                  onClick={() => cambiar({ cuartos: [...form.cuartos, cuartoVacio(form.cuartos.length + 1)] })}
                >
                  Agregar otro cuarto
                </Boton>
              ) : (
                <p className="text-base text-slate-700">Llegaste al máximo de {MAX_CUARTOS} cuartos.</p>
              )}
            </section>
          )}

          {paso === 4 && servicio && (
            <Revision
              form={form}
              servicio={servicio}
              unidad={unidad}
              encabezado={encabezado('Revisa los datos')}
              onMetodo={(metodo) => cambiar({ metodo })}
              onCorregir={ir}
            />
          )}

          {paso === 5 && calculo && (
            <Resultados
              calculo={calculo}
              encabezado={encabezado('Resultado')}
              onNuevo={empezarDeNuevo}
              onCorregir={() => ir(4)}
            />
          )}

          <Errores errores={errores} />

          {paso >= 1 && paso <= 4 && (
            <nav aria-label="Navegación del asistente" className="mt-auto grid grid-cols-2 gap-4 print:hidden">
              <Boton variante="secundario" onClick={() => ir(paso - 1)}>
                Atrás
              </Boton>
              {paso === 4 ? (
                <Boton onClick={calcular}>Calcular</Boton>
              ) : paso === 1 ? (
                <span aria-hidden="true" />
              ) : (
                <Boton onClick={siguiente}>Siguiente</Boton>
              )}
            </nav>
          )}
        </main>

        <footer className="border-t-2 border-slate-300 pt-4 text-base text-slate-700">
          Esta herramienta ayuda a calcular. Usa solo montos que reflejen el recibo y acuerda con tus inquilinos el método de
          reparto.
        </footer>
      </div>
    </div>
  );
}

// ─── Paso 4 ──────────────────────────────────────────────────────────────────

function Fila({ etiqueta, valor, paso, onCorregir }: { etiqueta: string; valor: string; paso: number; onCorregir: (p: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 py-3 last:border-0">
      <div>
        <p className="text-base text-slate-700">{etiqueta}</p>
        <p className="text-xl font-bold">{valor}</p>
      </div>
      <Boton variante="secundario" onClick={() => onCorregir(paso)} aria-label={`Corregir: ${etiqueta}`}>
        Corregir
      </Boton>
    </div>
  );
}

function Revision({
  form,
  servicio,
  unidad,
  encabezado,
  onMetodo,
  onCorregir,
}: {
  form: Formulario;
  servicio: Servicio;
  unidad: string;
  encabezado: React.ReactNode;
  onMetodo: (m: Metodo) => void;
  onCorregir: (p: number) => void;
}) {
  const medido = servicio !== 'internet';
  const tienePrincipal = medido && form.principal.trim() !== '';
  const opciones: { id: Metodo; texto: string }[] = [
    { id: 'A_consumo_propio', texto: 'Cada inquilino paga solo lo que consumió. Yo asumo la diferencia.' },
    { id: 'B_repartir_todo', texto: 'Se reparte todo el recibo entre los inquilinos según lo que consumió cada uno.' },
  ];
  const metodo = tienePrincipal ? form.metodo : 'B_repartir_todo';

  return (
    <section className="flex flex-col gap-5">
      {encabezado}
      <Tarjeta>
        <Fila etiqueta="Servicio" valor={NOMBRE_SERVICIO[servicio]} paso={1} onCorregir={onCorregir} />
        <Fila etiqueta="Total del recibo" valor={form.total ? `S/ ${form.total}` : '—'} paso={2} onCorregir={onCorregir} />
        {medido && (
          <Fila
            etiqueta="Medidor general del recibo"
            valor={tienePrincipal ? `${form.principal} ${unidad}` : 'No lo escribiste'}
            paso={2}
            onCorregir={onCorregir}
          />
        )}
        {!medido && (
          <Fila
            etiqueta="Parte del propietario"
            valor={form.incluyePropietario ? 'Yo también pago una parte' : 'Yo no pago'}
            paso={3}
            onCorregir={onCorregir}
          />
        )}
        {form.cuartos.map((c, i) => (
          <Fila
            key={c.id}
            etiqueta={c.nombre.trim() || `Cuarto ${i + 1}`}
            valor={
              medido
                ? `Lectura ${c.anterior || '—'} a ${c.actual || '—'}`
                : c.participa
                  ? 'Participa en el pago'
                  : 'No participa'
            }
            paso={3}
            onCorregir={onCorregir}
          />
        ))}
      </Tarjeta>

      {medido && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-xl font-bold">¿Cómo quieres repartir?</legend>
          {opciones.map((o) => {
            const deshabilitada = o.id === 'A_consumo_propio' && !tienePrincipal;
            return (
              <label
                key={o.id}
                className={`flex min-h-14 items-start gap-4 rounded-xl border-2 p-4 ${
                  metodo === o.id ? 'border-blue-800 bg-blue-50' : 'border-slate-600'
                } ${deshabilitada ? 'opacity-70' : 'cursor-pointer'}`}
              >
                <input
                  type="radio"
                  name="metodo"
                  value={o.id}
                  checked={metodo === o.id}
                  disabled={deshabilitada}
                  onChange={() => onMetodo(o.id)}
                  className="mt-1 h-6 w-6 shrink-0 accent-blue-800"
                />
                <span>
                  {o.texto}
                  {deshabilitada && (
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

// ─── Resultado ───────────────────────────────────────────────────────────────

function Resultados({
  calculo,
  encabezado,
  onNuevo,
  onCorregir,
}: {
  calculo: { entrada: Entrada; resultado: Resultado; fecha: string };
  encabezado: React.ReactNode;
  onNuevo: () => void;
  onCorregir: () => void;
}) {
  const { entrada, resultado, fecha } = calculo;
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [estado, setEstado] = useState('');
  const u = unidadDe(entrada.servicio);
  const diferencia = resultado.diferenciaPropietarioCentimos;

  const copiar = async () => {
    const texto = textoGeneral(entrada, resultado);
    try {
      await navigator.clipboard.writeText(texto);
      setEstado('Texto copiado. Ya puedes pegarlo en WhatsApp.');
    } catch {
      setEstado('No se pudo copiar automáticamente. Usa el botón de WhatsApp o selecciona el texto a mano.');
    }
  };

  return (
    <section className="flex flex-col gap-5">
      {encabezado}
      <p className="text-base text-slate-700">
        Reparto de {NOMBRE_SERVICIO[entrada.servicio]} · {fecha}
      </p>

      {resultado.avisos.map((a) => (
        <div key={a} role="note" className="print:hidden rounded-lg border-2 border-amber-800 bg-amber-50 p-4 text-lg text-amber-950">
          <span className="font-bold">Aviso: </span>
          {a}
        </div>
      ))}

      <ul className="flex flex-col gap-4">
        {entrada.cuartos.map((c, i) => {
          const l = resultado.lineas[i];
          const abierto = !!abiertos[c.id];
          const nombre = c.nombre.trim() || `Cuarto ${i + 1}`;
          const noParticipa = entrada.servicio === 'internet' && !c.participa;
          return (
            <li key={c.id}>
              <Tarjeta className="flex flex-col gap-3 break-inside-avoid">
                <h2 className="text-2xl font-bold">{nombre}</h2>
                {l.consumo !== undefined && (
                  <p>
                    Lo que gastó el cuarto: <strong>{formatoCantidad(l.consumo)} {u}</strong>
                  </p>
                )}
                <p className="text-base text-slate-700">{noParticipa ? 'No participa en el pago' : 'Monto a pagar'}</p>
                <p className="text-5xl font-extrabold tracking-tight">{formatoSoles(l.montoCentimos)}</p>

                <Boton
                  variante="secundario"
                  className="print:hidden"
                  aria-expanded={abierto}
                  aria-controls={`formula-${c.id}`}
                  onClick={() => setAbiertos((a) => ({ ...a, [c.id]: !abierto }))}
                >
                  {abierto ? 'Ocultar cómo se calculó' : 'Ver cómo se calculó'}
                </Boton>
                <div id={`formula-${c.id}`} className={`${abierto ? 'block' : 'hidden print:block'} rounded-lg bg-slate-100 p-4`}>
                  <p className="mb-2 font-bold">Así se calculó:</p>
                  <ol className="list-decimal space-y-2 pl-6">
                    {explicarCalculo(entrada, resultado, i).map((paso) => (
                      <li key={paso}>{paso}</li>
                    ))}
                  </ol>
                </div>

                <a
                  className={claseBoton('whatsapp', 'print:hidden')}
                  href={urlWhatsApp(mensajeWhatsApp(entrada, resultado, i))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => evento('compartir_whatsapp', 'cuarto')}
                >
                  Enviar a {nombre} por WhatsApp
                </a>
              </Tarjeta>
            </li>
          );
        })}
      </ul>

      <Tarjeta className="break-inside-avoid">
        <h2 className="mb-2 text-2xl font-bold">Resumen</h2>
        <dl className="space-y-2">
          <div className="flex justify-between gap-4">
            <dt>Total del recibo</dt>
            <dd className="font-bold">{formatoSoles(entrada.totalCentimos)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Total cobrado a inquilinos</dt>
            <dd className="font-bold">{formatoSoles(resultado.totalCobradoCentimos)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{diferencia < 0 ? 'Cobrado de más' : entrada.servicio === 'internet' && entrada.incluyePropietario ? 'Tu parte' : 'Diferencia que asumes tú'}</dt>
            <dd className="font-bold">{formatoSoles(Math.abs(diferencia))}</dd>
          </div>
        </dl>
      </Tarjeta>

      <div className="flex flex-col gap-4 print:hidden">
        <a
          className={claseBoton('whatsapp')}
          href={urlWhatsApp(textoGeneral(entrada, resultado))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => evento('compartir_whatsapp', 'general')}
        >
          Enviar resumen general por WhatsApp
        </a>
        <Boton variante="secundario" onClick={copiar}>
          Copiar texto
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => {
            evento('compartir_pdf', 'imprimir');
            window.print();
          }}
        >
          Imprimir o guardar PDF
        </Boton>
        <p aria-live="polite" className="min-h-6 text-base font-semibold text-slate-800">
          {estado}
        </p>
        <Boton variante="secundario" onClick={onCorregir}>
          Corregir datos
        </Boton>
        <Boton variante="secundario" onClick={onNuevo}>
          Empezar de nuevo
        </Boton>
      </div>
    </section>
  );
}
