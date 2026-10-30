import { test, expect } from "@playwright/test";
import { projects } from "@/data/site";
import { githubProjects, pinnedRepositories } from "@/lib/github";

function profile(...repositories: string[]) {
  return `<h2>Pinned <span>Loading</span></h2>
    <ol class="list-style-none js-pinned-items-reorder-list">
      ${repositories.map((repository) => `<li class="pinned-item-list-item">
        <a href="/${repository}"><span class="repo">${repository.split("/")[1]}</span></a>
        <a href="/${repository}/stargazers">12</a>
      </li>`).join("")}
    </ol>`;
}

const originalFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("pins parser scopes repository links to the pinned list and validates paths", () => {
  const html = `<a href="/okwilkins/readme-link"><span class="repo">readme-link</span></a>
    ${profile(
      "okwilkins/.dotfiles",
      "another-owner/some.repo",
      "okwilkins/../bad",
      "okwilkins/..",
    )}
    <a href="/okwilkins/footer"><span class="repo">footer</span></a>`;

  expect(pinnedRepositories(html)).toEqual([
    "okwilkins/.dotfiles",
    "another-owner/some.repo",
  ]);
  expect(
    pinnedRepositories(
      profile("okwilkins/popular").replace("Pinned", "Popular repositories"),
    ),
  ).toBeNull();
  expect(
    pinnedRepositories(
      "<h2>Pinned</h2><ol><a href='/okwilkins/changed'>changed</a></ol>",
    ),
  ).toBeNull();
});

test("projects keep curated priorities, deduplicate pins, and use live GitHub metadata", async () => {
  const calls: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    expect(init).toMatchObject({ next: { revalidate: 3600 } });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    if (url === "https://github.com/okwilkins") {
      return new Response(profile(
        "okwilkins/.dotfiles",
        "another-owner/new.repo",
        "okwilkins/H8S",
        "okwilkins/rag-cli",
        "another-owner/new.repo",
      ));
    }
    return Response.json({
      description: `Live: ${url.split("/").at(-1)}`,
      topics: ["cuda", "inference", "gpu", "fourth-topic"],
      stargazers_count: 42,
    });
  };

  const result = await githubProjects();
  expect(result.map((project) => project.name)).toEqual([
    "h8s",
    ".dotfiles",
    "inferlace",
    "new.repo",
    "rag-cli",
  ]);
  expect(result[0]).toEqual({
    name: "h8s",
    href: "https://github.com/okwilkins/h8s",
    description: "Live: h8s",
    tags: ["cuda", "inference", "gpu", "fourth-topic"],
    stars: 42,
  });
  expect(result[3].href).toBe("https://github.com/another-owner/new.repo");
  expect(calls).toHaveLength(6);
});

test("metadata failure preserves current pins and uses curated fallback content", async () => {
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url === "https://github.com/okwilkins") {
      return new Response(profile("another-owner/new.repo"));
    }
    if (url.endsWith("/h8s")) throw new Error("timed out");
    if (url.endsWith("/inferlace")) return new Response("not JSON");
    return new Response("unavailable", { status: 503 });
  };

  expect(await githubProjects()).toEqual([
    ...projects.map((project) => ({ ...project, tags: [], stars: null })),
    {
      name: "new.repo",
      href: "https://github.com/another-owner/new.repo",
      description: "",
      tags: [],
      stars: null,
    },
  ]);
});

test("repositories without topics keep their star counts and omit tags", async () => {
  globalThis.fetch = async (input) => {
    if (String(input) === "https://github.com/okwilkins") {
      return new Response(profile("okwilkins/h8s"));
    }
    return Response.json({ description: "No topics set", stargazers_count: 14 });
  };

  const result = await githubProjects();
  expect(result.every((project) => project.tags.length === 0 && project.stars === 14)).toBe(true);
});

test("profile failure or changed markup falls back to the three featured projects", async () => {
  for (const profileResponse of [
    new Response("unavailable", { status: 503 }),
    new Response("<html>GitHub markup changed</html>"),
  ]) {
    globalThis.fetch = async (input) => {
      if (String(input) === "https://github.com/okwilkins") return profileResponse;
      return Response.json({ description: null, topics: [], stargazers_count: 0 });
    };

    const result = await githubProjects();
    expect(result.map((project) => project.name)).toEqual([
      "h8s", ".dotfiles", "inferlace",
    ]);
    expect(result.every((project) =>
      project.description === "" && project.tags.length === 0 && project.stars === 0,
    )).toBe(true);
  }
});
