/** @jsxImportSource @emotion/react */
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SchedulerContext } from './Scheduler';
import { IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import styled from '@emotion/styled';

interface HeaderProps {
  left?: string;
  right?: string;
}

const FloatingHeaderControl = styled.div<HeaderProps>`
  position: absolute;
  top: 0px;
  left: ${(props) => props.left || 'auto'};
  right: ${(props) => props.right || 'auto'};
  opacity: 0.3;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

export const HeaderControls = () => {
  const {
    extendFrom,
    extendTo,
    ExtendLeftIconButton,
    ExtendRightIconButton,
    ScrollLeftIconButton,
    ScrollRightIconButton,
  } = useContext(SchedulerContext);

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
        <FloatingHeaderControl left="0px">
          {ExtendLeftIconButton ? (
            <ExtendLeftIconButton onClick={extendFrom} />
          ) : (
            <IconButton onClick={extendFrom}>
              <AddCircleIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}

      {visibleLastDay && extendTo && (
        // ... +
        <FloatingHeaderControl right="1px">
          {ExtendRightIconButton ? (
            <ExtendRightIconButton onClick={extendTo} />
          ) : (
            <IconButton onClick={extendTo}>
              <AddCircleIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {!visibleFirstDay && (
        // << ...
        <FloatingHeaderControl left="0px">
          {ScrollLeftIconButton ? (
            <ScrollLeftIconButton onClick={scrollLeft} />
          ) : (
            <IconButton onClick={scrollLeft}>
              <ArrowCircleLeftIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {!visibleLastDay && (
        // ... >>
        <FloatingHeaderControl right="1px">
          {ScrollRightIconButton ? (
            <ScrollRightIconButton onClick={scrollRight} />
          ) : (
            <IconButton onClick={scrollRight}>
              <ArrowCircleRightIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
    </div>
  );
};
