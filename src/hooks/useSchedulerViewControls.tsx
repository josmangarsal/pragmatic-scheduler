import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers';
import {addDays, startOfToday} from 'date-fns';
import {IntervalOption} from '../types';

const intervalOptions: IntervalOption[] = [
  {label: '15 minutes', value: 0.25},
  {label: '30 minutes', value: 0.5},
  {label: '1 hour', value: 1},
  {label: '2 hours', value: 2},
  {label: '1 day', value: 24}
];

const useSchedulerViewControls = activeDate => {
  const [fromDate, setFromDate] = useState<Date>(startOfToday());
  const [toDate, setToDate] = useState<Date>(addDays(startOfToday(), 2));
  
  const [currentDaysToDisplay, setCurrentDaysToDisplay] = useState<number>(3);
  const [currentInterval, setCurrentInterval] = useState<number>(2);
  const [currentPrevDays, setCurrentPrevDays] = useState<number>(0);

  // Update view according from/to dates
  useEffect(() => {
    setCurrentDaysToDisplay(toDate.getDate() - activeDate.getDate());
    setCurrentPrevDays(activeDate.getDate() - fromDate.getDate());
  }, [activeDate, fromDate, toDate]);

  // Update fromDate and toDate when activeDate changes
  const prevActiveDate = useRef<Date | null>(null);
  useEffect(() => {
    if (!prevActiveDate.current) {
      prevActiveDate.current = activeDate;
      return;
    }

    if (activeDate.getDate() > prevActiveDate.current.getDate()) {
      const activeDateShift = activeDate.getDate() - prevActiveDate.current.getDate();
      setFromDate(addDays(fromDate, activeDateShift));
      setToDate(addDays(toDate, activeDateShift));

      prevActiveDate.current = activeDate;
    } else if (activeDate.getDate() < prevActiveDate.current.getDate()) {
      const activeDateShift = prevActiveDate.current.getDate() - activeDate.getDate();
      setFromDate(addDays(fromDate, -activeDateShift));
      setToDate(addDays(toDate, -activeDateShift));

      prevActiveDate.current = activeDate;
    }
  }, [activeDate, fromDate, toDate]);

  const extendFrom = useCallback(() => {
    setFromDate(addDays(fromDate, -1));
  }, [fromDate]);

  const extendTo = useCallback(() => {
    setToDate(addDays(toDate, 1));
  }, [toDate]);

  const handleChangeInterval = useCallback(event => {
    setCurrentInterval(event.target.value);
  }, []);

  const handleChangeFrom = useCallback((date: Date | null) => {
    if (!date) return;

    if (date > toDate) {
      setToDate(date);
    }

    setFromDate(date);
  }, [toDate]);

  const handleChangeTo = useCallback((date: Date | null) => {
    if (!date) return;

    if (date < fromDate) {
      setFromDate(date);
    }

    setToDate(date);
  }, [fromDate]);

  const controls = useMemo(() => ( // TODO Prepare to allow any controller (value, onChange) => {}
    <div>

      <FormControl sx={{m: 1, minWidth: 120}}>
        <DatePicker
          label='From'
          value={fromDate}
          onChange={handleChangeFrom}
        />
      </FormControl>
      
      <FormControl sx={{m: 1, minWidth: 120}}>
        <DatePicker
          label='To'
          value={toDate}
          onChange={handleChangeTo}
        />
      </FormControl>

      <FormControl sx={{m: 1, minWidth: 120}}>
        <InputLabel id='interval-select-label'>Interval</InputLabel>
        <Select
          labelId='interval-select-label'
          label='Interval'
          value={currentInterval}
          onChange={handleChangeInterval}
        >
          {
            intervalOptions.map(({label, value}) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))
          }
        </Select>
      </FormControl>

    </div>
  ), [currentInterval, fromDate, handleChangeFrom, handleChangeInterval, handleChangeTo, toDate]);

  return {
    controls: controls,
    daysToDisplay: currentDaysToDisplay,
    interval: currentInterval,
    prevDays: currentPrevDays,
    extendFrom: extendFrom,
    extendTo: extendTo,
  }
};

export default useSchedulerViewControls;