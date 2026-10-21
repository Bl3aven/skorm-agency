"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const revealSelector = [
  ".noir-section-head", ".noir-event", ".noir-artist-card", ".noir-service",
  ".noir-guide > h2", ".noir-guide-grid > a", ".noir-trust > div",
  ".noir-newsletter", ".noir-footer-bottom > div", ".noir-footer-bottom > nav",
].join(",");

/** Small, dependency-free motion layer; content is visible without JavaScript. */
export function NoirMotion({ en = false }: { en?: boolean }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      let paused = false;
      try { paused = localStorage.getItem("skorm-motion") === "off"; } catch { /* Storage is optional. */ }
      setReduced(preference.matches);
      setEnabled(!preference.matches && !paused);
    };
    const visibility = () => { document.documentElement.dataset.noirTab = document.hidden ? "hidden" : "visible"; };
    update();
    visibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      delete document.documentElement.dataset.noirTab;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.noirMotion = enabled ? "on" : "off";
    let observer: IntersectionObserver | undefined;
    let ambient: IntersectionObserver | undefined;
    let targets: HTMLElement[] = [];
    const frame = requestAnimationFrame(() => {
      targets = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
      if (!enabled || !("IntersectionObserver" in window)) {
        targets.forEach(element => { element.dataset.noirReveal = "shown"; });
        return;
      }
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.noirReveal = "shown";
          observer?.unobserve(entry.target);
        }
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
      for (const element of targets) {
        const rect = element.getBoundingClientRect();
        const visible = rect.top < innerHeight - 24 && rect.bottom > 0 && rect.left < innerWidth && rect.right > 0;
        element.dataset.noirReveal = visible ? "shown" : "pending";
        const siblings = Array.from(element.parentElement?.children || []);
        element.style.setProperty("--noir-reveal-delay", `${Math.max(0, siblings.indexOf(element)) % 5 * 65}ms`);
        if (!visible) observer.observe(element);
      }
      ambient = new IntersectionObserver(entries => {
        for (const entry of entries) (entry.target as HTMLElement).dataset.noirActive = entry.isIntersecting ? "true" : "false";
      });
      document.querySelectorAll(".noir-hero,.noir-services").forEach(element => ambient?.observe(element));
    });
    const revealFocused = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        const element = event.target.closest<HTMLElement>("[data-noir-reveal]");
        if (element) { element.dataset.noirReveal = "shown"; observer?.unobserve(element); }
      }
    };
    document.addEventListener("focusin", revealFocused);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      ambient?.disconnect();
      targets.forEach(element => { element.dataset.noirReveal = "shown"; });
      document.removeEventListener("focusin", revealFocused);
    };
  }, [enabled, pathname]);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem("skorm-motion", next ? "on" : "off"); } catch { /* No persistence required. */ }
  }

  const label = reduced
    ? en ? "Motion reduced according to your device settings" : "Animations réduites selon vos préférences système"
    : enabled ? en ? "Pause animations" : "Mettre en pause les animations" : en ? "Enable animations" : "Activer les animations";
  return <button className="noir-motion-toggle" type="button" onClick={toggle} disabled={reduced} aria-label={label} title={label} aria-pressed={!enabled}>{enabled ? <Pause size={13} /> : <Play size={13} />}</button>;
}
