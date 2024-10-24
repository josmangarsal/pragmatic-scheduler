import React, { useMemo, useState } from 'react';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import { Scheduler } from '../components/Scheduler';
import { CalEvent, DivisionDetail } from '../types';
import { SchedulerDateControls } from '../components/SchedulerDateControls';
import { events as rawEvents, resources } from '../data/daily';
import { startOfToday, setHours } from 'date-fns';

function DailyZoom() {
  // Start position
  const [activeDate, setActiveDate] = useState(setHours(startOfToday(), 18));
  // second param (month) start from 0 jan
  const [events, setEvents] = useState<CalEvent[]>(rawEvents);
  // Current zoom level
  const [currentInterval, setCurrentInterval] = useState(1);

  // Zoom options
  const intervalOptions = useMemo(() => ([
    {label: '15 minutes', value: 0.25},
    {label: '30 minutes', value: 0.5},
    {label: '1 hour', value: 1},
    {label: '2 hours', value: 2},
  ]), []);

  const handleEventChange = (event: CalEvent) => {
    setEvents((prevEvents) => {
      const index = prevEvents.findIndex((e) => e.id === event.id);
      const newEvents = [...prevEvents];
      newEvents[index] = event;
      return newEvents;
    });
  };

  const divisionDetailsGenerator = intervalIncrement => {
    // Go from 0 to 24 adding an interval increment
    const divisions: DivisionDetail[] = [];
    let startHour = 0;

    while (startHour < 24) {
      // Move startHour to string time format
      const hours = Math.trunc(startHour).toString().padStart(2, '0');
      const minutes = ((startHour % 1) * 60).toString().padStart(2, '0');

      divisions.push({
        name: `${hours}:${minutes}`,
        startHour: startHour,
        endHour: startHour + intervalIncrement
      });

      startHour += intervalIncrement;
    }

    return divisions;
  };

  const divisionDetails = useMemo(()=> (
    divisionDetailsGenerator(currentInterval)
  ), [currentInterval]);

  return (
    <>
      <Box mb={2} display="flex" alignItems="center" flexDirection="column">
        <Typography variant="h5">Pragmatic Scheduler Demo - Daily with zoom</Typography>
      </Box>
      <Box mb={2} display="flex" justifyContent="center">
        <SchedulerDateControls activeDate={activeDate} setActiveDate={setActiveDate} />
      </Box>
      <Box mb={2} display="flex" justifyContent="center">
        <Select
          value={currentInterval}
          label="Zoom"
          onChange={e => setCurrentInterval(e.target.value as number)}
        >
          {intervalOptions.map(({label, value}) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </Select>
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
