import { useEffect, useRef } from "react";

export const useScrollControl = () => {
  const virtualScroll = useRef(0);
  const currentScroll = useRef(0);

  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const onWheel = (event) => {
      virtualScroll.current += event.deltaY * 0.001;
      virtualScroll.current = Math.max(0, Math.min(1, virtualScroll.current));
    };

    const onTouchStart = (event) => {
      touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
    };

    const onTouchMove = (event) => {
      event.preventDefault();
      const touchEndY = event.touches[0].clientY;
      const touchEndX = event.touches[0].clientX;

      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;

      if (Math.abs(deltaX) < 40) {
        virtualScroll.current += deltaY * 0.002;
        virtualScroll.current = Math.max(0, Math.min(1, virtualScroll.current));
      }

      touchStartY = touchEndY;
      touchStartX = touchEndX;
    };

    const disableScroll = (event) => event.preventDefault();

    const events = [
      ["wheel", onWheel],
      ["wheel", disableScroll, { passive: false }],
      ["touchstart", onTouchStart, { passive: false }],
      ["touchmove", onTouchMove, { passive: false }],
    ];

    events.forEach(([event, handler, options]) =>
      window.addEventListener(event, handler, options)
    );

    return () => {
      events.forEach(([event, handler]) =>
        window.removeEventListener(event, handler)
      );
    };
  }, []);

  return { virtualScroll, currentScroll };
};
