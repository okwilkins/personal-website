import { parseAllDocuments } from "yaml";
import { serviceDetails, site } from "@/data/site";
import { logger } from "@/lib/logger";

const repository = `${site.handle}/h8s`;
const directory = "networking/gateways/base/http-routes";
const options = {
  headers: { Accept: "application/vnd.github+json" },
  next: { revalidate: 3600 },
};

type Route = { id: string; href: string };
export type PublicService = Route & { name: string; description?: string };

export function publicRoutes(source: string): Route[] {
  return parseAllDocuments(source).flatMap((document) => {
    if (document.errors.length) throw document.errors[0];
    const route = document.toJS();
    if (
      route?.kind !== "HTTPRoute" ||
      typeof route.metadata?.name !== "string" ||
      !route.spec?.parentRefs?.some(
        (parent: { name?: string; namespace?: string }) =>
          parent.name === "cloudflare-gateway" &&
          (parent.namespace ?? route.metadata.namespace) === "cloudflare",
      )
    ) return [];

    return (route.spec.hostnames ?? [])
      .filter(
        (hostname: unknown): hostname is string =>
          typeof hostname === "string" &&
          /^[a-z0-9-]+\.okwilkins\.dev$/.test(hostname),
      )
      .map((hostname: string) => ({
        id: route.metadata.name,
        href: `https://${hostname}/`,
      }));
  });
}

export async function publicServices(): Promise<PublicService[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repository}/contents/${directory}?ref=main`,
      { ...options, signal: AbortSignal.timeout(3000) },
    );
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const files: { type: string; path: string }[] = await response.json();
    const routes = await Promise.all(
      files
        .filter((file) => file.type === "file" && /\.ya?ml$/.test(file.path))
        .map(async (file) => {
          try {
            const response = await fetch(
              `https://raw.githubusercontent.com/${repository}/main/${file.path}`,
              { ...options, signal: AbortSignal.timeout(3000) },
            );
            if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
            return publicRoutes(await response.text());
          } catch (err) {
            logger.warn({ err, path: file.path }, "Homelab route unavailable");
            return [];
          }
        }),
    );
    return [...new Map(routes.flat().map((route) => [route.href, route])).values()]
      .map((route) => ({
        ...route,
        name: serviceDetails[route.id]?.name ?? route.id.replaceAll("-", " "),
        description: serviceDetails[route.id]?.description,
      }))
      .sort((a, b) =>
        Number(!!serviceDetails[b.id]?.featured) - Number(!!serviceDetails[a.id]?.featured) ||
        a.name.localeCompare(b.name, "en-GB"),
      );
  } catch (err) {
    logger.warn({ err, repository }, "Public homelab services unavailable");
    return [];
  }
}
