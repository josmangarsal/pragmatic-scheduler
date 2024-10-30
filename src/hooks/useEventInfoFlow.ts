import {useEffect, useMemo, useState} from 'react';

const useEventInfoFlow = (scrollRef: HTMLDivElement | null, startTimePx: number | null) => {
  const [scrollLeft, setScrollLeft] = useState<number>(0);

  useEffect(() => {
    if (scrollRef) {
      const onScroll = (e: Event) => {
        setScrollLeft(scrollRef.scrollLeft);
      };

      scrollRef.addEventListener('scroll', onScroll);

      return () => scrollRef.removeEventListener('scroll', onScroll);
    }
  }, [scrollRef]);

  return useMemo(() => {
    // Move event info to visible part of the event container
    if (scrollLeft) {
      return scrollLeft - (startTimePx ?? 0);
    }

    return 0;
  }, [scrollLeft, startTimePx]);
};

export default useEventInfoFlow;
