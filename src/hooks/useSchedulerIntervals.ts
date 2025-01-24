import {useDivisionDetailsGenerator} from './useDivisionDetailsGenerator';
import {useSchedulerViewConfig} from './useSchedulerViewConfig';
import {useSchedulerViewControls} from './useSchedulerViewControls';

export const useSchedulerIntervals = (activeDate: Date) => {
  const {controls, extendFrom, extendTo, ...viewConfigValues} = useSchedulerViewControls(activeDate);
  const {currentInterval, config} = useSchedulerViewConfig(viewConfigValues);
  const {divisionDetails} = useDivisionDetailsGenerator(currentInterval);

  return {
    controls,
    currentInterval,
    extendFrom,
    extendTo,
    config,
    divisionDetails
  };
};
