import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SchedulerContext } from '../components/Scheduler';
import { HeaderRow, UnAssignedEvents } from '../components/HeaderRow';
import { Box } from '@mui/material';
import { ResourceCell } from '../layout/ResourceCell';
import { ResourceHeader } from '../layout/ResourceHeader';
import { GridCell } from '../layout/GridCell';
import GridLayout from 'react-grid-layout';
import { EventTile } from '../components/EventTile';
import { UnassignedHeader } from '../components/UnassignedHeader';
import { useCalcEventPosition } from '../hooks/useCalcEventPosition';
import { useLayoutToCalEvent } from '../hooks/useLayoutToCalEvent';
import { useCalcGridPositions } from '../hooks/useCalcGridPositions';
import { CalEvent } from '../types';
import { isBefore } from 'date-fns';
import { dateToPosition } from '../helpers/datePositionHelper';
import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbarsComponent, OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import { useCreatingEvent } from '../hooks/useCreatingEvent';

export const TimelineView = () => {
  const {
    resources,
    events,
    days,
    config,
    activeDate,
    calendarBounds: { totalDivisions, start, end },
    onEventChange,
    setResizingEvent,
  } = useContext(SchedulerContext);

  const ref = useRef<HTMLDivElement | null>(null);
  const scrollRefResources = useRef<OverlayScrollbarsComponentRef>(null);
  const scrollRefEvents = useRef<OverlayScrollbarsComponentRef>(null);

  const calcEventPosition = useCalcEventPosition();
  const layoutToCalEvent = useLayoutToCalEvent();
  const gridLayouts = useCalcGridPositions();

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [dragCalEvent, setDragCalEvent] = useState<CalEvent | undefined>();
  const [droppingItem, setDroppingItem] = useState<GridLayout.Layout>({ i: 'droppedItem', w: 4, h: 1, x: 0, y: 0 });
  const [layouts, setLayouts] = useState<GridLayout.Layout[]>(gridLayouts);

  const updateLayout = useCallback(
    (layout: GridLayout.Layout[]) => {
      const gridIds = gridLayouts.map((l) => l.i);
      const eventLayouts = layout.filter((l) => !gridIds.includes(l.i));
      setLayouts([...eventLayouts, ...gridLayouts]);
    },
    [gridLayouts],
  );

  const prevActiveDate = useRef<Date | null>();
  const prevStartDate = useRef<Date | null>();
  const prevEndDate = useRef<Date | null>();
  useEffect(() => {
    // Scroll to start on expand end date
    if (prevStartDate.current && prevStartDate.current?.getTime() !== start.getTime()) {
      prevStartDate.current = start;
      ref.current?.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
      return;
    }
    // Scroll to end on expand end date
    if (prevEndDate.current && prevEndDate.current?.getTime() !== end.getTime()) {
      prevEndDate.current = end;
      ref.current?.scrollTo({
        left: ref.current.scrollWidth,
        behavior: 'smooth',
      });
      return;
    }
    setTimeout(() => {
      prevStartDate.current = start;
      prevEndDate.current = end;
    }, 100);

    // Don't scroll if activeDate has not changed
    if (prevActiveDate.current?.getTime() === activeDate.getTime()) return;
    prevActiveDate.current = activeDate;

    if (isBefore(start, activeDate) && isBefore(activeDate, end)) {
      // scroll to activeDate, that must be inside the current date interval
      ref.current?.scrollTo({
        left: dateToPosition(activeDate, start, end, ref.current.scrollWidth),
        behavior: 'smooth',
      });
    } else {
      // scroll to the current date (there is 1 day in the past)
      ref.current?.scrollTo({
        left: ref.current.scrollWidth * (1 / (config.daysToDisplay + 1)),
        behavior: 'smooth',
      });
    }
  }, [activeDate, config.daysToDisplay, end, start]);

  // Lock vertical scroll
  useEffect(() => {
    const preventVerticalScroll = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventVerticalScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventVerticalScroll);
    };
  }, [loaded]);

  // Use wheel to scroll horizontally in timeline
  useEffect(() => {
    const el = ref.current;

    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        if (
          !(el.scrollLeft === 0 && e.deltaY < 0) &&
          !(el.scrollWidth - el.clientWidth - Math.round(el.scrollLeft) === 0 && e.deltaY > 0)
        ) {
          e.preventDefault();
        }
        el.scrollLeft += e.deltaY * 0.25;
      };

      el.addEventListener('wheel', onWheel);

      return () => el.removeEventListener('wheel', onWheel);
    }
  }, []);

  // Observe scroll and update vertical scrollbar position
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollRight = el.scrollWidth - el.clientWidth - el.scrollLeft;
      const verticalScrollbar = scrollRefEvents.current?.osInstance()?.elements()?.scrollbarVertical?.scrollbar;
      if (verticalScrollbar) {
        verticalScrollbar.style.transform = `translateX(-${scrollRight}px)`;
      }
    };

    el.addEventListener('scroll', handleScroll);

    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);

      resizeObserver.disconnect();
    };
  }, []);

  // Prevent scrollbar wheel event
  useEffect(() => {
    const scrollbarEventElement = scrollRefEvents.current?.osInstance()?.elements()?.scrollEventElement;

    const onWheel = () => {
      if (scrollbarEventElement instanceof HTMLElement) {
        scrollbarEventElement.scrollTop = scrollbarEventElement.scrollTop + 0;
      }
    };

    if (scrollbarEventElement) {
      scrollbarEventElement.addEventListener('wheel', onWheel, { passive: false });
    }

    return () => {
      if (scrollbarEventElement) {
        scrollbarEventElement.removeEventListener('wheel', onWheel);
      }
    };
  }, [loaded, scrollRefEvents]);

  useEffect(() => {
    if (!loaded) {
      setTimeout(() => {
        setLoaded(true);
      }, 1000);
      return;
    }

    const eventsInstance = scrollRefEvents.current?.osInstance();
    const resourcesInstance = scrollRefResources.current?.osInstance();

    if (!eventsInstance || !resourcesInstance) return;

    // Handler to sync scroll
    const handleScroll = () => {
      const scrollTop = eventsInstance.elements().viewport.scrollTop;
      resourcesInstance.elements().viewport.scrollTop = scrollTop;
    };

    eventsInstance.on('scroll', handleScroll);

    return () => {
      eventsInstance.off('scroll', handleScroll);
    };
  }, [loaded]);

  const cols = useMemo(() => {
    return totalDivisions * config.divisionParts;
  }, [config.divisionParts, totalDivisions]);

  const handleDrop = useCallback(
    (_layout: GridLayout.Layout[], layoutItem: GridLayout.Layout) => {
      if (dragCalEvent && layoutItem) {
        const updatedEvent = layoutToCalEvent(layoutItem);
        onEventChange?.(updatedEvent);
        setIsDraggingOver(false);
      }
    },
    [dragCalEvent, layoutToCalEvent, onEventChange],
  );

  const handleDropDragOver = useCallback(() => {
    setIsDraggingOver(true);
    return undefined;
  }, [setIsDraggingOver]);

  const handleUnassignedDragStart = useCallback(
    (event: CalEvent) => {
      setDragCalEvent(event);
      const layout = calcEventPosition(event);
      setDroppingItem(layout);
    },
    [calcEventPosition],
  );

  const handleDragResizeStop: GridLayout.ItemCallback = useCallback(
    (
      layout: GridLayout.Layout[],
      _oldItem: GridLayout.Layout,
      newItem: GridLayout.Layout,
      // _placeholder: GridLayout.Layout,
      // _event: MouseEvent,
      // _element: HTMLElement,
    ) => {
      if (newItem.i === 'creatingEvent') {
        return;
      }

      const updatedEvent = layoutToCalEvent(newItem);
      onEventChange?.(updatedEvent);
      // be sure to unset this so that the handleLayoutChange updates the layout
      setIsDraggingOver(false);
      setTimeout(() => {
        // note this is required as the handleLayoutChange is not always triggered
        // see: https://github.com/react-grid-layout/react-grid-layout/issues/1606
        // the setTimeout is a hack as sometime it ges into a loop depending on how quickly the event is dropped
        updateLayout(layout);
      });

      setResizingEvent(null);
    },
    [layoutToCalEvent, onEventChange, setResizingEvent, updateLayout],
  );

  const handleLayoutChange = useCallback(
    (layout: GridLayout.Layout[]) => {
      // note we have to check if we are dragging over as the handleLayoutChange can remove the droppingItem
      // which causes the handleDrop be called with an undefined layoutItem, and the "pink box" is not shown
      if (!isDraggingOver) {
        updateLayout(layout);
      }
    },
    [isDraggingOver, updateLayout],
  );

  const handleOnResize: GridLayout.ItemCallback = useCallback(
    (layout: GridLayout.Layout[], oldItem: GridLayout.Layout, newItem: GridLayout.Layout) => {
      if (!newItem) return;

      if (newItem.i === 'droppedItem' || newItem.i === 'creatingEvent') {
        return;
      }

      const resizedEvent = layoutToCalEvent(newItem);
      setResizingEvent(resizedEvent);
    },
    [layoutToCalEvent, setResizingEvent],
  );

  const maxHeight = useMemo(
    () => (config.rowsToDisplay ? config.rowsToDisplay * config.rowHeight : '100%'),
    [config.rowsToDisplay, config.rowHeight],
  );

  const gridWidth = useMemo(
    () => (cols * config.divisionWidth) / config.divisionParts,
    [cols, config.divisionParts, config.divisionWidth],
  );

  // Observe events container to recalculate grid width to fit screen
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recalcGridWidth = () => {
      if (gridWidth < el.clientWidth) {
        const calculatedDivisionWidth = el.clientWidth / totalDivisions;
        // Custom event to link with useSchedulerViewConfig
        window.dispatchEvent(
          new CustomEvent('timelineview:resize:calculatedDivisionWidth', { detail: { calculatedDivisionWidth } }),
        );
      }
    };

    const resizeObserver = new ResizeObserver(recalcGridWidth);
    resizeObserver.observe(el);

    recalcGridWidth();

    return () => {
      resizeObserver.disconnect();
    };
  }, [cols, config.divisionParts, gridWidth, totalDivisions]);

  const { renderCreatingEvent } = useCreatingEvent({ ref, gridWidth, cols, config });

  return (
    <Box>
      {/* top row */}
      {config.unAssignedRows ? <UnassignedHeader /> : null}
      <Box display="flex">
        {/* left side column that does not scroll */}
        <Box
          marginTop={config.unAssignedRows ? `${config.rowHeight * 2}px` : 0}
          maxWidth={config.resourceColumnWidth}
          minWidth={config.resourceColumnWidth}
        >
          <ResourceHeader />
          <OverlayScrollbarsComponent
            ref={scrollRefResources}
            options={{ overflow: { x: 'hidden', y: 'hidden' } }}
            style={{ maxHeight: maxHeight }}
          >
            {resources.map((resource) => (
              <ResourceCell key={resource.id} resource={resource} />
            ))}
          </OverlayScrollbarsComponent>
        </Box>
        {/* right side column that scrolls */}
        <Box position="relative" flex={1} overflow="auto" ref={ref}>
          {config.unAssignedRows ? <UnAssignedEvents onDragStart={handleUnassignedDragStart} /> : null}
          <HeaderRow days={days} eventsBoxElement={ref.current} />
          <OverlayScrollbarsComponent
            ref={scrollRefEvents}
            options={{ overflow: { x: 'hidden', y: 'scroll' } }}
            style={{ maxHeight: maxHeight, width: gridWidth }}
          >
            <GridLayout
              className="layout"
              margin={[0, 0]}
              compactType={null}
              allowOverlap={true}
              cols={cols}
              rowHeight={config.rowHeight}
              width={gridWidth}
              isBounded={true}
              isDroppable={true}
              onDrop={handleDrop}
              onDropDragOver={handleDropDragOver}
              droppingItem={droppingItem}
              onDragStop={handleDragResizeStop}
              onResizeStop={handleDragResizeStop}
              layout={layouts}
              onLayoutChange={handleLayoutChange}
              draggableCancel=".not-draggable"
              onResize={handleOnResize}
              onDrag={handleOnResize}
            >
              {gridLayouts.map((layout) => {
                return (
                  <div key={layout.i}>
                    <Box width={config.divisionWidth} height={config.rowHeight * layout.h}>
                      <GridCell layout={layout} />
                    </Box>
                  </div>
                );
              })}
              {events
                .filter((e) => e.resourceId)
                .sort((a, b) => (a.allowOverlap ? 0 : 1) - (b.allowOverlap ? 0 : 1))
                .map((event) => {
                  const dataGridProps = calcEventPosition(event);
                  return (
                    <div key={event.id} data-grid={dataGridProps}>
                      <EventTile
                        key={event.id}
                        event={event}
                        infoFlowData={{
                          scrollRef: ref.current,
                          dataGridProps: dataGridProps,
                          config: config,
                        }}
                        overflowData={{
                          leftOverflow: dataGridProps.leftOverflow,
                          middleOverflow: dataGridProps.middleOverflow,
                          rightOverflow: dataGridProps.rightOverflow,
                        }}
                      />
                    </div>
                  );
                })}
              {renderCreatingEvent}
            </GridLayout>
          </OverlayScrollbarsComponent>
        </Box>
      </Box>
    </Box>
  );
};
