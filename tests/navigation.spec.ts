import { test, expect } from "@playwright/test";

test("slow experience navigation releases the page and preserves history scrolling", async ({ page }) => {
  const animations: string[][] = [];
  let starts = 0;
  await page.exposeFunction("recordPageTransition", (names?: string[]) => {
    if (names) animations.push(names);
    else starts++;
  });
  await page.addInitScript(() => {
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = (update) => {
      const report = (window as unknown as { recordPageTransition: (names?: string[]) => void }).recordPageTransition;
      report();
      const next = start(update);
      void next.ready.then(() => report(document.getAnimations().map((animation) => (animation as CSSAnimation).animationName))).catch(() => {});
      return next;
    };
  });
  await page.context().grantPermissions(["clipboard-write"]);
  const held = Promise.withResolvers<void>();
  const requested = Promise.withResolvers<void>();
  await page.route("**/experience/**", async (route) => {
    requested.resolve();
    await held.promise;
    await route.continue();
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("/");
    const link = page.getByRole("link", { name: "Full experience", exact: true });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await requested.promise;

    const status = page.getByRole("status").filter({ hasText: "Loading…" });
    await expect(status).toBeVisible({ timeout: 1500 });
    await expect.poll(() => page.evaluate(() => document.activeViewTransition === null)).toBe(true);
    await expect(page.locator("html")).not.toHaveAttribute("data-page-transition");

    // Rendering and real controls must work before the response arrives.
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Copied" })).toBeVisible();
    await expect(status).toBeVisible();
    expect(starts).toBe(0);
    const previousTop = await page.evaluate(() => {
      scrollTo({ top: 320, behavior: "instant" });
      return scrollY;
    });

    held.resolve();
    await expect.poll(() => animations.length).toBe(1);
    expect(animations[0]).toEqual(expect.arrayContaining(["page-in", "page-out"]));
    await expect(page).toHaveURL(/\/experience\/$/);
    await expect(page.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
    await expect(status).not.toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-page-transition");
    await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(previousTop);
    await page.evaluate(() => document.activeViewTransition?.finished);
    await page.goForward();
    await expect(page).toHaveURL(/\/experience\/$/);
    await page.evaluate(() => document.activeViewTransition?.finished);
    await expect(status).not.toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    held.resolve();
  }
});

test("another link can supersede a slow navigation without stale cleanup", async ({ page }) => {
  const held = Promise.withResolvers<void>();
  const requested = Promise.withResolvers<void>();
  const responded = Promise.withResolvers<void>();
  await page.route("**/experience/**", async (route) => {
    const response = await route.fetch();
    requested.resolve();
    await held.promise;
    await route.fulfill({ response });
    responded.resolve();
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto("/");
    await page.getByRole("link", { name: "Full experience", exact: true }).click();
    await requested.promise;
    const status = page.getByRole("status").filter({ hasText: "Loading…" });
    await expect(status).toBeVisible();
    await page.getByRole("link", { name: "All projects", exact: true }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
    await page.evaluate(() => document.activeViewTransition?.finished);

    held.resolve();
    await responded.promise;
    await expect(status).not.toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-page-transition");
    await page.getByRole("link", { name: "Back home" }).click();
    await expect(page).toHaveURL(/\/#projects$/);
    await expect(page.locator("#projects-heading")).toBeVisible();
    await page.evaluate(() => document.activeViewTransition?.finished);
    await expect(status).not.toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    held.resolve();
  }
});

test("returning to the current route clears pending loading feedback", async ({ page }) => {
  const held = Promise.withResolvers<void>();
  await page.route("**/experience/**", async (route) => {
    await held.promise;
    await route.continue();
  });
  try {
    await page.goto("/");
    await page.getByRole("link", { name: "Full experience", exact: true }).click();
    const status = page.getByRole("status").filter({ hasText: "Loading…" });
    await expect(status).toBeVisible();
    await page.getByRole("link", { name: "Oli Wilkins — home", exact: true }).click();
    await expect(status).not.toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-page-transition");
    await expect(page).toHaveURL(/\/$/);
    held.resolve();
    await expect(page.getByRole("heading", { name: "Oli Wilkins", exact: true })).toBeVisible();
  } finally {
    held.resolve();
  }
});

test("a failed route request releases the transition before Next retries a document navigation", async ({ page }) => {
  const held = Promise.withResolvers<void>();
  const requested = Promise.withResolvers<void>();
  await page.route("**/experience/**", async (route) => {
    if (route.request().headers().rsc !== "1") {
      await route.continue();
      return;
    }
    requested.resolve();
    await held.promise;
    await route.abort("failed");
  });
  try {
    await page.goto("/");
    await page.getByRole("link", { name: "Full experience", exact: true }).click();
    await requested.promise;
    await expect(page.getByRole("status").filter({ hasText: "Loading…" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeViewTransition === null)).toBe(true);
    held.resolve();
    await expect(page).toHaveURL(/\/experience\/$/);
    await expect(page.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Loading…" })).not.toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-page-transition");
    expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
  } finally {
    held.resolve();
  }
});

for (const failure of ["throws", "skips"] as const) {
  test(`navigation still works when the browser ${failure} the transition`, async ({ page }) => {
    await page.addInitScript((failure) => {
      const original = document.startViewTransition.bind(document);
      document.startViewTransition = (update) => {
        if (failure === "throws") throw new Error("Transition unavailable");
        const next = original(update);
        next.skipTransition();
        return next;
      };
    }, failure);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.getByRole("link", { name: "Full experience", exact: true }).click();
    await expect(page).toHaveURL(/\/experience\/$/);
    await expect(page.getByRole("heading", { name: "Experience", exact: true })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Loading…" })).not.toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-page-transition");
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("#experience-heading")).toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-page-transition");
    expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
    // React reports an explicitly skipped browser transition as a recoverable error.
    expect(errors).toEqual(failure === "skips" ? [
      expect.stringContaining("skipTransition() called"),
      expect.stringContaining("skipTransition() called"),
    ] : []);
  });
}
