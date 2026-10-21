import type { Metadata } from 'next';

const TITLE = 'Simulador Financiero | KRG';
const DESCRIPTION =
  'Calcula cuotas, descubre tasas ocultas y simula abonos a capital de un préstamo.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/finanzas' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://kedein.com/finanzas',
    locale: 'es_PE',
    type: 'website',
    images: [{ url: 'https://kedein.com/avatar.png', width: 800, height: 600, alt: 'KRG' }],
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION, images: ['https://kedein.com/avatar.png'] },
};

export default function FinanzasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
