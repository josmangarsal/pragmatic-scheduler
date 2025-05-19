import { useEffect, useState } from 'react';

export const useEllipsisObserver = (ref) => {
  const [isEllipsis, setIsEllipsis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkEllipsis = () => {
      const hasEllipsis = [...el.childNodes].some(
        (child) => child instanceof HTMLElement && child.scrollWidth > child.offsetWidth,
      );
      setIsEllipsis(hasEllipsis);
    };

    checkEllipsis();

    const resizeObserver = new ResizeObserver(checkEllipsis);
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return {
    isEllipsis,
  };
};
