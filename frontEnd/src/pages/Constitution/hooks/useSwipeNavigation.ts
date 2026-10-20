import { useRef } from "react";

interface UseSwipeNavigationOptions {
  onSwipeLeft?: () => void;  // Triggered when swiping right-to-left (Go to Next Page)
  onSwipeRight?: () => void; // Triggered when swiping left-to-right (Go to Prev Page)
  threshold?: number;        // Minimum px distance required
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 45,
}: UseSwipeNavigationOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    // Single finger only
    if (e.touches.length > 1) return;

    // Don't trigger if touching buttons, links, inputs, selects, or sliders
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, select, textarea, [role='button']")) {
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const onTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchEndX.current === null ||
      touchEndY.current === null
    ) {
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    // Check if horizontal movement clearly exceeds vertical scrolling (ratio > 1.5)
    // and distance exceeds threshold
    if (Math.abs(deltaX) >= threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped Left -> Next page
        onSwipeLeft?.();
      } else {
        // Swiped Right -> Previous page
        onSwipeRight?.();
      }
    }

    // Reset coordinates
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
