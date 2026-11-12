/** @jsxImportSource @emotion/react */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SchedulerContext } from './Scheduler';
import { IconButton } from '@mui/material';
import styled from '@emotion/styled';
import LockClockRoundedIcon from '@mui/icons-material/LockClockRounded';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { dateToPosition } from '../helpers/datePositionHelper';
import { addDays } from 'date-fns/addDays';
import { addMinutes } from 'date-fns/addMinutes';
import { startOfDay } from 'date-fns/startOfDay';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import AddIcon from '@mui/icons-material/Add';

const DAY_NAV_MARGIN_PX = 40;

interface HeaderProps {
  left?: string;
  right?: string;
}

const FloatingHeaderControl = styled.div<HeaderProps>`
  position: absolute;
  top: 0px;
  left: ${(props) => props.left || 'auto'};
  right: ${(props) => props.right || 'auto'};
`;

export const HeaderControls = ({ eventsBoxElement }: { eventsBoxElement: HTMLDivElement | null }) => {
  const {
    extendFrom,
    extendTo,
    changeDates,
    extendWithScroll,
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
  const [initializedNow, setInitializedNow] = useState(false);

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

  const moveDatesLeft = useCallback(() => {
    if (changeDates) {
      changeDates(addDays(start, -1), addDays(end, -1));
    }
  }, [changeDates, start, end]);

  const moveDatesRight = useCallback(() => {
    if (changeDates) {
      changeDates(addDays(start, 1), addDays(end, 1));
    }
  }, [changeDates, start, end]);

  const showScrollLeft = useMemo(() => {
    if (extendWithScroll && !changeDates) return true;

    return !visibleFirstDay;
  }, [changeDates, extendWithScroll, visibleFirstDay]);

  const showScrollRight = useMemo(() => {
    if (extendWithScroll && !changeDates) return true;

    return !visibleLastDay;
  }, [changeDates, extendWithScroll, visibleLastDay]);

  const showExtendLeft = useMemo(() => {
    if (extendWithScroll) return false;

    return visibleFirstDay && extendFrom;
  }, [extendFrom, extendWithScroll, visibleFirstDay]);

  const showExtendRight = useMemo(() => {
    if (extendWithScroll) return false;

    return visibleLastDay && extendTo;
  }, [extendTo, extendWithScroll, visibleLastDay]);

  const showMoveDatesLeft = useMemo(() => {
    if (!extendWithScroll) return false;

    return visibleFirstDay && changeDates;
  }, [changeDates, extendWithScroll, visibleFirstDay]);

  const showMoveDatesRight = useMemo(() => {
    if (!extendWithScroll) return false;

    return visibleLastDay && changeDates;
  }, [changeDates, extendWithScroll, visibleLastDay]);

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

  useEffect(() => {
    // If go now is enabled and now is within the visible range, go now to init view
    if (showGoNow && !initializedNow) {
      handleGoNow();
      setInitializedNow(true);
    }
  }, [goNow, handleGoNow, initializedNow, showGoNow]);

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

  const [viewport, setViewport] = useState({ left: 0, width: 0, scrollWidth: 0 });

  useEffect(() => {
    const el = eventsBoxElement;
    if (!el) return;

    const update = () => setViewport({ left: el.scrollLeft, width: el.clientWidth, scrollWidth: el.scrollWidth });

    update();
    el.addEventListener('scroll', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [eventsBoxElement]);

  const dayNav = useMemo(() => {
    if (!viewport.scrollWidth || !viewport.width) return null;

    const toPx = (date: Date) => dateToPosition(date, start, end, viewport.scrollWidth);
    const fromPx = (px: number) =>
      new Date(start.getTime() + (px / viewport.scrollWidth) * (end.getTime() - start.getTime()));

    const day = startOfDay(fromPx(viewport.left));
    const dayStart = day < start ? start : day;
    const dayEndRaw = addMinutes(addDays(day, 1), -1);
    const dayEnd = dayEndRaw > end ? end : dayEndRaw;
    const viewRight = viewport.left + viewport.width;
    const nowPx = toPx(new Date());
    const nowInRange = start < new Date() && end > new Date();

    const showStart = toPx(dayStart) < viewport.left - DAY_NAV_MARGIN_PX;
    const showEnd = toPx(dayEnd) > viewRight + DAY_NAV_MARGIN_PX;
    const showNow = nowInRange && (nowPx < viewport.left || nowPx > viewRight);

    return { dayStart, dayEnd, showStart, showEnd, showNow };
  }, [end, start, viewport]);

  const scrollToDate = useCallback(
    (date: Date, align: 'start' | 'end' | 'center') => {
      if (!eventsBoxElement) return;
      const px = dateToPosition(date, start, end, eventsBoxElement.scrollWidth);
      const offset =
        align === 'start' ? 0 : align === 'end' ? eventsBoxElement.clientWidth : eventsBoxElement.clientWidth / 2;
      eventsBoxElement.scrollTo({ left: px - offset, behavior: 'smooth' });
    },
    [end, eventsBoxElement, start],
  );

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
      {dayNav?.showStart && (
        <FloatingHeaderControl left="130px">
          <IconButton size="small" title="Go to start of day" onClick={() => scrollToDate(dayNav.dayStart, 'start')}>
            <FirstPageIcon />
          </IconButton>
        </FloatingHeaderControl>
      )}
      {dayNav?.showEnd && (
        <FloatingHeaderControl left={dayNav.showStart ? '165px' : '130px'}>
          <IconButton size="small" title="Go to end of day" onClick={() => scrollToDate(dayNav.dayEnd, 'end')}>
            <LastPageIcon />
          </IconButton>
        </FloatingHeaderControl>
      )}
      {dayNav?.showNow && !showGoNow && (
        <FloatingHeaderControl left={`${130 + 35 * (Number(dayNav.showStart) + Number(dayNav.showEnd))}px`}>
          <IconButton size="small" title="Go to now" onClick={() => scrollToDate(new Date(), 'center')}>
            <ScheduleRoundedIcon />
          </IconButton>
        </FloatingHeaderControl>
      )}
      {showScrollLeft && (
        // < ...
        <FloatingHeaderControl right={leftSidePx}>
          {ScrollLeftIconButton ? (
            <ScrollLeftIconButton onClick={scrollLeft} disabled={visibleFirstDay} />
          ) : (
            <IconButton onClick={scrollLeft} disabled={visibleFirstDay}>
              <KeyboardArrowLeftIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {showExtendLeft && extendFrom && (
        // + ...
        <FloatingHeaderControl right={leftSidePx}>
          {ExtendLeftIconButton ? (
            <ExtendLeftIconButton onClick={extendFrom} />
          ) : (
            <IconButton onClick={extendFrom}>
              <AddIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {showMoveDatesLeft && (
        // << ...
        <FloatingHeaderControl right={leftSidePx}>
          {ExtendLeftIconButton ? (
            <ExtendLeftIconButton onClick={moveDatesLeft} />
          ) : (
            <IconButton onClick={moveDatesLeft}>
              <KeyboardDoubleArrowLeftRoundedIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {showScrollRight && (
        // ... >
        <FloatingHeaderControl right={rightSidePx}>
          {ScrollRightIconButton ? (
            <ScrollRightIconButton onClick={scrollRight} disabled={visibleLastDay} />
          ) : (
            <IconButton onClick={scrollRight} disabled={visibleLastDay}>
              <KeyboardArrowRightIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {showExtendRight && extendTo && (
        // ... +
        <FloatingHeaderControl right={rightSidePx}>
          {ExtendRightIconButton ? (
            <ExtendRightIconButton onClick={extendTo} />
          ) : (
            <IconButton onClick={extendTo}>
              <AddIcon fontSize="large" />
            </IconButton>
          )}
        </FloatingHeaderControl>
      )}
      {showMoveDatesRight && (
        // ... >>
        <FloatingHeaderControl right={rightSidePx}>
          {ExtendRightIconButton ? (
            <ExtendRightIconButton onClick={moveDatesRight} />
          ) : (
            <IconButton onClick={moveDatesRight}>
              <KeyboardDoubleArrowRightRoundedIcon fontSize="large" />
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
