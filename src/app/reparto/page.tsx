import type { Metadata } from 'next';
import { RepartoApp } from '@/components/reparto/reparto-app';

export const metadata: Metadata = {
  title: 'Reparte el recibo entre tus inquilinos | Kedein',
  description:
    'Calculadora gratuita para repartir el recibo de luz, agua o internet entre tus inquilinos, con el detalle de cómo se calculó cada monto.',
};

export default function RepartoPage() {
  return <RepartoApp />;
}
