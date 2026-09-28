import { useEffect, useRef } from "react";

const SWIPE_MIN_DISTANCE = 50;

/**
 * Touch handlers for a fullscreen viewer: swipe left/right to move between
 * items and swipe down to close. Spread the result onto the viewer element.
 */
export function useSwipe({
  onLeft,
  onRight,
  onDown,
}: {
  onLeft: () => void;
  onRight: () => void;
  onDown?: () => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      // Leave touches on a video alone so its controls (scrubbing) still work
      const onVideo = (e.target as HTMLElement).closest("video");
      start.current =
        e.touches.length === 1 && !onVideo
          ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
          : null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return;
      const dx = e.changedTouches[0].clientX - start.current.x;
      const dy = e.changedTouches[0].clientY - start.current.y;
      start.current = null;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return;
        if (dx < 0) onLeft();
        else onRight();
      } else if (dy > SWIPE_MIN_DISTANCE) {
        onDown?.();
      }
    },
  };
}

/** Stops the page behind an open viewer from scrolling. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
