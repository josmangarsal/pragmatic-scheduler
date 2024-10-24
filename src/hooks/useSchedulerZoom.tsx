import React, {useCallback, useMemo, useState} from 'react';
import {MenuItem, Select} from '@mui/material';
import {IntervalOption} from '../types';

const defaultIntervals: IntervalOption[] = [
  {label: '15 minutes', value: 0.25},
  {label: '30 minutes', value: 0.5},
  {label: '1 hour', value: 1},
  {label: '2 hours', value: 2},
];

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

  return {
    currentInterval,
    zoomControl
  };
};

export default useSchedulerZoom;
