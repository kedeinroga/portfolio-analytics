import type { Metadata } from 'next';
import { BillSplitApp } from '@/components/bill-split/bill-split-app';

export const metadata: Metadata = {
  title: 'Reparte el recibo entre tus inquilinos | Kedein',
  description:
    'Calculadora gratuita para repartir el recibo de luz, agua o internet entre tus inquilinos, con el detalle de cómo se calculó cada monto.',
};

export default function BillSplitPage() {
  return <BillSplitApp />;
}
