"use client";

import { Children, cloneElement, isValidElement, ReactNode, useEffect, useRef } from "react";

export function HorizontalRail({ children, className = "", loop = false }: { children: ReactNode; className?: string; loop?: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const items = Children.toArray(children);
  const renderedItems = loop
    ? ["before", "main", "after"].flatMap((copy) =>
        items.map((child, index) =>
          isValidElement(child) ? cloneElement(child, { key: `${copy}-${index}` }) : child,
        ),
      )
    : items;

  useEffect(() => {
    const currentRail = rail.current;
    if (!loop || !currentRail || initialized.current) return;

    const placeInMiddle = () => {
      currentRail.scrollLeft = currentRail.scrollWidth / 3;
      initialized.current = true;
    };

    const frame = window.requestAnimationFrame(placeInMiddle);
    return () => window.cancelAnimationFrame(frame);
  }, [loop, items.length]);

  function keepLoopContinuous() {
    const currentRail = rail.current;
    if (!loop || !currentRail || !initialized.current) return;

    const setWidth = currentRail.scrollWidth / 3;
    if (currentRail.scrollLeft < setWidth * 0.35) {
      currentRail.scrollLeft += setWidth;
    } else if (currentRail.scrollLeft > setWidth * 1.65) {
      currentRail.scrollLeft -= setWidth;
    }
  }

  function move(direction: -1 | 1) {
    const currentRail = rail.current;
    if (!currentRail) return;

    const card = currentRail.querySelector<HTMLElement>(":scope > *");
    const amount = card?.getBoundingClientRect().width || currentRail.clientWidth || 360;
    const maxScroll = Math.max(0, currentRail.scrollWidth - currentRail.clientWidth);

    if (direction === -1 && currentRail.scrollLeft <= 2) {
      currentRail.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }

    if (direction === 1 && currentRail.scrollLeft >= maxScroll - 2) {
      currentRail.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    currentRail.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div className={`media-rail-wrap ${className}`}>
      <button className="rail-dot rail-dot-left" onClick={() => move(-1)} aria-label="Reculer le rail" />
      <div className="media-rail" ref={rail} onScroll={keepLoopContinuous}>
        {renderedItems}
      </div>
      <button className="rail-dot rail-dot-right" onClick={() => move(1)} aria-label="Avancer le rail" />
    </div>
  );
}
