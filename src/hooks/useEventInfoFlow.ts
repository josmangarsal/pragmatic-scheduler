import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InfoFlowData } from '../types';
import { useEllipsisObserver } from './useEllipsisObserver';

export const useEventInfoFlow = (infoFlowData: InfoFlowData | null) => {
  const contentRef = useRef<HTMLDivElement>();

  const [isContentVisible, setIsContentVisible] = useState(true);

  const container = useMemo(() => infoFlowData?.scrollRef ?? null, [infoFlowData]);

  const dataGridProps = useMemo(() => infoFlowData?.dataGridProps ?? null, [infoFlowData]);

  const config = useMemo(() => infoFlowData?.config ?? null, [infoFlowData]);

  const eventStartX = useMemo(() => {
    if (dataGridProps && config) {
      return (dataGridProps.x * config.divisionWidth) / config.divisionParts;
    }
    return 0;
  }, [config, dataGridProps]);

  const eventEndX = useMemo(() => {
    if (dataGridProps && config) {
      return ((dataGridProps.x + dataGridProps.w) * config.divisionWidth) / config.divisionParts;
    }
    return 0;
  }, [config, dataGridProps]);

  const checkVisibility = useCallback((container: HTMLDivElement, content: HTMLDivElement) => {
    const offset = -8;

    const containerRect = container.getBoundingClientRect();
    const itemRect = content.getBoundingClientRect();

    const completelyVisible =
      itemRect.left >= containerRect.left + offset && itemRect.right <= containerRect.right - offset;

    setIsContentVisible(completelyVisible);
  }, []);

  const moveContent = useCallback(
    (container: HTMLDivElement, content: HTMLDivElement) => {
      const newX = container.scrollLeft - eventStartX;
      const { width } = content.getBoundingClientRect();

      if (eventStartX + newX <= eventStartX) {
        // Left event box limit
        content.style.transform = '';
      } else if (eventStartX + newX + width >= eventEndX) {
        // Right event box limit
        content.style.display = 'grid';
        content.style.width = 'fit-contents';
        content.style.right = '0px';
      } else {
        // Move info inside event box
        // ((eventStartX + newX) > eventStartX) && ((eventStartX + newX + width) < eventEndX)
        content.style.transform = `translateX(${newX}px)`;
      }
    },
    [eventEndX, eventStartX],
  );

  const handleScroll = useCallback(() => {
    const content = contentRef?.current;
    if (!container || !content) return;

    // Check if the event is visible in the scroll container
    checkVisibility(container, content);

    // Move event content inside the event box
    moveContent(container, content);
  }, [checkVisibility, container, moveContent]);

  useEffect(() => {
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [container, handleScroll]);

  useEffect(() => {
    if (contentRef?.current) {
      // Init Event position
      contentRef.current.style.display = 'grid';
      contentRef.current.style.width = 'fit-contents';
      contentRef.current.style.right = '0px';
    }
  }, []);

  const { isEllipsis } = useEllipsisObserver(contentRef);

  return {
    contentRef,
    isContentVisible,
    isEllipsis,
  };
};
