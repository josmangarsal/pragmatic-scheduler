import { useEffect, useState } from 'react';

type UseVisibilityObserverProps = {
  root: HTMLElement | null;
  targetRef: React.RefObject<HTMLElement> | React.MutableRefObject<HTMLElement | undefined>;
  threshold?: number; // 1.0 = completamente visible, 0.0 = parcialmente visible
};

export function useVisibilityObserver({ root, targetRef, threshold = 1.0 }: UseVisibilityObserverProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= threshold);
      },
      {
        root,
        threshold,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [root, targetRef, threshold]);

  return { isVisible };
}
