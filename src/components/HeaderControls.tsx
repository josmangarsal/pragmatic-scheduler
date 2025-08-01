/** @jsxImportSource @emotion/react */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SchedulerContext } from './Scheduler';
import { IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import styled from '@emotion/styled';
import LockClockRoundedIcon from '@mui/icons-material/LockClockRounded';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { dateToPosition } from '../helpers/datePositionHelper';

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

export const HeaderControls = ({ eventsBoxElement }: { eventsBoxElement: HTMLDivElement | null }) => {
  const {
    extendFrom,
    extendTo,
    ExtendLeftIconButton,
    ExtendRightIconButton,
    ScrollLeftIconButton,
    ScrollRightIconButton,
    goNow,
    GoNowIconButton,
    lockNow,
    LockNowIconButton,
    calendarBounds: { start, end },
  } = useContext(SchedulerContext);

  const ref = useRef<HTMLDivElement>(null);

  const [visibleFirstDay, setVisibleFirstDay] = useState(false);
  const [visibleLastDay, setVisibleLastDay] = useState(false);
  const [nowLocked, setNowLocked] = useState(false);

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

  const showGoNow = useMemo(() => {
    if (!goNow) return false;
    // if the current date is within the visible range
    if (start < new Date() && end > new Date()) return true;
    return false;
  }, [goNow, start, end]);

  const handleGoNow = useCallback(() => {
    if (eventsBoxElement) {
      eventsBoxElement.scrollTo({
        left: dateToPosition(new Date(), start, end, eventsBoxElement.scrollWidth) - eventsBoxElement.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [end, eventsBoxElement, start]);

  const handleLockNow = useCallback(() => {
    handleGoNow();
    setNowLocked((prev) => !prev);
  }, [handleGoNow]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (nowLocked) {
      intervalId = setInterval(() => {
        handleGoNow();
      }, 1000 * 10);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [handleGoNow, nowLocked]);

  const leftSidePx = useMemo(() => {
    if (showGoNow && lockNow) {
      return '120px';
    }
    if (showGoNow) {
      return '80px';
    }
    return '40px';
  }, [lockNow, showGoNow]);

  const rightSidePx = useMemo(() => '1px', []);

  const nowSidePx = useMemo(() => {
    if (showGoNow && lockNow) {
      return '80px';
    }
    if (showGoNow) {
      return '40px';
    }
    return '0px';
  }, [lockNow, showGoNow]);

  const lockSidePx = useMemo(() => {
    if (showGoNow && lockNow) {
      return '40px';
    }
    return '0px';
  }, [lockNow, showGoNow]);

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
        <FloatingHeaderControl right={leftSidePx}>
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
        <FloatingHeaderControl right={rightSidePx}>
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
        <FloatingHeaderControl right={leftSidePx}>
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
        <FloatingHeaderControl right={rightSidePx}>
          {ScrollRightIconButton ? (
            <ScrollRightIconButton onClick={scrollRight} />
          ) : (
            <IconButton onClick={scrollRight}>
              <ArrowCircleRightIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {showGoNow && (
        <FloatingHeaderControl right={nowSidePx}>
          {GoNowIconButton ? (
            <GoNowIconButton onClick={handleGoNow} />
          ) : (
            <IconButton onClick={handleGoNow}>
              <ScheduleRoundedIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {showGoNow && lockNow && (
        <FloatingHeaderControl right={lockSidePx}>
          {LockNowIconButton ? (
            <LockNowIconButton locked={nowLocked} onClick={handleLockNow} />
          ) : (
            <IconButton onClick={handleLockNow}>
              {nowLocked ? <LockClockRoundedIcon fontSize="large" /> : <LockClockOutlinedIcon fontSize="large" />}
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
    </div>
  );
};
