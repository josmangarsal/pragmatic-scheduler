import {useEffect, useMemo, useRef} from 'react';
import {InfoFlowData} from '../types';

const useEventInfoFlow = (infoFlowData: InfoFlowData | null) => {
  const flowRef = useRef<HTMLDivElement>();

  const scrollRef = useMemo(() => (
    infoFlowData?.scrollRef ?? null
  ), [infoFlowData]);

  const dataGridProps = useMemo(() => (
    infoFlowData?.dataGridProps ?? null
  ), [infoFlowData]);

  const config = useMemo(() => (
    infoFlowData?.config ?? null
  ), [infoFlowData]);

  const eventStartX = useMemo(() => {
    if (dataGridProps && config) {
      return (dataGridProps.x * config.divisionWidth) / config.divisionParts;
    } return 0;
  }, [config, dataGridProps]);

  const eventEndX = useMemo(() => {
    if (dataGridProps && config) {
      return ((dataGridProps.x + dataGridProps.w) * config.divisionWidth) / config.divisionParts;
    } return 0;
  }, [config, dataGridProps]);

  useEffect(() => {
    if (scrollRef) {
      const onScroll = (e: Event) => {
        if (flowRef?.current) {
          const newX = scrollRef.scrollLeft - eventStartX;
          const {width} = flowRef.current.getBoundingClientRect();

          if ((eventStartX + newX) <= eventStartX) {
            // Left event box limit
            flowRef.current.style.transform = '';
          } else if ((eventStartX + newX + width) >= eventEndX) {
            // Right event box limit
            flowRef.current.style.display = 'grid';
            flowRef.current.style.width = 'fit-contents';
            flowRef.current.style.right = '0px';
          } else {
            // Move info inside event box
            // ((eventStartX + newX) > eventStartX) && ((eventStartX + newX + width) < eventEndX)
            flowRef.current.style.transform = `translateX(${newX}px)`;
          }
        }
      };

      scrollRef.addEventListener('scroll', onScroll);

      return () => scrollRef.removeEventListener('scroll', onScroll);
    }
  }, [eventEndX, eventStartX, scrollRef]);

  useEffect(() => {
    if (flowRef?.current) {
      // Init Event position
      flowRef.current.style.display = 'grid';
      flowRef.current.style.width = 'fit-contents';
      flowRef.current.style.right = '0px';
    }
  }, []);

  return flowRef;
};

export default useEventInfoFlow;
