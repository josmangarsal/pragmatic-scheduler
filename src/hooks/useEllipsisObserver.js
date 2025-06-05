import { useEffect, useState } from 'react';

export const useEllipsisObserver = (ref) => {
  const [isEllipsis, setIsEllipsis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const getLeafElements = (node) => {
      const leafNodes = [];

      const traverse = (n) => {
        if (!(n instanceof HTMLElement)) return;
        const childElements = Array.from(n.children).filter((c) => c instanceof HTMLElement);

        if (childElements.length === 0 && n.classList.contains('ellipsisText')) {
          leafNodes.push(n);
        } else {
          childElements.forEach(traverse);
        }
      };

      traverse(node);
      return leafNodes;
    };

    const checkEllipsis = () => {
      const leafElements = getLeafElements(el);
      const hasEllipsis = leafElements.some((child) => child.scrollWidth > child.offsetWidth);
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
