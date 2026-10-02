import type { Metadata } from 'next';
import { BillSplitApp } from '@/components/bill-split/bill-split-app';

const TITLE = 'Reparte el recibo entre tus inquilinos | KRG';
const DESCRIPTION =
  'Calculadora gratuita para repartir el recibo de luz, agua o internet entre tus inquilinos, con el detalle de cómo se calculó cada monto.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Next.js replaces (does not merge) openGraph from the root layout, so the brand image is repeated here.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://kedein.com/reparto',
    locale: 'es_PE',
    type: 'website',
    images: [{ url: 'https://kedein.com/avatar.png', width: 800, height: 600, alt: 'KRG' }],
  },
};

export default function BillSplitPage() {
  return <BillSplitApp />;
}
