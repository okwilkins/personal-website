"use client";

import {
  addTransitionType, Component, useEffect, useLayoutEffect, useRef, useState,
  useTransition, ViewTransition, type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { updateViewportGlass } from "@/components/viewport-glass";

type BrowserNavigation = EventTarget & {
  currentEntry: { index: number; key: string } | null;
};

type NavigationEvent = Event & {
  navigationType: string;
  destination: { index: number };
};

type PendingNavigation = {
  path: string;
  previousScroll: number;
  prepare: () => void;
  complete: (matches: boolean) => void;
  cancel: () => void;
  animate: () => () => void;
};

class PageSnapshot extends Component<{ path: string; prepare: () => void; children: ReactNode }> {
  getSnapshotBeforeUpdate(previous: Readonly<{ path: string }>) {
    if (previous.path !== this.props.path) this.props.prepare();
    return null;
  }

  componentDidUpdate() {
    // React requires this lifecycle when taking a snapshot before the DOM changes.
  }

  render() {
    return this.props.children;
  }
}

export function NavigationMotion({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const pending = useRef<PendingNavigation | null>(null);
  const animating = useRef<PendingNavigation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useLayoutEffect(() => {
    const previousPath = currentPath.current;
    currentPath.current = pathname;
    const next = pending.current;
    if (next && previousPath !== pathname) next.complete(next.path === pathname);
  }, [pathname]);

  useEffect(() => {
    const next = animating.current;
    if (!next) return;
    // An urgent update can flush effects before the animation has finished.
    const active = document.activeViewTransition;
    if (active) void active.finished.finally(() => next.cancel()).catch(() => {});
    else next.cancel();
  }, [pathname]);

  useEffect(() => {
    const navigation = (window as Window & { navigation?: BrowserNavigation }).navigation;
    let historyBack = false;
    let replaying = false;
    let disposed = false;
    const positions = new Map<string, number>();
    const entryKey = () => navigation?.currentEntry?.key ?? location.pathname;

    function canAnimate() {
      return typeof document.startViewTransition === "function" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function transition(path: string, back: boolean, update: () => void, top?: number) {
      pending.current?.cancel();
      animating.current?.cancel();
      scrollTo({ top: scrollY, behavior: "instant" });
      const restoration = top === undefined ? null : history.scrollRestoration;
      if (restoration !== null) history.scrollRestoration = "manual";
      let replayTimer: ReturnType<typeof setTimeout> | undefined;

      function restoreHistory() {
        if (restoration !== null) history.scrollRestoration = restoration;
      }

      function finish() {
        if (animating.current !== request) return;
        animating.current = null;
        if (top !== undefined && location.pathname === path) {
          scrollTo({ top, behavior: "instant" });
          updateViewportGlass();
        }
        delete document.documentElement.dataset.pageTransition;
        delete document.documentElement.dataset.pageDirection;
        document.documentElement.style.removeProperty("--page-out-offset");
        restoreHistory();
      }

      const request: PendingNavigation = {
        path,
        previousScroll: scrollY,
        prepare() {
          request.previousScroll = scrollY;
          positions.set(entryKey(), scrollY);
          scrollTo({ top: scrollY, behavior: "instant" });
          document.documentElement.dataset.pageDirection = back ? "back" : "forward";
          document.documentElement.dataset.pageTransition = "";
        },
        complete(matches) {
          if (pending.current !== request) return;
          pending.current = null;
          clearTimeout(timer);
          if (matches && top !== undefined) scrollTo({ top, behavior: "instant" });
          updateViewportGlass();
          animating.current = request;
          document.documentElement.style.setProperty("--page-out-offset", `${scrollY - request.previousScroll}px`);
        },
        cancel() {
          clearTimeout(timer);
          clearTimeout(replayTimer);
          if (pending.current === request) {
            pending.current = null;
            restoreHistory();
            if (!disposed) setLoading(false);
          }
          finish();
        },
        animate() {
          // Stop any native history scroll that was queued during the DOM update.
          if (top !== undefined) scrollTo({ top, behavior: "instant" });
          window.dispatchEvent(new CustomEvent("character-scroll", { detail: back ? innerWidth : -innerWidth }));
          return finish;
        },
      };
      pending.current = request;
      setLoading(false);
      const timer = setTimeout(() => {
        if (pending.current === request) setLoading(true);
      }, 200);
      function run() {
        if (pending.current !== request) return;
        startTransition(() => {
          addTransitionType("page-navigation");
          update();
        });
      }
      // Leave the native popstate event before starting React's asynchronous transition.
      if (top !== undefined) replayTimer = setTimeout(run, 0);
      else run();
    }

    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname || !canAnimate()) {
        if (!link.getAttribute("href")?.startsWith("#")) pending.current?.cancel();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      positions.set(entryKey(), scrollY);
      transition(url.pathname, url.pathname === "/", () => router.push(url.pathname + url.search + url.hash));
    }

    function scroll() {
      if (pending.current) {
        pending.current.previousScroll = scrollY;
        positions.set(entryKey(), scrollY);
      }
    }

    function navigate(event: Event) {
      const { navigationType, destination } = event as NavigationEvent;
      // Next writes history after mutating content; keep the outgoing page's saved scroll.
      if (!pending.current) positions.set(entryKey(), scrollY);
      if (navigationType === "traverse" && navigation?.currentEntry) {
        historyBack = destination.index < navigation.currentEntry.index;
      }
    }

    function pop(event: PopStateEvent) {
      if (replaying) return;
      if (location.pathname === currentPath.current || !event.state?.__NA || !canAnimate() || event.hasUAVisualTransition) {
        pending.current?.cancel();
        return;
      }
      event.stopImmediatePropagation();
      if (!navigation) positions.set(currentPath.current, scrollY);
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
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      disposed = true;
      document.removeEventListener("click", click, true);
      navigation?.removeEventListener("navigate", navigate);
      window.removeEventListener("popstate", pop, true);
      window.removeEventListener("scroll", scroll);
      pending.current?.cancel();
      animating.current?.cancel();
    };
  }, [router, startTransition]);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`pointer-events-none fixed right-4 bottom-[calc(1rem_+_env(safe-area-inset-bottom))] z-50 rounded-md border bg-background/95 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm ${isPending && loading ? "" : "sr-only"}`}
      >
        {isPending && loading ? "Loading…" : ""}
      </div>
      <PageSnapshot path={pathname} prepare={() => pending.current?.prepare()}>
        <ViewTransition
          name="site-content"
          default="none"
          update={{ "page-navigation": "page-slide", default: "none" }}
          onUpdate={() => animating.current?.animate()}
        >
          {children}
        </ViewTransition>
      </PageSnapshot>
    </>
  );
}
