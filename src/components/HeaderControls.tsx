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
import { setHours, startOfToday } from 'date-fns';

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
        <FloatingHeaderControl right="120px">
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
        <FloatingHeaderControl right="120px">
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
      {showGoNow && (
        <FloatingHeaderControl right="80px">
          {GoNowIconButton ? (
            <GoNowIconButton onClick={handleGoNow} />
          ) : (
            <IconButton onClick={handleGoNow}>
              <ScheduleRoundedIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {lockNow && (
        <FloatingHeaderControl right="40px">
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
