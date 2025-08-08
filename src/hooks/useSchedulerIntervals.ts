import { SchedulerViewControlsProps } from '../types';
import { useDivisionDetailsGenerator } from './useDivisionDetailsGenerator';
import { useSchedulerViewConfig } from './useSchedulerViewConfig';
import { useSchedulerViewControls } from './useSchedulerViewControls';

export const useSchedulerIntervals = (
  activeDate: Date,
  { startDate, setStartDate, endDate, setEndDate, interval }: SchedulerViewControlsProps = {},
) => {
  const { controls, extendFrom, extendTo, changeDates, ...viewConfigValues } = useSchedulerViewControls(activeDate, {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    interval,
  });
  const { currentInterval, config } = useSchedulerViewConfig(viewConfigValues);
  const { divisionDetails } = useDivisionDetailsGenerator(currentInterval, { startDate, endDate });

  return {
    controls,
    currentInterval,
    extendFrom,
    extendTo,
    changeDates,
    config,
    divisionDetails,
  };
};
