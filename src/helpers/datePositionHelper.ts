export const dateToPosition = (currentDate: Date, startDate: Date, endDate: Date, endWidth: number) => {
  const startEpoch = startDate.getTime(); // -> 0 px
  const currentEpoch = currentDate.getTime(); // -> ? px
  const endEpoch = endDate.getTime(); // -> endWidth px

  return ((currentEpoch - startEpoch) * endWidth) / (endEpoch - startEpoch);
};
