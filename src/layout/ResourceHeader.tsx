import React, { useContext } from 'react';
import { SchedulerContext } from '../components/Scheduler';
import { Box, Typography } from '@mui/material';
import { BorderedBox } from './BorderedBox';

export const ResourceHeader = () => {
  const {
    config: { rowHeight, rowHeaderHeight },
    ResourceHeader: ResourceHeaderOverride,
  } = useContext(SchedulerContext);

  const Component = ResourceHeaderOverride || DefaultResourceHeader;

  return (
    <Box minHeight={rowHeaderHeight ?? rowHeight} maxHeight={rowHeaderHeight ?? rowHeight}>
      <Component />
    </Box>
  );
};

const DefaultResourceHeader = () => {
  return (
    <BorderedBox px={2} alignItems="center" minHeight="inherit">
      <Typography variant="subtitle2">TEAM</Typography>
    </BorderedBox>
  );
};
