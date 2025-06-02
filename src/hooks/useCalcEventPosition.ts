import { useCallback, useContext } from 'react';
import { CalEvent, ExtendedGridLayout } from '../types';
import { SchedulerContext } from '../components/Scheduler';
import { addDays } from 'date-fns';
import { useOverlappingOffset } from './useOverlappingEvents';
import { useCalcResourceRows } from './useCalcResourceRows';

export const useCalcEventPosition = () => {
  const {
    resources,
    days,
    config: { divisionParts, divisionWidth },
  } = useContext(SchedulerContext);

  const getOverlappingOffset = useOverlappingOffset();
  const calcResourceRows = useCalcResourceRows();

  return useCallback(
    (event: CalEvent): ExtendedGridLayout => {
      let divisionCount = 0;
      let x = 0;
      let xSetted = false;
      let w = 0;

      let leftOverflow = false;
      let middleOverflow = null;
      let rightOverflow = false;

      outerLoop: for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex];

        if (
          (day.date <= event.startTime && addDays(day.date, 1) > event.startTime) ||
          (day.date <= event.endTime && addDays(day.date, 1) > event.endTime) ||
          day.date >= event.endTime
        ) {
          for (let divisionIndex = 0; divisionIndex < day.divisions.length; divisionIndex++) {
            const division = day.divisions[divisionIndex];

            let nextDivision = null;
            if (divisionIndex + 1 < day.divisions.length) {
              nextDivision = day.divisions[divisionIndex + 1];
            } else if (dayIndex + 1 < days.length) {
              const nextDay = days[dayIndex + 1];
              if (nextDay.divisions.length > 0) {
                nextDivision = nextDay.divisions[0];
              }
            }

            const divisionRange = division.endTime.getTime() - division.startTime.getTime();

            if (division.startTime <= event.startTime && division.endTime >= event.startTime) {
              const fractionOfDivision = (event.startTime.getTime() - division.startTime.getTime()) / divisionRange;
              x = divisionCount + fractionOfDivision * divisionParts;
              xSetted = true;
            } else if (division.startTime >= event.startTime && !xSetted) {
              // Start of event in non visible division
              x = divisionCount;
              xSetted = true;

              leftOverflow = true;
            }

            if (
              (division.startTime <= event.endTime && division.endTime >= event.endTime) ||
              division.startTime >= event.endTime ||
              (division.endTime <= event.endTime &&
                ((nextDivision && nextDivision.startTime >= event.endTime) || !nextDivision))
            ) {
              let fractionOfDivision = 0;
              if (
                division.endTime <= event.endTime &&
                ((nextDivision && nextDivision.startTime >= event.endTime) || !nextDivision)
              ) {
                fractionOfDivision = Math.max(
                  (division.endTime.getTime() - division.startTime.getTime()) / divisionRange,
                  0,
                );
                rightOverflow = true; // End of event in non visible division
              } else {
                fractionOfDivision = Math.max(
                  (event.endTime.getTime() - division.startTime.getTime()) / divisionRange,
                  0,
                );

                if (nextDivision && division.startTime >= event.endTime && nextDivision.startTime > event.endTime) {
                  rightOverflow = true; // End of event in non visible division
                }
              }

              w = divisionCount + fractionOfDivision * divisionParts - x;

              break outerLoop;
            }

            // Event crosses the non visible division
            if (
              nextDivision &&
              nextDivision.startTime.getTime() !== division.endTime.getTime() &&
              event.startTime < division.endTime &&
              event.endTime > division.endTime &&
              event.endTime > nextDivision.startTime
            ) {
              const fractionOfDivision = (division.endTime.getTime() - event.startTime.getTime()) / divisionRange;
              const parts = fractionOfDivision * divisionParts;
              middleOverflow = (parts * divisionWidth) / divisionParts; // Convert to px
            }

            divisionCount = divisionCount + divisionParts;
          }
        } else {
          divisionCount += day.divisions.length * divisionParts;
        }
      }
      const overlappingOffset = getOverlappingOffset(event);

      // sum up how may rows are use in the previous resources
      let rowCount = 0;
      for (const _resource of resources) {
        if (_resource.id === event.resourceId) {
          break;
        }
        rowCount += calcResourceRows(_resource);
      }

      const y = rowCount + (event.allowOverlap ? 0 : overlappingOffset);

      return {
        i: event.id,
        x: x,
        y: y,
        w: Number(w.toFixed(4)),
        h: 1,
        maxH: 1,
        isDraggable: event.draggable === false ? false : true,
        isResizable: event.resizable === false ? false : true,
        leftOverflow: leftOverflow,
        middleOverflow: middleOverflow,
        rightOverflow: rightOverflow,
      };
    },
    [calcResourceRows, days, divisionParts, divisionWidth, getOverlappingOffset, resources],
  );
};
