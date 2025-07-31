import React, { useMemo } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Box, BoxProps, styled } from '@mui/material';
import { ScheduleDay, Resource, CalEvent, Config, DivisionDetail, GridCellLayout } from '../types';
import { addDays, endOfDay, isSameDay, startOfDay } from 'date-fns';
import { defaultConfig, defaultDivisionDetails } from '../constants/defaults';
import { useDateToDivisions } from '../hooks/useDateToDivisions';
import { TimelineView } from '../views/TimelineView';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    tableHeader: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    tableHeader?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    tableHeader: true;
  }
}
export const SchedulerContext = React.createContext<{
  activeDate: Date;
  days: ScheduleDay[];
  resources: Resource[];
  events: CalEvent[];
  config: Config;
  calendarBounds: { start: Date; end: Date; range: number; totalDivisions: number };
  onEventChange?: (event: CalEvent) => void;
  HeaderRow?: React.FC<{ days: ScheduleDay[] }>;
  ResourceCell?: React.FC<{ resource: Resource }>;
  ResourceHeader?: React.FC;
  UnassignedHeader?: React.FC;
  UnAssignedBoxProps?: BoxProps;
  GridCell?: React.FC<{ layout: GridCellLayout }>;
  EventTile?: React.FC<{ event: CalEvent }>;
  extendFrom?: () => void;
  extendTo?: () => void;
  ExtendLeftIconButton?: React.FC<{ onClick: () => void }>;
  ExtendRightIconButton?: React.FC<{ onClick: () => void }>;
  ScrollLeftIconButton?: React.FC<{ onClick: () => void }>;
  ScrollRightIconButton?: React.FC<{ onClick: () => void }>;
  goNow?: boolean;
  lockNow?: boolean;
  GoNowIconButton?: React.FC<{ onClick: () => void }>;
  LockNowIconButton?: React.FC<{ locked: boolean; onClick: () => void }>;
}>({
  activeDate: new Date(),
  days: [],
  resources: [],
  events: [],
  config: defaultConfig,
  calendarBounds: { start: new Date(), end: new Date(), range: 0, totalDivisions: 0 },
});

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const Scheduler = ({
  activeDate,
  divisionDetails = defaultDivisionDetails,
  resources,
  events,
  config = defaultConfig,
  onEventChange,
  HeaderRow,
  ResourceCell,
  ResourceHeader,
  UnassignedHeader,
  UnAssignedBoxProps,
  GridCell,
  EventTile,
  extendFrom,
  extendTo,
  ExtendLeftIconButton,
  ExtendRightIconButton,
  ScrollLeftIconButton,
  ScrollRightIconButton,
  firstDay: firstDayProp,
  lastDay: lastDayProp,
  goNow = false,
  lockNow = false,
  GoNowIconButton,
  LockNowIconButton,
}: {
  activeDate: Date;
  divisionDetails?: DivisionDetail[];
  resources: Resource[];
  events: CalEvent[];
  config?: Config;
  onEventChange?: (event: CalEvent) => void;
  HeaderRow?: React.FC<{ days: ScheduleDay[] }>;
  ResourceCell?: React.FC<{ resource: Resource }>;
  ResourceHeader?: React.FC;
  UnassignedHeader?: React.FC;
  UnAssignedBoxProps?: BoxProps;
  GridCell?: React.FC<{ layout: GridCellLayout }>;
  EventTile?: React.FC<{ event: CalEvent }>;
  extendFrom?: () => void;
  extendTo?: () => void;
  ExtendLeftIconButton?: React.FC<{ onClick: () => void }>;
  ExtendRightIconButton?: React.FC<{ onClick: () => void }>;
  ScrollLeftIconButton?: React.FC<{ onClick: () => void }>;
  ScrollRightIconButton?: React.FC<{ onClick: () => void }>;
  firstDay?: Date;
  lastDay?: Date;
  goNow?: boolean;
  lockNow?: boolean;
  GoNowIconButton?: React.FC<{ onClick: () => void }>;
  LockNowIconButton?: React.FC<{ onClick: () => void }>;
}) => {
  const { dateToDivisions } = useDateToDivisions();

  const firstDay = useMemo(
    () => firstDayProp ?? startOfDay(addDays(activeDate, -1 * (config.previousDaysToDisplay ?? 0))),
    [activeDate, config.previousDaysToDisplay, firstDayProp],
  );

  const lastDay = useMemo(
    () => lastDayProp ?? endOfDay(addDays(firstDay, config.daysToDisplay)),
    [lastDayProp, firstDay, config.daysToDisplay],
  );

  const days = useMemo(() => {
    const date = new Date(firstDay);
    const days: ScheduleDay[] = [];
    while (date <= lastDay) {
      days.push(dateToDivisions(date, divisionDetails));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [dateToDivisions, divisionDetails, firstDay, lastDay]);

  const range = useMemo(() => lastDay.getTime() - firstDay.getTime(), [firstDay, lastDay]);

  const totalDivisions = useMemo(() => days.reduce((acc, day) => acc + day.divisions.length, 0), [days]);

  const daysWithDivisionsOrder: ScheduleDay[] = useMemo(() => {
    const daysWithDivisionsOrder: ScheduleDay[] = [];
    let order = 0;
    for (const day of days) {
      const divisions = day.divisions.map((division) => ({ ...division, order: order++ }));
      daysWithDivisionsOrder.push({ ...day, divisions });
    }
    return daysWithDivisionsOrder;
  }, [days]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDay = days.find((day) => isSameDay(day.date, event.startTime));
      if (eventDay) {
        return (
          (event.startTime >= eventDay.date && event.startTime <= eventDay.dateEnd) ||
          (event.endTime >= eventDay.date && event.endTime <= eventDay.dateEnd)
        );
      }

      return (
        (event.startTime >= firstDay && event.startTime <= lastDay) ||
        (event.endTime >= firstDay && event.endTime <= lastDay)
      );
    });
  }, [days, events, firstDay, lastDay]);

  return (
    <SchedulerContext.Provider
      value={{
        activeDate: activeDate,
        resources: resources,
        days: daysWithDivisionsOrder,
        events: filteredEvents,
        config: config,
        calendarBounds: { start: firstDay, end: lastDay, range: range, totalDivisions: totalDivisions },
        onEventChange: onEventChange,
        HeaderRow: HeaderRow,
        ResourceCell: ResourceCell,
        ResourceHeader: ResourceHeader,
        UnassignedHeader: UnassignedHeader,
        UnAssignedBoxProps: UnAssignedBoxProps,
        GridCell: GridCell,
        EventTile: EventTile,
        extendFrom: extendFrom,
        extendTo: extendTo,
        ExtendLeftIconButton: ExtendLeftIconButton,
        ExtendRightIconButton: ExtendRightIconButton,
        ScrollLeftIconButton: ScrollLeftIconButton,
        ScrollRightIconButton: ScrollRightIconButton,
        goNow: goNow,
        lockNow: lockNow,
        GoNowIconButton: GoNowIconButton,
        LockNowIconButton: LockNowIconButton,
      }}
    >
      <Container>
        <TimelineView />
      </Container>
    </SchedulerContext.Provider>
  );
};
