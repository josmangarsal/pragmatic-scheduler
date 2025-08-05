import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Scheduler } from '../components/Scheduler';
import { CalEvent } from '../types';
import { SchedulerDateControls } from '../components/SchedulerDateControls';
import { events as rawEvents, resources } from '../data/daily';
import { startOfToday, setHours, setMinutes, addDays } from 'date-fns';
import { useSchedulerIntervals } from '../hooks/useSchedulerIntervals';

function DailyZoom() {
  // Start position
  const [activeDate, setActiveDate] = useState(setHours(startOfToday(), 18));
  // second param (month) start from 0 jan
  const [events, setEvents] = useState<CalEvent[]>(rawEvents);

  const { controls, currentInterval, extendFrom, extendTo, config, divisionDetails } = useSchedulerIntervals(
    activeDate,
    // {
    //  // Uncomment to test with dates different that 00:00
    //   startDate: setMinutes(setHours(startOfToday(), 7), 15),
    //   endDate: addDays(setMinutes(setHours(startOfToday(), 19), 15), 1),
    //   // BE CAREFUL! multiple of interval time (2 hours)
    // },
  );

  const handleEventChange = (event: CalEvent) => {
    setEvents((prevEvents) => {
      // Add new event
      if (event.id.includes('NewEvent_')) {
        return [
          ...prevEvents,
          {
            ...event,
            id: Date.now().toString(), // Generate a unique ID
          },
        ];
      }

      // Update existing event
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
        {controls}
      </Box>
      <Scheduler
        key={`${currentInterval}`} // force re-render scheduler on update view interval
        activeDate={activeDate}
        resources={resources}
        events={events}
        divisionDetails={divisionDetails}
        onEventChange={handleEventChange}
        config={{
          ...config,
          // rowsToDisplay: 2, // uncomment to test with 2 rows and see how scroll works
        }}
        extendFrom={extendFrom} // don't pass to hide extend button
        extendTo={extendTo}
        // Uncomment to test with dates different that 00:00
        // firstDay={setMinutes(setHours(startOfToday(), 7), 15)}
        // lastDay={addDays(setMinutes(setHours(startOfToday(), 19), 15), 1)}
        // Uncomment to enable go to now buttons
        // goNow
        // lockNow
        // Uncomment to test with dnd creating event
        dndCreatingEvent
      />
    </>
  );
}

export default DailyZoom;
