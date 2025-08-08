import { useState, useEffect, useCallback, useMemo } from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { addDays, differenceInDays, startOfToday } from 'date-fns';
import { IntervalOption, SchedulerViewControlsProps } from '../types';

const intervalOptions: IntervalOption[] = [
  { label: '15 minutes', value: 0.25 },
  { label: '30 minutes', value: 0.5 },
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '1 day', value: 24 },
];

export const useSchedulerViewControls = (
  initialDate: Date,
  {
    startDate: startDateProp,
    setStartDate: setStartDateProp,
    endDate: endDateProp,
    setEndDate: setEndDateProp,
    interval: intervalProp,
  }: SchedulerViewControlsProps = {},
) => {
  const [startDate, setStartDate] = useState<Date>(startOfToday());
  const [endDate, setEndDate] = useState<Date>(addDays(startOfToday(), 2));

  const [currentStartDate, setCurrentStartDate] = useMemo(
    () => [startDateProp ?? startDate, setStartDateProp ?? setStartDate],
    [startDateProp, startDate, setStartDateProp],
  );

  const [currentEndDate, setCurrentEndDate] = useMemo(
    () => [endDateProp ?? endDate, setEndDateProp ?? setEndDate],
    [endDateProp, endDate, setEndDateProp],
  );

  const [currentDaysToDisplay, setCurrentDaysToDisplay] = useState<number>(3);
  const [currentInterval, setCurrentInterval] = useState<number>(2);
  const [currentPrevDays, setCurrentPrevDays] = useState<number>(0);

  // Update view according start/end dates
  useEffect(() => {
    const updatedCurrentDaysToDisplay = differenceInDays(currentEndDate, initialDate);
    if (updatedCurrentDaysToDisplay !== currentDaysToDisplay) {
      setCurrentDaysToDisplay(updatedCurrentDaysToDisplay);
    }

    const updatedCurrentPrevDays = differenceInDays(initialDate, currentStartDate);
    if (updatedCurrentPrevDays !== currentPrevDays) {
      setCurrentPrevDays(updatedCurrentPrevDays);
    }
  }, [initialDate, currentStartDate, currentEndDate, currentDaysToDisplay, currentPrevDays]);

  // Update startDate and endDate when initialDate changes
  /*
  const prevInitialDate = useRef<Date | null>(null);
  useEffect(() => {
    if (!prevInitialDate.current) {
      prevInitialDate.current = initialDate;
      return;
    }

    if (initialDate.getTime() > prevInitialDate.current.getTime()) {
      const initialDateShift = differenceInDays(initialDate, prevInitialDate.current);

      const updatedCurrentStartDate = addDays(currentStartDate, initialDateShift);
      if (updatedCurrentStartDate.getTime() !== currentStartDate.getTime()) {
        setCurrentStartDate(updatedCurrentStartDate);
      }

      const updatedCurrentEndDate = addDays(currentEndDate, initialDateShift);
      if (updatedCurrentEndDate.getTime() !== currentEndDate.getTime()) {
        setCurrentEndDate(updatedCurrentEndDate);
      }

      prevInitialDate.current = initialDate;
    } else if (initialDate.getTime() < prevInitialDate.current.getTime()) {
      const initialDateShift = differenceInDays(prevInitialDate.current, initialDate);

      const updatedCurrentStartDate = addDays(currentStartDate, -initialDateShift);
      if (updatedCurrentStartDate.getTime() !== currentStartDate.getTime()) {
        setCurrentStartDate(updatedCurrentStartDate);
      }

      const updatedCurrentEndDate = addDays(currentEndDate, -initialDateShift);
      if (updatedCurrentEndDate.getTime() !== currentEndDate.getTime()) {
        setCurrentEndDate(updatedCurrentEndDate);
      }

      prevInitialDate.current = initialDate;
    }
  }, [initialDate, currentStartDate, currentEndDate, setCurrentStartDate, setCurrentEndDate]);
  */

  const extendFrom = useCallback(() => {
    setCurrentStartDate(addDays(currentStartDate, -1));
  }, [setCurrentStartDate, currentStartDate]);

  const extendTo = useCallback(() => {
    setCurrentEndDate(addDays(currentEndDate, 1));
  }, [currentEndDate, setCurrentEndDate]);

  const changeDates = useCallback(
    (newStartDate: Date, newEndDate: Date) => {
      setCurrentStartDate(newStartDate);
      setCurrentEndDate(newEndDate);
    },
    [setCurrentStartDate, setCurrentEndDate],
  );

  const handleChangeInterval = useCallback((event: SelectChangeEvent) => {
    setCurrentInterval(Number(event.target.value));
  }, []);

  const handleChangeFrom = useCallback(
    (date: Date | null) => {
      if (!date) return;

      if (date > endDate) {
        setEndDate(date);
      }

      setStartDate(date);
    },
    [endDate],
  );

  const handleChangeTo = useCallback(
    (date: Date | null) => {
      if (!date) return;

      if (date < startDate) {
        setStartDate(date);
      }

      setEndDate(date);
    },
    [startDate],
  );

  const controls = useMemo(
    () =>
      startDateProp && endDateProp && intervalProp ? null : (
        <>
          {startDateProp ? null : (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <DatePicker label="From" value={startDate} onChange={handleChangeFrom} />
            </FormControl>
          )}

          {endDateProp ? null : (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <DatePicker label="To" value={endDate} onChange={handleChangeTo} />
            </FormControl>
          )}

          {intervalProp ? null : (
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="interval-select-label">Interval</InputLabel>
              <Select
                labelId="interval-select-label"
                label="Interval"
                value={`${currentInterval}`}
                onChange={handleChangeInterval}
              >
                {intervalOptions.map(({ label, value }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </>
      ),
    [
      startDateProp,
      startDate,
      handleChangeFrom,
      endDateProp,
      endDate,
      handleChangeTo,
      intervalProp,
      currentInterval,
      handleChangeInterval,
    ],
  );

  return {
    controls: controls,
    daysToDisplay: currentDaysToDisplay,
    interval: intervalProp ?? currentInterval,
    prevDays: currentPrevDays,
    extendFrom: extendFrom,
    extendTo: extendTo,
    changeDates: changeDates,
  };
};
