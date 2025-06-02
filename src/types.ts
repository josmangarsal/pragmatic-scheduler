import GridLayout from 'react-grid-layout';

export type ScheduleDay = {
  date: Date;
  dateEnd: Date;
  divisions: Division[];
};

export type Division = {
  name: string;
  startTime: Date;
  endTime: Date;
  order?: number;
};

export type DivisionDetail = {
  name: string;
  startHour: number;
  endHour: number;
};

export type Resource = {
  name: string;
  id: string;
  data?: unknown;
};

export type CalEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  resourceId?: string;
  bgColor?: string;
  textColor?: string;
  draggable?: boolean;
  resizable?: boolean;
  allowOverlap?: boolean;
  data?: unknown;
};

export type Config = {
  resourceColumnWidth: number;
  rowHeight: number;
  divisionWidth: number;
  unAssignedRows?: number;
  divisionParts: number;
  daysToDisplay: number;
  previousDaysToDisplay?: number;
};

export type GridCellLayout = GridLayout.Layout & { day: ScheduleDay; division: Division; resourceId: string };

export type IntervalOption = {
  label: string;
  value: number;
};

export type ExtendedGridLayout = GridLayout.Layout & OverflowData;

export type InfoFlowData = {
  scrollRef: HTMLDivElement | null;
  dataGridProps: GridLayout.Layout;
  config: Config;
};

export type OverflowData = {
  leftOverflow: boolean;
  middleOverflow: number | null;
  rightOverflow: boolean;
};

export type SchedulerViewControlsProps = {
  prevDays?: number;
  startDate?: Date;
  setStartDate?: () => void;
  endDate?: Date;
  setEndDate?: () => void;
  interval?: number;
};
