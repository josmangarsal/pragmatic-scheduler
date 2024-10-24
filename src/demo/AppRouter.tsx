import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Daily from './Daily';
import Monthly from './Monthly';
import Weekly from './Weekly';
import { Navigate } from 'react-router';
import Daily2 from './Daily2';
import DailyZoom from './DailyZoom';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/daily" element={<Daily />} />
      <Route path="/daily2" element={<Daily2 />} />
      <Route path="/dailyZoom" element={<DailyZoom />} />
      <Route path="/week" element={<Weekly />} />
      <Route path="/month" element={<Monthly />} />
      <Route path="*" element={<Navigate replace to="/dailyZoom" />} />
    </Routes>
  );
};

export default AppRouter;
