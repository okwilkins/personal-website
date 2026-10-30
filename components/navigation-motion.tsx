"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { updateViewportGlass } from "@/components/viewport-glass";

type BrowserNavigation = EventTarget & {
  currentEntry: { index: number; key: string } | null;
};

type NavigationEvent = Event & {
  navigationType: string;
  destination: { index: number };
};

export function NavigationMotion() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const pending = useRef<{ path: string; top?: number; resolve: () => void } | null>(null);

  useLayoutEffect(() => {
    currentPath.current = pathname;
    const next = pending.current;
    if (!next || next.path !== pathname) return;
    pending.current = null;
    // Native transitions pause rendering; rAF would deadlock their update.
    setTimeout(() => {
      if (next.top !== undefined) scrollTo({ top: next.top, behavior: "instant" });
      updateViewportGlass();
      next.resolve();
    }, 0);
  }, [pathname]);

  useEffect(() => {
    const navigation = (window as Window & { navigation?: BrowserNavigation }).navigation;
    let historyBack = false;
    let replaying = false;
    let active: ViewTransition | null = null;
    let restoration: ScrollRestoration | null = null;
    const positions = new Map<string, number>();
    const entryKey = () => navigation?.currentEntry?.key ?? location.pathname;

    function canAnimate() {
      return typeof document.startViewTransition === "function" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function transition(path: string, back: boolean, update: () => void, top?: number) {
      active?.skipTransition();
      pending.current?.resolve();
      document.documentElement.dataset.pageDirection = back ? "back" : "forward";
      document.documentElement.dataset.pageTransition = "";
      scrollTo({ top: scrollY, behavior: "instant" });
      const previousScroll = scrollY;
      // Slide the card; the liquid stays in place and receives a scroll impulse.
      const next = document.startViewTransition(() => new Promise<void>((resolve) => {
        pending.current = {
          path, top,
          resolve: () => {
            // The shared snapshot group uses the destination's scroll origin.
            if (active === next) {
              document.documentElement.style.setProperty("--page-out-offset", `${scrollY - previousScroll}px`);
            }
            resolve();
          },
        };
        update();
      }));
      active = next;
      void next.ready.then(() => {
        window.dispatchEvent(new CustomEvent("character-scroll", { detail: back ? innerWidth : -innerWidth }));
      }).catch(() => {});
      void next.finished.finally(() => {
        if (active === next) {
          active = null;
          if (restoration !== null) history.scrollRestoration = restoration;
          restoration = null;
          delete document.documentElement.dataset.pageTransition;
          document.documentElement.style.removeProperty("--page-out-offset");
        }
      }).catch(() => {});
    }

    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !canAnimate()) return;
      event.preventDefault();
      event.stopPropagation();
      positions.set(entryKey(), scrollY);
      transition(url.pathname, url.pathname === "/", () => router.push(url.pathname + url.search + url.hash));
    }

    function navigate(event: Event) {
      const { navigationType, destination } = event as NavigationEvent;
      positions.set(entryKey(), scrollY);
      if (navigationType === "traverse" && navigation?.currentEntry) {
        historyBack = destination.index < navigation.currentEntry.index;
      }
    }

    function pop(event: PopStateEvent) {
      if (replaying || location.pathname === currentPath.current || !event.state?.__NA || !canAnimate() || event.hasUAVisualTransition) return;
      event.stopImmediatePropagation();
      if (!navigation) positions.set(currentPath.current, scrollY);
      restoration ??= history.scrollRestoration;
      history.scrollRestoration = "manual";
      transition(location.pathname, navigation ? historyBack : location.pathname === "/", () => {
        // Next restores the existing history entry; no extra entries are written.
        replaying = true;
        try {
          window.dispatchEvent(new PopStateEvent("popstate", { state: event.state }));
        } finally {
          replaying = false;
        }
      }, positions.get(entryKey()) ?? 0);
    }

    document.addEventListener("click", click, true);
    navigation?.addEventListener("navigate", navigate);
    window.addEventListener("popstate", pop, true);
    return () => {
      document.removeEventListener("click", click, true);
      navigation?.removeEventListener("navigate", navigate);
      window.removeEventListener("popstate", pop, true);
      active?.skipTransition();
      pending.current?.resolve();
      if (restoration !== null) history.scrollRestoration = restoration;
      delete document.documentElement.dataset.pageTransition;
      document.documentElement.style.removeProperty("--page-out-offset");
    };
  }, [router]);

  return null;
}
