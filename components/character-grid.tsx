"use client";

import { useEffect, useRef } from "react";
import { AMBIENT_INTERVAL, createCharacterField } from "@/lib/character-field";

export function CharacterGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const seed = Math.random() * 1000;
    let field = createCharacterField(canvas, seed);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let frame = 0;
    let last = 0;
    let activeUntil = 0;
    let scrollTop = scrollPosition();
    let touchY: number | null = null;
    let disposed = false;
    let lost = false;
    const animated = () => field.accelerated && !reduced.matches;

    function scrollPosition() {
      const root = document.documentElement;
      return Math.max(0, Math.min(window.scrollY, root.scrollHeight - root.clientHeight));
    }

    function draw(now: number) {
      frame = 0;
      if (disposed || lost || document.hidden) return;
      const active = !coarse.matches && now < activeUntil;
      // Ambient motion, clicks, and scrolling use 30 fps; the cursor follows the display.
      if (
        animated() &&
        !active &&
        last &&
        now - last < AMBIENT_INTERVAL * 1000 - 0.5
      ) {
        frame = requestAnimationFrame(draw);
        return;
      }
      field.draw(
        last ? Math.min(0.05, (now - last) / 1000) : AMBIENT_INTERVAL,
        animated(),
      );
      last = now;
      if (animated()) frame = requestAnimationFrame(draw);
    }

    function run() {
      if (!frame && !disposed && !lost && !document.hidden) {
        frame = requestAnimationFrame(draw);
      }
    }

    function cancel() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    }

    function resize() {
      if (disposed || lost) return;
      cancel();
      activeUntil = 0;
      scrollTop = scrollPosition();
      touchY = null;
      field.resize(
        window.innerWidth,
        window.innerHeight,
        coarse.matches,
        document.getElementById("main")?.getBoundingClientRect(),
      );
      run();
    }

    function move(event: PointerEvent) {
      if (event.pointerType === "touch" || coarse.matches || !animated() || lost)
        return;
      field.pointer(event.clientX, event.clientY);
      activeUntil = performance.now() + 2500;
      run();
    }

    function splash(event: MouseEvent) {
      if (event.button !== 0 || event.detail === 0 || !animated() || lost) return;
      field.splash(event.clientX, event.clientY);
      run();
    }

    function scroll() {
      const next = scrollPosition();
      const delta = next - scrollTop;
      scrollTop = next;
      if (!animated() || lost || document.hidden || !delta) return;
      field.scroll(delta);
      run();
    }

    function overscroll(delta: number) {
      if (!animated() || lost || document.hidden || !delta) return;
      const root = document.documentElement;
      const bottom = Math.max(0, root.scrollHeight - root.clientHeight);
      if ((delta < 0 && scrollY <= 1) || (delta > 0 && scrollY >= bottom - 1)) {
        field.scroll(delta);
        run();
      }
    }

    function wheel(event: WheelEvent) {
      if (event.ctrlKey || event.defaultPrevented) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
      overscroll(event.deltaY * unit);
    }

    function touchStart(event: TouchEvent) {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : null;
    }

    function touchMove(event: TouchEvent) {
      const next = event.touches.length === 1 ? event.touches[0].clientY : null;
      if (!event.defaultPrevented && touchY !== null && next !== null) overscroll(touchY - next);
      touchY = next;
    }

    function touchEnd() {
      touchY = null;
    }

    function key(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof Element) {
        if (event.target.closest("input, textarea, select, [contenteditable]")) return;
        if (event.key === " " && event.target.closest("button, [role=button]")) return;
      }
      const steps: Record<string, number> = {
        ArrowUp: -40, ArrowDown: 40,
        PageUp: -innerHeight, PageDown: innerHeight,
        Home: -innerHeight, End: innerHeight,
        " ": event.shiftKey ? -innerHeight : innerHeight,
      };
      if (steps[event.key]) overscroll(steps[event.key]);
    }

    function releasePointer() {
      field.releasePointer();
    }
    function visibility() {
      cancel();
      activeUntil = 0;
      touchY = null;
      scrollTop = scrollPosition();
      field.releasePointer();
      run();
    }
    function motion() {
      cancel();
      activeUntil = 0;
      if (!lost) field.reset();
      run();
    }
    function contextLost(event: Event) {
      event.preventDefault();
      lost = true;
      cancel();
    }
    function contextRestored() {
      lost = false;
      field.dispose();
      field = createCharacterField(canvas!, seed);
      resize();
    }

    resize();
    void document.fonts.ready.then(resize);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });
    window.addEventListener("touchend", touchEnd);
    window.addEventListener("touchcancel", touchEnd);
    window.addEventListener("keydown", key);
    window.addEventListener("click", splash, { passive: true, capture: true });
    window.addEventListener("blur", releasePointer);
    document.documentElement.addEventListener("pointerleave", releasePointer);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", motion);
    coarse.addEventListener("change", resize);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", contextRestored);

    return () => {
      disposed = true;
      cancel();
      field.dispose();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      window.removeEventListener("keydown", key);
      window.removeEventListener("click", splash, true);
      window.removeEventListener("blur", releasePointer);
      document.documentElement.removeEventListener(
        "pointerleave",
        releasePointer,
      );
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", motion);
      coarse.removeEventListener("change", resize);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      data-character-grid
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
