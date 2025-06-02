import { useMemo } from 'react';
import { DivisionDetail } from '../types';

export const useDivisionDetailsGenerator = (
  intervalIncrement: number,
  { startDate, endDate }: { startDate?: Date; endDate?: Date },
) => {
  const divisionDetails = useMemo(() => {
    // Go from 0 to 24 adding an interval increment
    const divisions: DivisionDetail[] = [];

    const initialHour = startDate ? startDate.getHours() + startDate.getMinutes() / 60 : 0;
    const finalHour = endDate ? endDate.getHours() + endDate.getMinutes() / 60 : 24;

    let startHour = initialHour;
    while (startHour < finalHour) {
      // Move startHour to string time format
      const hours = Math.trunc(startHour).toString().padStart(2, '0');
      const minutes = ((startHour % 1) * 60).toString().padStart(2, '0');

      let endHour = startHour + intervalIncrement;
      if (endHour > finalHour) {
        endHour = finalHour;
      }

      divisions.push({
        name: `${hours}:${minutes}`,
        startHour: startHour,
        endHour: endHour,
      });

      startHour += intervalIncrement;
    }

    return divisions;
  }, [endDate, intervalIncrement, startDate]);

  return {
    divisionDetails,
  };
};
