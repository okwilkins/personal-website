import { ArrowUpRight } from "lucide-react";
import { ResourceLink } from "@/components/resource-link";
import { talk } from "@/data/site";

export function Speaking() {
  return (
    <section className="section surface" aria-labelledby="speaking-heading">
      <div className="section-title mb-0">
        <h2 id="speaking-heading">Talks</h2>
      </div>
      <div className="resource-list -mx-[var(--resource-padding)] py-2">
        <ResourceLink href={talk.href}>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="min-w-0 text-[15px] font-semibold transition-colors group-hover:text-white group-active:text-white">
                {talk.title}
                <ArrowUpRight aria-hidden="true" className="ml-1 inline size-3.5 align-text-bottom text-muted-foreground transition-colors group-hover:text-white group-active:text-white" />
              </h3>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">{talk.date}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">{talk.event}</p>
            <p className="mt-2 text-sm leading-[1.75] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">{talk.subtitle}</p>
            <p className="mt-2 text-sm leading-[1.75] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">
              {talk.description}
            </p>
          </div>
        </ResourceLink>
      </div>
    </section>
  );
}
