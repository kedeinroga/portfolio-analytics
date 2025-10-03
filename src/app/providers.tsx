'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nProvider } from '@/context/i18n';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>{children}</I18nProvider>
    </SessionProvider>
  );
}
