import { DivisionDetail, ScheduleDay } from '../types';
import { setHours, setMinutes, startOfDay } from 'date-fns';

export const useDateToDivisions = () => {
  const dateToDivisions = (date: Date, divisionDetails: DivisionDetail[]): ScheduleDay => {
    // const startOfDayDate = startOfDay(date);
    const startOfDayDate = setMinutes(
      setHours(date, Math.trunc(divisionDetails[0].startHour)),
      (divisionDetails[0].startHour % 1) * 60,
    );

    const endOfDayDate = setMinutes(
      setHours(date, Math.trunc(divisionDetails[divisionDetails.length - 1].endHour)),
      (divisionDetails[divisionDetails.length - 1].endHour % 1) * 60,
    );

    return {
      date: startOfDayDate,
      dateEnd: endOfDayDate,
      divisions: divisionDetails.map((divisionDetail) => {
        // Move hour with decimal to hours and minutes
        return {
          name: divisionDetail.name,
          startTime: setMinutes(
            setHours(startOfDayDate, Math.trunc(divisionDetail.startHour)),
            (divisionDetail.startHour % 1) * 60,
          ),
          endTime: setMinutes(
            setHours(startOfDayDate, Math.trunc(divisionDetail.endHour)),
            (divisionDetail.endHour % 1) * 60,
          ),
        };
      }),
    };
  };

  return { dateToDivisions };
};
