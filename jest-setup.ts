import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import React from 'react';
global.React = React;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

class ResizeObserverMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() { }
}

global.ResizeObserver = ResizeObserverMock as any;

class IntersectionObserverMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() { }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() { }
}

global.IntersectionObserver = IntersectionObserverMock as any;