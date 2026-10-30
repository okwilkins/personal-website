"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "services", label: "Services" },
];

export function SectionNav({ hasServices }: { hasServices: boolean }) {
  const [active, setActive] = useState("");
  const items = hasServices ? sections : sections.slice(0, 2);

  useEffect(() => {
    const targets = sections
      .map(({ id }) => document.getElementById(id))
      .filter((section) => section !== null);
    let frame = 0;

    function update() {
      frame = 0;
      const line = (document.getElementById("site-header")?.offsetHeight ?? 0) + Math.min(innerHeight / 3, 160);
      let current = "";
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= line) current = target.id;
      }
      const root = document.documentElement;
      if (scrollY > 0 && scrollY + root.clientHeight >= root.scrollHeight - 1) {
        current = targets.at(-1)?.id ?? current;
      }
      setActive(current);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [hasServices]);

  return (
    <nav aria-label="On this page" className="order-3 flex w-full gap-5 sm:order-2 sm:w-auto sm:gap-6">
      {items.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? "location" : undefined}
          className={`inline-flex min-h-11 items-center font-mono text-[11px] transition-colors hover:text-white ${active === id ? "font-bold text-white" : "font-normal text-muted-foreground"}`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
