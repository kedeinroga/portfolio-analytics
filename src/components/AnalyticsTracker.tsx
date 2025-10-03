'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView } from '@/lib/analytics';

const AnalyticsTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      logPageView(pathname);
    }
  }, [pathname]);

  return null; // This component does not render anything
};

export default AnalyticsTracker;
