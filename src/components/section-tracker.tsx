'use client';

import { useRef, useEffect } from 'react';
import { useOnScreen } from '@/hooks/use-on-screen';
import { logPageViewSpecificSection } from '@/lib/analytics';

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
      logPageViewSpecificSection(sectionName);
      hasBeenVisible.current = true;
    }
  }, [isVisible, sectionName]);

  return (
    <section ref={ref} className={className} id={id}>
      {children}
    </section>
  );
}
