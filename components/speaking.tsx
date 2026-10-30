import { ArrowUpRight } from "lucide-react";
import { ResourceLink } from "@/components/resource-link";
import { talk } from "@/data/site";

export function Speaking() {
  return (
    <section className="section surface" aria-labelledby="speaking-heading">
      <div className="section-title mb-0">
        <h2 id="speaking-heading">Speaking</h2>
      </div>
      <div className="resource-list py-2">
        <ResourceLink href={talk.href}>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold transition-colors group-hover:text-white group-active:text-white">
              {talk.title}
            </h3>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">{talk.event}</p>
            <p className="mt-2 text-sm leading-[1.75] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">
              {talk.description}
            </p>
          </div>
          <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-white group-active:text-white" />
        </ResourceLink>
      </div>
    </section>
  );
}
