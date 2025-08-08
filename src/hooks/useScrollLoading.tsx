import { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { SchedulerContext } from '../components/Scheduler';
import { addDays } from 'date-fns';

const DEFAULT_CONFIG = {
  gestureDuration: 600, // Time in ms to complete the gesture
  minWheelDelta: 10, // Minimum wheel delta to consider
  resetDelay: 300, // Delay before resetting the gesture
} as const;

interface ScrollLoadingConfig {
  gestureDuration?: number;
  minWheelDelta?: number;
  resetDelay?: number;
}

interface ScrollState {
  readyToLoadLeft: boolean;
  readyToLoadRight: boolean;
  progress: number;
  direction: 'left' | 'right' | null;
}

export const useScrollLoading = (
  { scrollRef }: { scrollRef: React.RefObject<HTMLDivElement> },
  config?: ScrollLoadingConfig,
) => {
  const {
    extendWithScroll: enabled,
    changeDates,
    calendarBounds: { start, end },
  } = useContext(SchedulerContext);

  const [state, setState] = useState<ScrollState>({
    readyToLoadLeft: false,
    readyToLoadRight: false,
    progress: 0,
    direction: null,
  });

  const settings = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [config],
  );

  // Use refs for mutable state that doesn't cause re-renders
  const gestureRef = useRef({
    startTime: 0,
    accumulatedDelta: 0,
    resetTimeout: null as NodeJS.Timeout | null,
    hasTriggered: false,
    lastDirection: null as 'left' | 'right' | null,
  });

  // Reset gesture state
  const resetGesture = useCallback(() => {
    if (gestureRef.current.resetTimeout) {
      clearTimeout(gestureRef.current.resetTimeout);
      gestureRef.current.resetTimeout = null;
    }

    gestureRef.current.startTime = 0;
    gestureRef.current.accumulatedDelta = 0;
    gestureRef.current.hasTriggered = false;
    gestureRef.current.lastDirection = null;

    setState((prev) => ({
      ...prev,
      progress: 0,
      direction: null,
    }));
  }, []);

  // Handle date change
  const handleDateChange = useCallback(
    (direction: 'left' | 'right') => {
      if (gestureRef.current.hasTriggered || !changeDates) return;

      gestureRef.current.hasTriggered = true;

      const daysToAdd = direction === 'right' ? 1 : -1;
      changeDates(addDays(start, daysToAdd), addDays(end, daysToAdd));

      // Reset after a small delay to show completion
      setTimeout(() => {
        resetGesture();
      }, 100);
    },
    [changeDates, start, end, resetGesture],
  );

  // Check if scroll is at edges
  const checkScrollEdges = useCallback(() => {
    if (!scrollRef.current) return { atLeft: false, atRight: false };

    const element = scrollRef.current;
    const scrollLeft = element.scrollLeft;
    const maxScroll = element.scrollWidth - element.clientWidth;

    return {
      atLeft: scrollLeft <= 1,
      atRight: scrollLeft >= maxScroll - 1,
    };
  }, [scrollRef]);

  // Update edge states when scrolling
  useEffect(() => {
    if (!enabled || !scrollRef.current) return;

    const element = scrollRef.current;

    const handleScroll = () => {
      const { atLeft, atRight } = checkScrollEdges();

      setState((prev) => {
        // Only update if values actually changed
        if (prev.readyToLoadLeft !== atLeft || prev.readyToLoadRight !== atRight) {
          return {
            ...prev,
            readyToLoadLeft: atLeft,
            readyToLoadRight: atRight,
          };
        }
        return prev;
      });

      // Reset gesture if scrolling away from edges
      if (!atLeft && !atRight && gestureRef.current.startTime > 0) {
        resetGesture();
      }
    };

    element.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, scrollRef, checkScrollEdges, resetGesture]);

  // Handle wheel events
  useEffect(() => {
    if (!enabled || !scrollRef.current || !changeDates) return;

    const element = scrollRef.current;

    const handleWheel = (e: WheelEvent) => {
      // Skip if already triggered
      if (gestureRef.current.hasTriggered) return;

      // Check if we're at an edge
      const { atLeft, atRight } = checkScrollEdges();
      const wheelDirection = e.deltaY > 0 ? 'right' : 'left';

      // Only process if at the correct edge
      const atCorrectEdge = (wheelDirection === 'left' && atLeft) || (wheelDirection === 'right' && atRight);

      if (!atCorrectEdge) {
        // Reset if not at edge
        if (gestureRef.current.startTime > 0) {
          resetGesture();
        }
        return;
      }

      // Prevent default scroll behavior when at edge
      e.preventDefault();

      // Ignore small wheel deltas
      const absDelta = Math.abs(e.deltaY);
      if (absDelta < settings.minWheelDelta) return;

      const now = Date.now();

      // Start new gesture or check direction change
      if (gestureRef.current.startTime === 0) {
        gestureRef.current.startTime = now;
        gestureRef.current.lastDirection = wheelDirection;
        setState((prev) => ({ ...prev, direction: wheelDirection }));
      } else if (gestureRef.current.lastDirection !== wheelDirection) {
        // Direction changed, reset
        resetGesture();
        return;
      }

      // Accumulate delta
      gestureRef.current.accumulatedDelta += absDelta;

      // Calculate progress (0 to 1)
      const timeElapsed = now - gestureRef.current.startTime;
      const timeProgress = Math.min(timeElapsed / settings.gestureDuration, 1);
      const deltaProgress = Math.min(gestureRef.current.accumulatedDelta / 300, 1);

      // Use whichever progress is greater
      const progress = Math.max(timeProgress, deltaProgress);

      // Update progress
      setState((prev) => ({ ...prev, progress }));

      // Trigger action at 100% progress
      if (progress >= 1 && !gestureRef.current.hasTriggered) {
        handleDateChange(wheelDirection);
        return;
      }

      // Clear existing timeout
      if (gestureRef.current.resetTimeout) {
        clearTimeout(gestureRef.current.resetTimeout);
      }

      // Set new timeout to reset if no more wheel events
      gestureRef.current.resetTimeout = setTimeout(() => {
        if (!gestureRef.current.hasTriggered) {
          resetGesture();
        }
      }, settings.resetDelay);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
      if (gestureRef.current.resetTimeout) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(gestureRef.current.resetTimeout);
      }
    };
  }, [enabled, scrollRef, changeDates, checkScrollEdges, settings, handleDateChange, resetGesture]);

  // Create the ScrollReboundLoader component
  const ScrollReboundLoader = useMemo(() => {
    const Loader = ({ direction }: { direction: 'left' | 'right' }) => {
      const shouldShow =
        (direction === 'left' && state.readyToLoadLeft) || (direction === 'right' && state.readyToLoadRight);

      const isActive = state.direction === direction && state.progress > 0;

      if (!shouldShow) return null;

      return (
        <div
          className={`loading-bar-container ${direction}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '40px',
            [direction]: 0,
            pointerEvents: 'none',
            zIndex: 100,
            overflow: 'hidden',
            background: `linear-gradient(${direction === 'left' ? '90deg' : '270deg'}, 
              rgba(79, 172, 254, ${isActive ? 0.1 : 0}) 0%, 
              transparent 100%)`,
            transition: 'background 0.3s ease',
          }}
        >
          <div
            className="loading-bar-fill"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '100%',
              transform: `scaleX(${isActive ? state.progress : 0})`,
              transformOrigin: `${direction} center`,
              background:
                state.progress >= 0.9
                  ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                  : 'linear-gradient(90deg, #4facfe, #00f2fe)',
              opacity: isActive ? 0.8 : 0,
              transition: isActive
                ? 'transform 0.1s linear, opacity 0.2s ease, background 0.3s ease'
                : 'transform 0.3s ease, opacity 0.3s ease',
              boxShadow: isActive ? '0 0 20px rgba(79, 172, 254, 0.5)' : 'none',
              borderRadius: direction === 'left' ? '0 4px 4px 0' : '4px 0 0 4px',
            }}
          />
        </div>
      );
    };

    Loader.displayName = 'ScrollReboundLoader';
    return Loader;
  }, [state]);

  return {
    ScrollReboundLoader: ScrollReboundLoader,
    isLoadingLeft: state.readyToLoadLeft,
    isLoadingRight: state.readyToLoadRight,
    progress: state.progress,
    isActive: state.direction !== null,
  };
};
