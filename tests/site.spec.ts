import { test, expect } from "@playwright/test";

test("profile, project preview, and navigation work without overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("Oli Wilkins");
  await expect(
    page.getByRole("heading", { name: "Oli Wilkins", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#projects h3")).toHaveText([
    "h8s",
    ".dotfiles",
    "inferlace",
  ]);
  for (const name of ["h8s", ".dotfiles", "inferlace"]) {
    await expect(
      page.locator(`a[href="https://github.com/okwilkins/${name}"]`),
    ).toBeVisible();
  }
  await expect(
    page.getByRole("button", { name: "Copy email", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Likezero", { exact: true })).toBeVisible();
  await expect(page.locator("#experience").getByRole("listitem")).toHaveCount(3);
  await expect(page.locator("#projects").getByRole("listitem")).toHaveCount(3);
  for (const entry of await page.locator("#experience li").all()) {
    const title = await entry.getByRole("heading").boundingBox();
    const marker = await entry.locator(":scope > span").boundingBox();
    expect(title!.x).toBeGreaterThan(marker!.x + marker!.width + 12);
  }
  await expect(page.getByRole("heading", { name: /Speaking/ })).toHaveCount(0);
  await expect(page.getByText("London, UK", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Oli Wilkins — home" })).toBeVisible();
  for (const link of await page.getByRole("link").all()) {
    const bounds = await link.boundingBox();
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
    expect(bounds?.width).toBeGreaterThanOrEqual(44);
  }
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("section navigation follows scrolling and returns to earlier sections", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "On this page" });
  for (const [id, label] of [["experience", "Experience"], ["projects", "Projects"], ["services", "Services"]]) {
    await page.locator(`#${id}`).evaluate((section) => {
      scrollTo({ top: scrollY + section.getBoundingClientRect().top - 100, behavior: "instant" });
    });
    await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "location");
    await expect(navigation.locator("[aria-current]")).toHaveCount(1);
    if (id !== "experience") {
      await expect.poll(() => page.locator("#site-header").evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(0);
    }
  }
  await navigation.getByRole("link", { name: "Experience", exact: true }).click();
  await expect(navigation.getByRole("link", { name: "Experience", exact: true })).toHaveAttribute("aria-current", "location");
  await expect(page).toHaveURL(/#experience$/);
});

test("footer stays fully visible with padding at the end of every page", async ({ page }) => {
  for (const path of ["/", "/experience/", "/projects/", "/services/"]) {
    await page.goto(path);
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeInViewport({ ratio: 1 });
    await expect(footer.getByRole("link", { name: "Source" })).toBeVisible();
    await expect(footer.getByText(/Oli Wilkins/)).toBeVisible();
    await expect.poll(() => page.locator(".viewport-glass").evaluate((element) => getComputedStyle(element, "::after").opacity)).toBe("0");
    expect(await footer.evaluate((element) => document.documentElement.clientHeight - element.getBoundingClientRect().bottom)).toBeGreaterThanOrEqual(31);
  }
});

test("Back home stays pinned above the content fade on detail pages", async ({ page }) => {
  for (const path of ["/experience/", "/projects/", "/services/"]) {
    await page.goto(path);
    await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
    const header = page.locator("#site-header");
    await expect.poll(() => header.evaluate((element) => element.getBoundingClientRect().top)).toBe(0);
    await expect(header.getByRole("link", { name: "Back home" })).toBeInViewport({ ratio: 1 });
    const height = await header.evaluate((element) => element.getBoundingClientRect().height);
    await expect.poll(() => page.locator(".viewport-glass").evaluate((element) =>
      parseFloat(getComputedStyle(element, "::before").top),
    )).toBe(height);
  }
});

test("email copies to the clipboard and confirms quietly", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const copy = page.getByRole("button", { name: "Copy email", exact: true });
  const feedback = page.getByRole("status");

  await copy.click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("okwilkins@gmail.com");
  await expect(feedback).toHaveText("Copied");
  await expect(feedback).toBeEmpty();

  // A denied clipboard request must not claim success; keyboard activation still works.
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => { throw new DOMException("Denied", "NotAllowedError"); };
  });
  await copy.focus();
  await copy.press("Enter");
  await expect(feedback).toHaveText("Couldn't copy");
});

test("full experience page contains the CV and returns home", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Full experience", exact: true }).click();
  await expect(page).toHaveURL(/\/experience\/$/);
  await expect(page).toHaveTitle("Oli Wilkins");
  await expect(
    page.getByRole("heading", { name: "Experience", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Professional Experience", "Education", "Talks",
  ]);
  await expect(page.getByRole("list", { name: "Skills" }).getByRole("listitem")).toHaveText([
    "Python", "Dynamo/vLLM", "LLM Inference", "Kubernetes", "Platform Engineering", "AWS", "Nix", "Linux",
  ]);
  await expect(
    page.getByRole("list", { name: "Professional experience" }).getByRole("heading"),
  ).toHaveText([
    "Likezero",
    "Applied Data Science Partners",
    "Liveminds and Maeving",
    "Laing O'Rourke",
    "Faceit",
    "Various Companies",
  ]);
  await expect(page.getByRole("list", { name: "Professional experience" }).locator(":scope > li > ul > li")).toHaveCount(18);
  await expect(page.getByText("Cut LLM cold-starts by 80%, raised KV cache hit rates and 2-4x increased tokens decode throughput.", { exact: false })).toBeVisible();
  await expect(page.getByText("BSc (Hons) Physics and Mathematics")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Talks", exact: true })).toBeVisible();
  await expect(page.getByText("Accelerating GPU workloads on AWS: from GenAI to HPC", { exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://okwilkins.dev/experience/",
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await page.getByRole("link", { name: "Back home" }).click();
  await expect(page).toHaveURL(/\/#experience$/);
  await expect(page.locator("#experience-heading")).toBeVisible();
  expect(errors).toEqual([]);
});

test("experience link opens the full page and browser Back restores the preview", async ({
  page,
}) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Full experience", exact: true });
  await link.focus();
  await link.press("Enter");
  await expect(page).toHaveURL(/\/experience\/$/);
  await expect(page.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
  await expect(page.locator("#projects")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#experience").getByRole("listitem")).toHaveCount(3);

  // The same link works with reduced motion and without View Transition support.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => {
    Object.defineProperty(document, "startViewTransition", { value: undefined });
  });
  await page.getByRole("link", { name: "Full experience", exact: true }).click();
  await expect(page).toHaveURL(/\/experience\/$/);
  await expect(page.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
});

test("projects preview opens the pinned directory and returns to its section", async ({ page }) => {
  await page.goto("/");
  const preview = page.locator("#projects");
  await expect(preview.getByRole("listitem")).toHaveCount(3);
  await expect(preview.locator("li").nth(2)).toContainText("inferlace");
  const link = preview.getByRole("link", { name: "All projects", exact: true });
  await link.focus();
  await link.press("Enter");
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page).toHaveTitle("Oli Wilkins");
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://okwilkins.dev/projects/");
  const directory = page.getByRole("region", { name: "GitHub projects" });
  expect(await directory.getByRole("listitem").count()).toBeGreaterThanOrEqual(3);
  await expect(directory.getByRole("heading", { level: 3 }).first()).toHaveText("h8s");
  await expect(directory.getByRole("heading", { level: 3 }).nth(1)).toHaveText(".dotfiles");
  await expect(directory.getByRole("heading", { level: 3 }).nth(2)).toHaveText("inferlace");
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(preview.getByRole("listitem")).toHaveCount(3);
});

test("services preview opens the full public directory and returns home", async ({ page }) => {
  await page.goto("/");
  const preview = page.locator("#services");
  await expect(preview.getByRole("listitem")).toHaveCount(3);
  await preview.getByRole("link", { name: "All services", exact: true }).click();
  await expect(page).toHaveURL(/\/services\/$/);
  await expect(page).toHaveTitle("Oli Wilkins");
  await expect(page.getByRole("heading", { name: "Services", exact: true })).toBeVisible();
  const directory = page.getByRole("region", { name: "Public services" });
  expect(await directory.getByRole("link").count()).toBeGreaterThan(2);
  for (const link of await directory.getByRole("link").all()) {
    await expect(link).toHaveAttribute("href", /^https:\/\/[^/]+\.okwilkins\.dev\/$/);
  }
  await expect(directory.locator('a[href*="prometheus."], a[href*="argocd."], a[href*="hubble."], a[href*="workflows."]')).toHaveCount(0);
  await page.getByRole("link", { name: "Back home" }).click();
  await expect(page).toHaveURL(/\/#services$/);
  await expect(preview.getByRole("listitem")).toHaveCount(3);
});

test("home renders the character field and keyboard navigation works", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole("heading", { name: "Oli Wilkins", exact: true }),
  ).toBeVisible();
  const canvas = page.locator("canvas[data-character-grid]");
  await expect(canvas).toHaveCSS("pointer-events", "none");
  await expect
    .poll(() =>
      canvas.evaluate((element) => (element as HTMLCanvasElement).width),
    )
    .toBeGreaterThan(0);

  const hardware = await canvas.evaluate((element) => {
    const gl = (element as HTMLCanvasElement).getContext("webgl2");
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    return !/swiftshader|llvmpipe|softpipe|software/i.test(
      String(gl.getParameter(info?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER)),
    );
  });
  // Compare the canvas independently of foreground hover states and glass fades.
  const foreground = hardware
    ? await page.addStyleTag({
        content: "[data-site-content] { visibility: hidden !important; }",
      })
    : null;
  if (hardware) {
    const initial = await canvas.screenshot();
    // Touch screens get the drifting waves too.
    await expect
      .poll(async () => initial.equals(await canvas.screenshot()))
      .toBe(false);
  }
  if (testInfo.project.name === "desktop" && hardware) {
    const brightness = async () => {
      const screenshot = await page.screenshot({
        clip: { x: 20, y: 300, width: 220, height: 160 },
        scale: "css",
      });
      return page.evaluate(async (png) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const sample = document.createElement("canvas");
        sample.width = 220;
        sample.height = 160;
        const context = sample.getContext("2d")!;
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, 220, 160).data;
        let total = 0;
        for (let i = 0; i < pixels.length; i += 4)
          total +=
            Math.max(0, pixels[i] - 11) +
            Math.max(0, pixels[i + 1] - 11) +
            Math.max(0, pixels[i + 2] - 11);
        return total;
      }, screenshot.toString("base64"));
    };
    await expect.poll(brightness).toBeGreaterThan(0);
    let before = await brightness();
    // The field drifts even without pointer input.
    await expect.poll(brightness).not.toBe(before);
    before = await brightness();
    await page.mouse.move(30, 370);
    await page.mouse.move(230, 370, { steps: 12 });
    await expect.poll(brightness).toBeGreaterThan(before * 1.15);
    const peak = await brightness();
    await page.evaluate(() => {
      document.documentElement.dispatchEvent(new PointerEvent("pointerleave"));
      window.dispatchEvent(new Event("blur"));
    });
    await expect
      .poll(brightness)
      .toBeGreaterThan(before + (peak - before) * 0.1);
    await page.mouse.move(1100, 650);
    // A wake remains behind the pointer, then fades without further input.
    await expect
      .poll(brightness)
      .toBeGreaterThan(before + (peak - before) * 0.1);
    await expect.poll(brightness).toBeLessThan(before + (peak - before) * 0.35);
  }

  if (hardware) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const still = await canvas.screenshot();
    await page.mouse.move(30, 370);
    await page.mouse.move(230, 370, { steps: 12 });
    if (testInfo.project.name === "mobile") await page.touchscreen.tap(150, 370);
    else await page.mouse.click(150, 370);
    await page.evaluate(() => scrollBy({ top: 120, behavior: "instant" }));
    await page.waitForTimeout(150);
    expect(still.equals(await canvas.screenshot())).toBe(true);
  }

  await foreground?.evaluate((element) => element.parentNode?.removeChild(element));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("Prometheus measures real responses with bounded route labels", async ({
  request,
}) => {
  await request.get("/");
  const missing = await request.get("/missing-test-page?private=do-not-log");
  expect(missing.status()).toBe(404);
  expect(missing.headers()["x-request-id"]).toBeTruthy();
  const health = await request.get("/healthz");
  expect(await health.text()).toBe("ok\n");
  const response = await request.get("/metrics");
  expect(response.headers()["content-type"]).toContain("text/plain");
  const metrics = await response.text();
  expect(metrics).toMatch(
    /personal_website_http_requests_total\{method="GET",route="\/",status_code="200"\} [1-9]/,
  );
  expect(metrics).toContain('route="unmatched",status_code="404"');
  expect(metrics).toContain(
    "personal_website_http_request_duration_seconds_bucket",
  );
  expect(metrics).toContain("personal_website_process_resident_memory_bytes");
  expect(metrics).not.toContain("missing-test-page");
  expect(metrics).not.toContain("do-not-log");
  expect((await request.post("/metrics")).status()).toBe(405);
});
