import { MutableRefObject, useContext, useMemo } from 'react';
import { Box, Tooltip, Typography, TypographyProps, styled } from '@mui/material';
import { CalEvent, InfoFlowData } from '../types';
import { format } from 'date-fns';
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

export const EventTile = ({ event, infoFlowData }: { event: CalEvent; infoFlowData: InfoFlowData | null }) => {
  const { EventTile: EventTileOverride } = useContext(SchedulerContext);
  const Component = EventTileOverride || DefaultEventTile;

  const { contentRef, isContentVisible, isEllipsis } = useEventInfoFlow(infoFlowData);

  const showTooltip = useMemo(() => !isContentVisible || isEllipsis, [isContentVisible, isEllipsis]);

  return <Component event={event} contentRef={contentRef} showTooltip={showTooltip} />;
};
EventTile.displayName = 'EventTile';

const DefaultEventTile = ({
  event,
  tooltip,
  contentRef,
  showTooltip,
}: {
  event: CalEvent;
  tooltip?: React.ReactNode;
  contentRef?: MutableRefObject<HTMLDivElement | undefined>;
  showTooltip?: boolean;
}) => {
  const eventContent = useMemo(
    () => (
      <Container key={event.id} bgcolor={event.bgColor || 'primary.main'} style={{ cursor: 'move' }}>
        <Box
          ref={contentRef}
          className="handle"
          flex={1}
          padding={1}
          style={{ width: 'fit-content', position: 'sticky', left: 0 }}
        >
          <InnerText fontWeight="bold" color={event.textColor || 'text.primary'}>
            {event.title}
          </InnerText>
          <InnerText color={event.textColor || 'text.primary'}>
            {`${format(event.startTime, 'HH:mm')} - ${format(event.endTime, 'HH:mm')}`}
          </InnerText>
        </Box>
      </Container>
    ),
    [event, contentRef],
  );

  const eventTooltip = useMemo(
    () =>
      tooltip ?? (
        <Box>
          <InnerText fontWeight="bold">{event.title}</InnerText>
          <InnerText>{`${format(event.startTime, 'HH:mm')} - ${format(event.endTime, 'HH:mm')}`}</InnerText>
        </Box>
      ),
    [event, tooltip],
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
