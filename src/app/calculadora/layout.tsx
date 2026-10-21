import type { Metadata } from 'next';

const TITLE = 'Calculadora de Plazos | KRG';
const DESCRIPTION =
  'Calcula tus fechas límite exactas a partir de la fecha de inicio de labores y evita penalizaciones.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/calculadora' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://kedein.com/calculadora',
    locale: 'es_PE',
    type: 'website',
    images: [{ url: 'https://kedein.com/avatar.png', width: 800, height: 600, alt: 'KRG' }],
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION, images: ['https://kedein.com/avatar.png'] },
};

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
