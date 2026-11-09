"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackgroundView({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!hidden) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previous; };
  }, [hidden]);

  return (
    <>
      <div id="site-foreground" inert={hidden} style={{ visibility: hidden ? "hidden" : undefined }}>
        {children}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 size-11 backdrop-blur-md"
        aria-label={hidden ? "Show content" : "Hide content"}
        title={hidden ? "Show content" : "Hide content"}
        aria-controls="site-foreground"
        aria-expanded={!hidden}
        onClick={() => setHidden(!hidden)}
      >
        {hidden ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
      </Button>
    </>
  );
}
