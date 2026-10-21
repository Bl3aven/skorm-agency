"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

export function NoirRail({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  function move(direction: number) {
    const el = track.current;
    if (!el) return;
    const width = el.firstElementChild?.getBoundingClientRect().width || el.clientWidth;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: direction > 0 && atEnd ? 0 : direction < 0 && el.scrollLeft < 5 ? el.scrollWidth : el.scrollLeft + direction * (width + 20), behavior: reduced ? "instant" : "smooth" });
  }
  return <div className={`noir-rail ${className}`} role="region" aria-label={label}>
    <button type="button" className="noir-rail-arrow noir-rail-prev" onClick={() => move(-1)} aria-label={`${label} : précédents`}><ArrowLeft size={17} /></button>
    <div className="noir-rail-track" ref={track} tabIndex={0} aria-label={label}>{children}</div>
    <button type="button" className="noir-rail-arrow noir-rail-next" onClick={() => move(1)} aria-label={`${label} : suivants`}><ArrowRight size={17} /></button>
  </div>;
}
