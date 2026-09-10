# Portfolio — kedein.com

Portfolio personal de Kedein Rodríguez, hecho con [Next.js](https://nextjs.org/) como **export
estático** (`output: 'export'`) — sin backend, sin autenticación, sin base de datos. Se despliega en
[Cloudflare Pages](https://pages.cloudflare.com/) y se sirve en el apex `kedein.com`.

## Qué incluye

*   **Home** — presentación, experiencia y CV descargable (`/cvs`).
*   **`/calculadora`** — cronograma de entregas/plazos.
*   **`/finanzas`** — simulador financiero (PMT, tasa, tabla de amortización).
*   **Analytics:** Google Analytics 4 vía `gtag`, tracking directo del navegador (sin backend
    intermedio) — ver `src/lib/gtag.ts`.
*   **UI:** Tailwind CSS + componentes de Radix UI / `shadcn/ui`.
*   **i18n:** contexto propio (`src/context/i18n.tsx`), sin librería externa.

No hay dashboard, ni Firebase, ni NextAuth, ni Genkit — ese código se retiró al convertir el
proyecto a export estático (no eran compatibles con `output: 'export'`).

## Desarrollo local

Requisitos: Node.js 20+.

```bash
npm install
npm run dev              # http://localhost:9002 (Turbopack)
```

Variables de entorno (opcionales en dev; en producción las inyecta el pipeline de deploy):

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX   # measurement ID de GA4; sin esto, gtag no se monta
```

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack. |
| `npm run build:production` / `build:development` | Genera el export estático en `out/` (`NODE_ENV` correspondiente). |
| `npm run preview` | Build de producción + sirve `out/` local con `serve`, para validar el export antes de desplegar. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. Nota: los tests con matchers de `@testing-library/jest-dom` (`toBeInTheDocument`, `toHaveClass`, etc.) fallan aquí por un gap de tipos preexistente — no bloquea el build ni los tests reales, por eso no es parte del gate de CI. |
| `npm test` / `test:watch` / `test:coverage` | Jest. |
| `npm run test:ci` | Jest con cobertura, modo CI — es el gate que corre el deploy. |

## Deploy

`.github/workflows/deploy-pages.yml`: en cada push a `main` corre `test:ci` y, si pasa, despliega
`out/` al proyecto Cloudflare Pages `portfolio` con `wrangler pages deploy`. Los PRs publican una
preview en `*.pages.dev` sin tocar producción.

Deploy manual (por ejemplo para una validación puntual sin esperar CI):

```bash
npm run build:production
npx wrangler pages deploy out --project-name=portfolio
```

Requiere `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` en el entorno (en CI son GitHub Actions
secrets del repo).

El DNS y el proyecto Cloudflare Pages de `kedein.com` se administran con Terraform en un repo
aparte (`portfolio-infra`), independiente de este.
