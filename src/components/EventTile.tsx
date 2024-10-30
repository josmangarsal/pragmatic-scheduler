import {useContext} from 'react';
import {Box, Typography, TypographyProps, styled} from '@mui/material';
import {CalEvent} from '../types';
import {format} from 'date-fns';
import {SchedulerContext} from './Scheduler';
import useEventInfoFlow from '../hooks/useEventInfoFlow';

const Container = styled(Box)(({theme}) => ({
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  height: '100%',
}));

const InnerText = styled((props: TypographyProps) => <Typography variant="caption" noWrap {...props} />)(() => ({
  display: 'block',
  userSelect: 'none',
}));

export const EventTile = ({event, scrollRef, startTimePx}:
  {event: CalEvent, scrollRef: HTMLDivElement | null, startTimePx: number | null}) => {
  const {EventTile: EventTileOverride} = useContext(SchedulerContext);
  const Component = EventTileOverride || DefaultEventTile;
  return <Component event={event} scrollRef={scrollRef} startTimePx={startTimePx} />;
};
EventTile.displayName = 'EventTile';

const DefaultEventTile = ({event, scrollRef, startTimePx}:
  {event: CalEvent, scrollRef: HTMLDivElement | null, startTimePx: number | null}) => {

  const left = useEventInfoFlow(scrollRef, startTimePx);

  return (
    <Container key={event.id} bgcolor={event.bgColor || 'primary.main'} style={{cursor: 'move'}}>
      <Box className="handle" flex={1} padding={1}
        style={{width: 'fit-content', position: 'sticky', left: left}}
      >
        <InnerText fontWeight="bold" color={event.textColor || 'text.primary'}>
          {event.title}
        </InnerText>
        <InnerText color={event.textColor || 'text.primary'}>
          {`${format(event.startTime, 'HH:mm')} - ${format(event.endTime, 'HH:mm')}`}
        </InnerText>
      </Box>
    </Container>
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
