import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';
import { Config } from '../types';
import { SchedulerContext } from '../components/Scheduler';
import { DefaultEventTile } from '../components/EventTile';
import { useLayoutToCalEvent } from './useLayoutToCalEvent';
import { useCalcEventPosition } from './useCalcEventPosition';

export const useCreatingEvent = ({
  ref,
  gridWidth,
  cols,
  config,
}: {
  ref: React.RefObject<HTMLElement>;
  gridWidth: number;
  cols: number;
  config: Config;
}) => {
  const [creatingEvent, setCreatingEvent] = useState<GridLayout.Layout | null>(null);

  const layoutToCalEvent = useLayoutToCalEvent();
  const calcEventPosition = useCalcEventPosition();

  const { EventTile: EventTileOverride, dndCreatingEvent, onEventChange, events } = useContext(SchedulerContext);
  const Component = EventTileOverride || DefaultEventTile;

  const contentRef = useRef<HTMLDivElement>();

  const newEvent = useMemo(
    () => (!creatingEvent ? null : layoutToCalEvent(creatingEvent, true)),
    [creatingEvent, layoutToCalEvent],
  );

  const isCellOccupied = useCallback(
    (startCol: number, endCol: number, row: number) => {
      if (!events) return false;

      for (const event of events) {
        const { x: eStart, y: eTop, w: eWidth, h: eHeight } = calcEventPosition(event);
        const eEnd = eStart + eWidth;

        const sameRow = row >= eTop && row < eTop + eHeight;
        if (!sameRow) continue;

        const overlaps = !(endCol <= eStart || startCol >= eEnd);
        if (overlaps) {
          return true;
        }
      }

      return false;
    },
    [calcEventPosition, events],
  );

  useEffect(() => {
    if (!dndCreatingEvent) return;
    const el = ref.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isPressed = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const bounds = el.getBoundingClientRect();
      const startX = e.clientX - bounds.left + el.scrollLeft;
      const startCol = (startX / gridWidth) * cols;

      const startY = e.clientY - bounds.top + el.scrollTop;
      const startRow = Math.floor(startY / config.rowHeight) - 1;

      if (startCol < 0 || startRow < 0) return;

      if (isCellOccupied(startCol, startCol + 1, startRow)) return;

      isPressed = true;

      timeoutId = setTimeout(() => {
        if (isPressed) {
          setCreatingEvent({
            i: `NewEvent_${Date.now()}`,
            x: startCol,
            y: startRow,
            w: 1,
            minW: 1,
            h: 1,
            maxH: 1,
          });
        }
      }, 300);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!creatingEvent) return;

      const bounds = el.getBoundingClientRect();
      const auxX = e.clientX - bounds.left + el.scrollLeft;
      const auxCol = (auxX / gridWidth) * cols;

      const newStartCol = Math.min(creatingEvent.x, auxCol);
      const newEndCol = Math.max(creatingEvent.x, auxCol);

      const newX = Math.floor(newStartCol);
      const newW = Math.max(1, Math.ceil(newEndCol) - Math.floor(newStartCol));

      setCreatingEvent({
        ...creatingEvent,
        x: newX,
        w: newW,
      });
    };

    const handleMouseUp = () => {
      isPressed = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!creatingEvent || !newEvent) return;

      if (onEventChange) {
        onEventChange(newEvent);
      }

      setCreatingEvent(null);
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseup', handleMouseUp);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseup', handleMouseUp);

      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    creatingEvent,
    cols,
    gridWidth,
    config.rowHeight,
    ref,
    dndCreatingEvent,
    newEvent,
    onEventChange,
    isCellOccupied,
  ]);

  const renderCreatingEvent = useMemo(() => {
    if (!newEvent) return null;

    return (
      <div key="creatingEvent" data-grid={creatingEvent}>
        <Component event={newEvent} contentRef={contentRef} />
      </div>
    );
  }, [Component, creatingEvent, newEvent]);

  return {
    isCreating: !!creatingEvent,
    renderCreatingEvent: renderCreatingEvent,
  };
};
