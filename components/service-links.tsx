import { ArrowUpRight } from "lucide-react";
import { ResourceLink } from "@/components/resource-link";
import type { PublicService } from "@/lib/homelab";

export function ServiceLinks({ services, preview = false }: {
  services: PublicService[];
  preview?: boolean;
}) {
  return (
    <div className={`resource-list${preview ? " section-preview" : ""}`}>
      <ul className="divide-y">
        {(preview ? services.slice(0, 3) : services).map((service, index) => {
          const faded = preview && index === 2;
          return (
            <li key={service.href} className={`py-2 ${faded ? "preview-peek overflow-hidden" : ""}`}>
              <ResourceLink href={service.href}>
                <div className="min-w-0 flex-1">
                  <h3 className="font-mono text-[15px] font-semibold tracking-tight transition-colors group-hover:text-white group-active:text-white">{service.name}</h3>
                  {service.description && (
                    <p className="mt-2 max-w-[36rem] text-sm leading-[1.75] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">{service.description}</p>
                  )}
                  <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground group-active:text-foreground">{new URL(service.href).hostname}</p>
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
