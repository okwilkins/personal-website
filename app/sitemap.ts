import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/` },
    { url: `${site.url}/experience/` },
    { url: `${site.url}/projects/` },
    { url: `${site.url}/services/` },
  ];
}
