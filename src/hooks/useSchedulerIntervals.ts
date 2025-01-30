import { SchedulerViewControlsProps } from '../types';
import { useDivisionDetailsGenerator } from './useDivisionDetailsGenerator';
import { useSchedulerViewConfig } from './useSchedulerViewConfig';
import { useSchedulerViewControls } from './useSchedulerViewControls';

export const useSchedulerIntervals = (
  activeDate: Date,
  { startDate, endDate, interval }: SchedulerViewControlsProps = {},
) => {
  const { controls, extendFrom, extendTo, ...viewConfigValues } = useSchedulerViewControls(activeDate, {
    startDate,
    endDate,
    interval,
  });
  const { currentInterval, config } = useSchedulerViewConfig(viewConfigValues);
  const { divisionDetails } = useDivisionDetailsGenerator(currentInterval);

  return {
    controls,
    currentInterval,
    extendFrom,
    extendTo,
    config,
    divisionDetails,
  };
};
