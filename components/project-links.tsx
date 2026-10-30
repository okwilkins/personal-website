import { ArrowUpRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResourceLink } from "@/components/resource-link";
import type { GitHubProject } from "@/lib/github";

export function ProjectLinks({ projects, preview = false }: {
  projects: GitHubProject[];
  preview?: boolean;
}) {
  return (
    <div className={`resource-list${preview ? " section-preview" : ""}`}>
      <ul className="divide-y">
        {(preview ? projects.slice(0, 3) : projects).map((project, index) => {
          const faded = preview && index === 2;
          return (
            <li
              key={project.href}
              className={`py-2 ${faded ? "preview-peek overflow-hidden" : ""}`}
            >
              <ResourceLink href={project.href}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="min-w-0 break-words font-mono text-[15px] font-semibold tracking-tight transition-colors group-hover:text-white group-active:text-white">
                      {project.name}
                    </h3>
                    {project.stars !== null && (
                      <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">
                        <Star aria-hidden="true" className="size-3" />
                        {project.stars.toLocaleString("en-GB")}
                        <span className="sr-only"> GitHub stars</span>
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="mt-2 max-w-[36rem] text-sm leading-[1.75] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">
                      {project.description}
                    </p>
                  )}
                  {project.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-sm border-border px-1.5 py-0.5 font-mono text-[11px] font-normal text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-white group-active:text-white" />
              </ResourceLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
