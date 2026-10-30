"use client";

import { useEffect, useRef } from "react";

export function updateViewportGlass(element = document.querySelector<HTMLElement>(".viewport-glass")) {
  if (!element) return;
  const root = document.documentElement;
  const remaining = root.scrollHeight - root.clientHeight - scrollY;
  const menu = document.getElementById("site-header")?.getBoundingClientRect();
  const opacity = (distance: number) => String(distance <= 1 ? 0 : Math.min(1, distance / 64));
  element.style.setProperty("--menu-bottom", `${Math.max(0, menu?.bottom ?? 0)}px`);
  element.style.setProperty("--top-fade", opacity(scrollY));
  element.style.setProperty("--bottom-fade", opacity(remaining));
}

export function ViewportGlass() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function update() {
      updateViewportGlass(element);
    }

    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div ref={ref} className="viewport-glass" aria-hidden="true" />;
}
