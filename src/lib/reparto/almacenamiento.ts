import { Formulario } from './formulario';

const CLAVE = 'reparto:ultimo-calculo:v1';

/**
 * localStorage puede estar bloqueado, lleno o ausente: todo acceso va en
 * try/catch y la app sigue funcionando sin guardar.
 * Solo se guardan nombres de cuartos, lecturas y montos; nada personal.
 */
export function guardarFormulario(f: Formulario): boolean {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(f));
    return true;
  } catch {
    return false;
  }
}

export function leerFormulario(): Formulario | null {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const f = JSON.parse(crudo) as Formulario;
    if (!f || !Array.isArray(f.cuartos) || f.cuartos.length === 0) return null;
    return f;
  } catch {
    return null;
  }
}

export function borrarFormulario(): void {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento: nada que borrar */
  }
}
