import { useMemo } from 'react';
import { Config } from '../types';
import { defaultConfig } from '../constants/defaults';

export const useSchedulerViewConfig = ({ daysToDisplay = 3, interval = 2, prevDays = 0 }) => {
  const config: Config = useMemo(() => {
    const currentConfig = { ...defaultConfig };

    currentConfig.daysToDisplay = daysToDisplay;

    if (currentConfig.daysToDisplay >= 6) {
      currentConfig.divisionParts = 1;
    }

    switch (interval) {
      case 0.25: // 15 minutes
        // currentConfig.divisionWidth = 160 / 2;
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
    currentConfig.unAssignedRows = 0;

    return currentConfig;
  }, [daysToDisplay, interval, prevDays]);

  return {
    currentInterval: interval,
    config: config,
  };
};
