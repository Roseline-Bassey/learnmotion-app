"use client";

import { useEffect, useRef, useState } from "react";

export default function ResponsiveCanvas({
  width,
  children,
}: {
  width: number;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number>();

  useEffect(() => {
    const update = () => {
      const viewportWidth = window.innerWidth;
      const nextScale = Math.min(1, viewportWidth / width);
      setScale(nextScale);
      if (contentRef.current) {
        setScaledHeight(contentRef.current.scrollHeight * nextScale);
      }
    };

    update();
    window.addEventListener("resize", update);

    let resizeObserver: ResizeObserver | undefined;
    if (contentRef.current) {
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      window.removeEventListener("resize", update);
      resizeObserver?.disconnect();
    };
  }, [width]);

  return (
    <div style={{ width: "100%", height: scaledHeight, overflow: "hidden" }}>
      <div
        ref={contentRef}
        style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
