import React, { useContext, useMemo } from 'react';
import { Cell } from './Cell';
import { SchedulerContext } from '../components/Scheduler';
import { GridCellLayout } from '../types';

export const GridCell = ({
  layout,
  ScrollReboundLoader,
}: {
  layout: GridCellLayout;
  ScrollReboundLoader: React.FC<{ direction: 'left' | 'right' }>;
}) => {
  const {
    GridCell: GridCellOverride,
    config: { divisionParts },
    calendarBounds: { totalDivisions },
  } = useContext(SchedulerContext);

  const cols = useMemo(() => {
    return totalDivisions * divisionParts;
  }, [divisionParts, totalDivisions]);

  const Component = GridCellOverride || DefaultGridCell;

  return (
    <Component
      layout={layout}
      firstCol={layout.x === 0}
      lastCol={layout.x + layout.w === cols}
      ScrollReboundLoader={ScrollReboundLoader}
    />
  );
};

const DefaultGridCell = ({
  firstCol,
  lastCol,
  ScrollReboundLoader,
}: {
  firstCol: boolean;
  lastCol: boolean;
  ScrollReboundLoader: React.FC<{ direction: 'left' | 'right' }>;
}) => {
  return (
    <Cell classes={['no-padding', 'light-border']} height="100%">
      {(firstCol || lastCol) && <ScrollReboundLoader direction={firstCol ? 'left' : 'right'} />}
    </Cell>
  );
};
