import { MutableRefObject, useContext, useMemo } from 'react';
import { Box, Tooltip, Typography, TypographyProps, styled } from '@mui/material';
import { CalEvent, InfoFlowData, OverflowData } from '../types';
import { differenceInCalendarDays, format } from 'date-fns';
import { SchedulerContext } from './Scheduler';
import { useEventInfoFlow } from '../hooks/useEventInfoFlow';

const Container = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  height: '100%',
}));

const InnerText = styled((props: TypographyProps) => <Typography variant="caption" noWrap {...props} />)(() => ({
  display: 'block',
  userSelect: 'none',
}));

export const EventTile = ({
  event,
  infoFlowData,
  overflowData,
}: {
  event: CalEvent;
  infoFlowData: InfoFlowData | null;
  overflowData?: OverflowData;
}) => {
  const { EventTile: EventTileOverride } = useContext(SchedulerContext);
  const Component = EventTileOverride || DefaultEventTile;

  const { contentRef, isContentVisible, isEllipsis } = useEventInfoFlow(infoFlowData);

  const showTooltip = useMemo(() => !isContentVisible || isEllipsis, [isContentVisible, isEllipsis]);

  const { leftOverflow, middleOverflow, rightOverflow } = useMemo(
    () =>
      overflowData ?? {
        leftOverflow: false,
        middleOverflow: null,
        rightOverflow: false,
      },
    [overflowData],
  );

  return (
    <Component
      event={event}
      contentRef={contentRef}
      showTooltip={showTooltip}
      showLeftOverflow={leftOverflow}
      middleOverflowPxLeft={middleOverflow}
      showRightOverflow={rightOverflow}
    />
  );
};
EventTile.displayName = 'EventTile';

const DefaultEventTile = ({
  event,
  tooltip,
  contentRef,
  showTooltip,
  showLeftOverflow,
  middleOverflowPxLeft,
  showRightOverflow,
}: {
  event: CalEvent;
  tooltip?: React.ReactNode;
  contentRef?: MutableRefObject<HTMLDivElement | undefined>;
  showTooltip?: boolean;
  showLeftOverflow?: boolean;
  middleOverflowPxLeft?: number | null;
  showRightOverflow?: boolean;
}) => {
  const title = useMemo(() => event.title || 'No Title', [event.title]);

  const endTimeDiffDays = useMemo(
    () => differenceInCalendarDays(event.endTime, event.startTime),
    [event.startTime, event.endTime],
  );

  const subtitle = useMemo(
    () =>
      `
    ${format(event.startTime, 'HH:mm')} - ${format(event.endTime, 'HH:mm')}
    ${endTimeDiffDays > 0 ? ` (+${endTimeDiffDays} day${endTimeDiffDays > 1 ? 's' : ''})` : ''}
    `,
    [event, endTimeDiffDays],
  );

  const overflowStyle = useMemo(() => {
    const s: React.CSSProperties = {};

    if (showLeftOverflow) {
      s.borderLeft = `2px dashed color-mix(in srgb, ${event.bgColor || 'primary.main'} 80%, black)`;
      s.borderTopLeftRadius = 0;
      s.borderBottomLeftRadius = 0;
    }

    if (showRightOverflow) {
      s.borderRight = `2px dashed color-mix(in srgb, ${event.bgColor || 'primary.main'} 80%, black)`;
      s.borderTopRightRadius = 0;
      s.borderBottomRightRadius = 0;
    }

    return s;
  }, [event.bgColor, showLeftOverflow, showRightOverflow]);

  const middleOverflow = useMemo(() => {
    if (middleOverflowPxLeft) {
      return (
        <div
          style={{
            position: 'absolute',
            left: middleOverflowPxLeft,
            top: 0,
            width: '0px',
            height: '100%',
            borderRight: `2px dashed color-mix(in srgb, ${event.bgColor || 'primary.main'} 80%, black)`,
          }}
        ></div>
      );
    }

    return null;
  }, [event.bgColor, middleOverflowPxLeft]);

  const eventContent = useMemo(
    () => (
      <Container
        key={event.id}
        bgcolor={event.bgColor || 'primary.main'}
        style={{
          cursor: 'move',
          ...overflowStyle,
        }}
      >
        {middleOverflow}
        <Box
          ref={contentRef}
          className="handle"
          flex={1}
          padding={1}
          style={{ width: 'fit-content', position: 'sticky', left: 0 }}
        >
          <InnerText fontWeight="bold" color={event.textColor || 'text.primary'}>
            {title}
          </InnerText>
          <InnerText color={event.textColor || 'text.primary'}>{subtitle}</InnerText>
        </Box>
      </Container>
    ),
    [contentRef, event.bgColor, event.id, event.textColor, middleOverflow, overflowStyle, subtitle, title],
  );

  const eventTooltip = useMemo(
    () =>
      tooltip ?? (
        <Box>
          <InnerText fontWeight="bold">{title}</InnerText>
          <InnerText>{subtitle}</InnerText>
        </Box>
      ),
    [subtitle, title, tooltip],
  );

  return (
    <Tooltip
      title={!showTooltip ? null : eventTooltip}
      followCursor
      disableHoverListener={!showTooltip}
      disableFocusListener={!showTooltip}
      disableTouchListener={!showTooltip}
    >
      {eventContent}
    </Tooltip>
  );
};

// export const EventTile = React.forwardRef(({ event, children, ...otherProps }:
// { event: CalEvent } & BoxProps, ref) => {
//   return (
//     <Container ref={ref} key={event.id} bgcolor={event.bgColor || 'primary.main'} {...otherProps}>
//       <Box className="handle" flex={1} sx={{ cursor: 'move', overflow: 'hidden' }} padding={1}>
//         <InnerText fontWeight="bold" color={event.textColor || 'text.primary'}>
//           {event.title}
//         </InnerText>
//         <InnerText color={event.textColor || 'text.primary'}>
//           {`${format(event.startTime, 'HHmm')}-${format(event.endTime, 'HHmm')}`}
//         </InnerText>
//       </Box>
//       {children}
//     </Container>
//   );
// });
// EventTile.displayName = 'EventTile';
