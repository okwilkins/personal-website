"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

export function ResourceLink({ href, children }: { href: string; children: ReactNode }) {
  const glow = useRef<HTMLSpanElement>(null);
  const cleanup = useRef(() => {});

  useEffect(() => () => cleanup.current(), []);

  function press(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || !event.isPrimary || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = glow.current;
    if (!element) return;
    cleanup.current();
    const link = event.currentTarget;
    const pointer = event.pointerId;

    function move(event: PointerEvent) {
      if (event.pointerId !== pointer) return;
      const bounds = link.getBoundingClientRect();
      element!.style.setProperty("--press-x", `${event.clientX - bounds.left}px`);
      element!.style.setProperty("--press-y", `${event.clientY - bounds.top}px`);
    }

    function release(event?: PointerEvent) {
      if (event && event.pointerId !== pointer) return;
      const { opacity, transform } = getComputedStyle(element!);
      cleanup.current();
      element!.animate([
        { opacity, transform },
        { opacity: 0, transform },
      ], { duration: 180, easing: "ease-out" });
    }

    const blur = () => release();
    cleanup.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", blur);
      element.getAnimations().forEach((animation) => animation.cancel());
    };
    move(event.nativeEvent);
    element.animate([
      { opacity: 0, transform: "scale(0.05)" },
      { opacity: 1, transform: "scale(1)" },
    ], { duration: 180, easing: "ease-out", fill: "forwards" });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", blur);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      className="resource-link group"
      onPointerDown={press}
      onClick={(event) => {
        const selection = window.getSelection();
        if (event.detail > 0 && selection && !selection.isCollapsed && event.currentTarget.contains(selection.anchorNode)) {
          event.preventDefault();
        }
      }}
    >
      <span ref={glow} aria-hidden="true" className="resource-press" />
      {children}
    </a>
  );
}
