"use client";

import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyEmail({ email }: { email: string }) {
  const [feedback, setFeedback] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setFeedback("Copied");
    } catch {
      setFeedback("Couldn't copy");
    }
    timer.current = setTimeout(() => setFeedback(""), 2000);
  }

  return (
    <span className="relative inline-flex">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Copy email"
        title={email}
        onClick={copy}
        className="size-11 text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
      >
        <Mail aria-hidden="true" className="size-4 sm:size-4.5" />
      </Button>
      <span
        role="status"
        className="pointer-events-none absolute top-full right-0 min-w-11 text-center font-mono text-[10px] whitespace-nowrap text-muted-foreground"
      >
        {feedback}
      </span>
    </span>
  );
}
