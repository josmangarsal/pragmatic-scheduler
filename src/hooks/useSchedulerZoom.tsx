import React, {useCallback, useMemo, useState} from 'react';
import {MenuItem, Select} from '@mui/material';
import {Config, IntervalOption} from '../types';
import {defaultConfig} from '../constants/defaults';

const defaultIntervals: IntervalOption[] = [
  {label: '15 minutes (1 day view)', value: 0.25},
  {label: '30 minutes (1 day view)', value: 0.5},
  {label: '1 hour (3 days view)', value: 1},
  {label: '2 hours (3 days view)', value: 2},
  {label: '1 day (1 week view)', value: 24},
  // {label: '1 week (1 month view)', value: 24 * 7},
  // {label: '1 month (12 months view)', value: 24 * 31},
];

// TODO
// Divisions: 15', 30', 1h, 2h, 1d
// View:
// Current week view
// Current month view

const useSchedulerZoom = (defaultZoom = 1, intervalOptions: IntervalOption[] = defaultIntervals) => {
  const [currentInterval, setCurrentInterval] = useState<number>(defaultZoom);

  const handleChangeZoom = useCallback(event => {
    setCurrentInterval(event.target.value as number);
  }, []);

  const zoomControl = useMemo(() => (
    <Select
      value={currentInterval}
      label="Zoom"
      onChange={handleChangeZoom}
    >
      {
        intervalOptions.map(({label, value}) => (
          <MenuItem key={value} value={value} > {label} </MenuItem>
        ))
      }
    </Select>
  ), [currentInterval, handleChangeZoom, intervalOptions]);

  const config: Config = useMemo(() => {
    switch (currentInterval) {
      case 0.25: // 15 minutes (1 day view)
        return {
          ...defaultConfig,
          divisionWidth: 160 / 2,
          daysToDisplay: 0,
          divisionParts: 3,
          previousDaysToDisplay: 0,
        };
      case 0.5: // 30 minutes (1 day view)
        return {
          ...defaultConfig,
          daysToDisplay: 0,
          divisionParts: 3,
          previousDaysToDisplay: 0,
        }
      case 24: // 1 day (1 week view)
        return {
          ...defaultConfig,
          divisionWidth: 160 * 2,
          divisionParts: 1,
          daysToDisplay: 6,
        };
      default:
        return defaultConfig;
    }
  }, [currentInterval]);

  return {
    currentInterval,
    zoomControl,
    config
  };
};

export default useSchedulerZoom;
