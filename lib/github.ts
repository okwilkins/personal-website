import { projects, site } from "@/data/site";
import { logger } from "@/lib/logger";

export type GitHubProject = {
  name: string;
  href: string;
  description: string;
  tags: readonly string[];
  stars: number | null;
};

export function pinnedRepositories(html: string): string[] | null {
  // GitHub renders this list in public profile HTML; no browser or token is needed.
  const list = html.match(
    /<h2\b[^>]*>\s*Pinned\b[\s\S]*?<\/h2>\s*<ol\b[^>]*\bclass="[^"]*\bjs-pinned-items-reorder-list\b[^"]*"[^>]*>([\s\S]*?)<\/ol>/i,
  );
  if (!list) return null;

  const repositories = Array.from(
    list[1].matchAll(
      /<a\b[^>]*\bhref="\/([A-Za-z0-9-]+\/[A-Za-z0-9_.-]+)"[^>]*>\s*<span\b[^>]*\bclass="repo"[^>]*>/g,
    ),
    (match) => match[1],
  ).filter((repository) => ![".", ".."].includes(repository.split("/")[1]));

  return repositories.length ? repositories : null;
}

export async function githubProjects(): Promise<GitHubProject[]> {
  let pins: string[] = [];
  try {
    const response = await fetch(`https://github.com/${site.handle}`, {
      headers: { Accept: "text/html" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      logger.warn(
        { statusCode: response.status },
        "GitHub pinned projects unavailable",
      );
    } else {
      const repositories = pinnedRepositories(await response.text());
      if (repositories) {
        pins = repositories;
      } else {
        logger.warn("GitHub pinned projects markup unavailable");
      }
    }
  } catch (err) {
    logger.warn({ err }, "GitHub pinned projects unavailable");
  }

  const seen = new Set<string>();
  const repositories = [
    ...projects.map((project) => new URL(project.href).pathname.slice(1)),
    ...pins,
  ].filter((repository) => {
    const key = repository.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return Promise.all(
    repositories.map(async (repository): Promise<GitHubProject> => {
      const href = `https://github.com/${repository}`;
      const curated = projects.find(
        (project) => project.href.toLowerCase() === href.toLowerCase(),
      );
      const fallback: GitHubProject = {
        name: repository.split("/")[1],
        href,
        description: curated?.description ?? "",
        tags: [],
        stars: null,
      };

      try {
        const response = await fetch(
          `https://api.github.com/repos/${repository}`,
          {
            headers: { Accept: "application/vnd.github+json" },
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(3000),
          },
        );
        if (!response.ok) {
          logger.warn(
            { repository, statusCode: response.status },
            "GitHub project unavailable",
          );
          return fallback;
        }

        const data = await response.json();
        return {
          ...fallback,
          description:
            typeof data.description === "string" ? data.description : "",
          tags: Array.isArray(data.topics)
            ? data.topics.filter(
                (topic: unknown): topic is string => typeof topic === "string",
              )
            : [],
          stars:
            Number.isInteger(data.stargazers_count) && data.stargazers_count >= 0
              ? data.stargazers_count
              : null,
        };
      } catch (err) {
        logger.warn({ err, repository }, "GitHub project unavailable");
        return fallback;
      }
    }),
  );
}
