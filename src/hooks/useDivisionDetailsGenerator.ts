import {useMemo} from 'react';
import {DivisionDetail} from '../types';

export const useDivisionDetailsGenerator = (intervalIncrement: number) => {
  const divisionDetails = useMemo(() => {
    // Go from 0 to 24 adding an interval increment
    const divisions: DivisionDetail[] = [];
    let startHour = 0;

    while (startHour < 24) {
      // Move startHour to string time format
      const hours = Math.trunc(startHour).toString().padStart(2, '0');
      const minutes = ((startHour % 1) * 60).toString().padStart(2, '0');

      let endHour = startHour + intervalIncrement;
      if (endHour > 24) {
        endHour = 24;
      }

      divisions.push({
        name: `${hours}:${minutes}`,
        startHour: startHour,
        endHour: endHour
      });

      startHour += intervalIncrement;
    }

    return divisions;
  }, [intervalIncrement]);

  return {
    divisionDetails
  };
};
