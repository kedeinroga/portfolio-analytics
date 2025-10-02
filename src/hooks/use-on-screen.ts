'use client';
import { useState, useEffect, type RefObject } from 'react';

export function useOnScreen(
  ref: RefObject<HTMLElement>,
  rootMargin = '0px'
): boolean {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          // We can unobserve after it's visible once to avoid re-triggering
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        rootMargin,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, rootMargin]);

  return isIntersecting;
}
