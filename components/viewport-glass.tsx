"use client";

import { useEffect, useRef } from "react";

export function updateViewportGlass(element = document.querySelector<HTMLElement>(".viewport-glass")) {
  if (!element) return;
  const root = document.documentElement;
  const viewport = window.visualViewport;
  // Mobile toolbars can move the visible bottom without updating CSS viewport units.
  const viewportBottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight);
  const remaining = root.scrollHeight - scrollY - viewportBottom;
  const menu = document.getElementById("site-header")?.getBoundingClientRect();
  const opacity = (distance: number) => String(distance <= 1 ? 0 : Math.min(1, distance / 64));
  element.style.setProperty("--viewport-bottom", `${viewportBottom}px`);
  element.style.setProperty("--menu-bottom", `${Math.max(0, menu?.bottom ?? 0)}px`);
  element.style.setProperty("--top-fade", opacity(scrollY));
  element.style.setProperty("--bottom-fade", opacity(remaining));
}

export function ViewportGlass() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const viewport = window.visualViewport;

    function update() {
      updateViewportGlass(element);
    }

    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update, { passive: true });
    viewport?.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      viewport?.removeEventListener("resize", update);
    };
  }, []);

  return <div ref={ref} className="viewport-glass" aria-hidden="true" />;
}
