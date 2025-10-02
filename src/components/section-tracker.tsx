'use client';

import { useRef, useEffect } from 'react';
import { useOnScreen } from '@/hooks/use-on-screen';
import { logEvent } from '@/lib/analytics';

type SectionTrackerProps = {
  sectionName: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function SectionTracker({
  sectionName,
  children,
  className,
  id,
}: SectionTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref, '-30%');
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    if (isVisible && !hasBeenVisible.current) {
      logEvent('page_view_specific_section', { section: sectionName });
      hasBeenVisible.current = true;
    }
  }, [isVisible, sectionName]);

  return (
    <section ref={ref} className={className} id={id}>
      {children}
    </section>
  );
}
