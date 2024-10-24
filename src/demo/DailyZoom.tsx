import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import {Scheduler} from '../components/Scheduler';
import {CalEvent} from '../types';
import {SchedulerDateControls} from '../components/SchedulerDateControls';
import {events as rawEvents, resources} from '../data/daily';
import {startOfToday, setHours} from 'date-fns';
import useDivisionDetailsGenerator from '../hooks/useDivisionDetailsGenerator';
import useSchedulerZoom from '../hooks/useSchedulerZoom';

function DailyZoom() {
  // Start position
  const [activeDate, setActiveDate] = useState(setHours(startOfToday(), 18));
  // second param (month) start from 0 jan
  const [events, setEvents] = useState<CalEvent[]>(rawEvents);

  const {currentInterval, zoomControl} = useSchedulerZoom();
  const {divisionDetails} = useDivisionDetailsGenerator(currentInterval)

  const handleEventChange = (event: CalEvent) => {
    setEvents((prevEvents) => {
      const index = prevEvents.findIndex((e) => e.id === event.id);
      const newEvents = [...prevEvents];
      newEvents[index] = event;
      return newEvents;
    });
  };

  return (
    <>
      <Box mb={2} display="flex" alignItems="center" flexDirection="column">
        <Typography variant="h5">Pragmatic Scheduler Demo - Daily with zoom</Typography>
      </Box>
      <Box mb={2} display="flex" justifyContent="center">
        <SchedulerDateControls activeDate={activeDate} setActiveDate={setActiveDate} />
      </Box>
      <Box mb={2} display="flex" justifyContent="center">
        {zoomControl}
      </Box>
      <Scheduler
        key={currentInterval} // force render scheduler on update view interval
        activeDate={activeDate}
        resources={resources}
        events={events}
        divisionDetails={divisionDetails}
        onEventChange={handleEventChange}
      />
    </>
  );
}

export default DailyZoom;
