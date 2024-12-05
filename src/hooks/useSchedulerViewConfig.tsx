import {useMemo} from 'react';
import {Config} from '../types';
import {defaultConfig} from '../constants/defaults';

const useSchedulerViewConfig = ({view = '3d', interval = 2, prevDays = 0}) => {
  const config: Config = useMemo(() => {
    const currentConfig = {...defaultConfig};

    switch (view) {
      case '1d':
        currentConfig.daysToDisplay = 0;
        break;
      case '3d':
        currentConfig.daysToDisplay = 2;
        break;
      case '1w':
        currentConfig.divisionParts = 1;
        currentConfig.daysToDisplay = 6;
        break;
      default:
    }

    switch (interval) {
      case 0.25: // 15 minutes
        currentConfig.divisionWidth = 160 / 2;
        break;
      case 24: // 1 day
        currentConfig.divisionWidth = 160 * 2;
        break;
      case 24 * 7: // 1 week
        currentConfig.divisionWidth = 160 * 4;
        break;
      default:
    }

    currentConfig.previousDaysToDisplay = prevDays;
    currentConfig.daysToDisplay += currentConfig.previousDaysToDisplay;

    return currentConfig;
  }, [view, interval, prevDays]);

  return {
    currentInterval: interval,
    config: config
  };
};

export default useSchedulerViewConfig;
