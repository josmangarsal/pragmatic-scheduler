import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SchedulerContext } from './Scheduler';
import { IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import './HeaderControls.css';

export const HeaderControls = () => {
  const { extendFrom, extendTo } = useContext(SchedulerContext);

  const ref = useRef<HTMLDivElement>(null);

  const [visibleFirstDay, setVisibleFirstDay] = useState(false);
  const [visibleLastDay, setVisibleLastDay] = useState(false);

  useEffect(() => {
    if (ref) {
      const onScroll = () => {
        if (!ref.current?.parentElement) return;

        const left = ref.current.parentElement.scrollLeft;
        const width = ref.current.parentElement.scrollWidth - ref.current.parentElement.clientWidth;

        setVisibleFirstDay(left < 80);
        setVisibleLastDay(width - left < 80);
      };

      if (ref.current?.parentElement) {
        ref.current.parentElement.addEventListener('scroll', onScroll);
      }
    }
  }, [ref]);

  const scrollLeft = useCallback(() => {
    const parentElement = ref.current?.parentElement;
    if (parentElement) {
      parentElement.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  const scrollRight = useCallback(() => {
    const parentElement = ref.current?.parentElement;
    if (parentElement) {
      parentElement.scrollTo({
        left: parentElement.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'sticky',
        top: '0px',
        left: '0px',
        zIndex: 10,
      }}
    >
      {visibleFirstDay && extendFrom && (
        // + ...
        <div style={{ position: 'absolute', top: '0px', left: '0px' }} className="headerControl">
          <IconButton onClick={extendFrom}>
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </div>
      )}

      {visibleLastDay && extendTo && (
        // ... +
        <div style={{ position: 'absolute', top: '0px', right: '1px' }} className="headerControl">
          <IconButton onClick={extendTo}>
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </div>
      )}
      {!visibleFirstDay && (
        // << ...
        <div style={{ position: 'absolute', top: '0px', left: '0px' }} className="headerControl">
          <IconButton onClick={scrollLeft}>
            <ArrowCircleLeftIcon fontSize="large" />
          </IconButton>
        </div>
      )}
      {!visibleLastDay && (
        // ... >>
        <div style={{ position: 'absolute', top: '0px', right: '1px' }} className="headerControl">
          <IconButton onClick={scrollRight}>
            <ArrowCircleRightIcon fontSize="large" />
          </IconButton>
        </div>
      )}
    </div>
  );
};
