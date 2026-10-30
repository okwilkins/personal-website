import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";

export function BackHomeHeader({ href }: { href: string }) {
  return (
    <header id="site-header" className="surface guide sticky top-0 z-30 border-b bg-background px-6 sm:px-8">
      <Link
        href={href}
        transitionTypes={["page-reveal"]}
        className="text-link inline-flex min-h-11 min-w-11 items-center gap-1.5 text-xs"
      >
        <ArrowLeft aria-hidden="true" className="size-3" />
        Back home
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="shell surface guide flex flex-wrap items-center justify-between gap-4 border-y px-6 py-5 text-xs text-muted-foreground sm:px-8">
      <span>
        © {new Date().getFullYear()} {site.name}
      </span>
      <a
        href="https://github.com/okwilkins/personal-website"
        target="_blank"
        rel="noopener noreferrer"
        className="text-link inline-flex min-h-11 min-w-11 items-center gap-1"
      >
        Source <ArrowUpRight aria-hidden="true" className="size-3" />
      </a>
    </footer>
  );
}
