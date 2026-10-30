import { test, expect } from "@playwright/test";

const resources = [
  {
    name: "project",
    previewName: "inferlace",
    pages: [
      { path: "/", section: "#projects" },
      { path: "/projects/", section: '[aria-label="GitHub projects"]' },
    ],
  },
  {
    name: "service",
    previewName: "Authelia",
    pages: [
      { path: "/", section: "#services" },
      { path: "/services/", section: '[aria-label="Public services"]' },
    ],
  },
];

for (const resource of resources) {
  test(`${resource.name} descriptions open their row destination`, async ({ page, context, isMobile }) => {
    for (const { path, section } of resource.pages) {
      await page.goto(path);
      const row = page.locator(section).getByRole("listitem").first();
      const description = row.locator("p").first();
      const href = await row.getByRole("link").getAttribute("href");
      expect(href).toMatch(/^https:\/\//);
      // Fulfill the popup locally so this check never visits the external site.
      await context.route(href!, (route) => route.fulfill({ body: "External destination intercepted" }));
      const popupPromise = page.waitForEvent("popup");
      if (isMobile) await description.tap({ position: { x: 10, y: 10 } });
      else await description.click({ position: { x: 10, y: 10 } });
      const popup = await popupPromise;
      try {
        await expect(popup).toHaveURL(href!);
        await expect(page).toHaveURL(new URL(path, "http://127.0.0.1:3000").href);
      } finally {
        await popup.close();
        await context.unroute(href!);
      }
    }
  });

  test(`faded ${resource.name} preview remains clickable`, async ({ page, context, isMobile }) => {
    await page.goto("/");
    const row = page.locator(resource.pages[0].section).getByRole("listitem").nth(2);
    const heading = row.getByRole("heading");
    await expect(heading).toHaveText(resource.previewName);
    const href = await row.getByRole("link").getAttribute("href");
    expect(href).toMatch(/^https:\/\//);
    await context.route(href!, (route) => route.fulfill({ body: "External destination intercepted" }));
    const popupPromise = page.waitForEvent("popup");
    if (isMobile) await heading.tap({ position: { x: 10, y: 10 } });
    else await heading.click({ position: { x: 10, y: 10 } });
    const popup = await popupPromise;
    try {
      await expect(popup).toHaveURL(href!);
      await expect(page).toHaveURL("http://127.0.0.1:3000/");
    } finally {
      await popup.close();
      await context.unroute(href!);
    }
  });

  test(`${resource.name} descriptions remain selectable without opening a tab`, async ({ page, context, isMobile }) => {
    test.skip(isMobile, "Mouse drag selection requires a desktop pointer.");

    for (const { path, section } of resource.pages) {
      await page.goto(path);
      await context.route("https://**", (route) => route.fulfill({ body: "Unexpected external navigation" }));
      const row = page.locator(section).getByRole("listitem").first();
      const link = row.getByRole("link");
      const description = row.locator("p").first();
      await description.scrollIntoViewIfNeeded();
      const selection = await description.evaluate((element) => {
        const text = element.firstChild!;
        const end = Math.min(24, text.textContent!.length);
        const startRange = document.createRange();
        startRange.setStart(text, 0);
        startRange.setEnd(text, 1);
        const start = startRange.getBoundingClientRect();
        const endRange = document.createRange();
        endRange.setStart(text, end - 1);
        endRange.setEnd(text, end);
        const finish = endRange.getBoundingClientRect();
        return {
          start: { x: start.left, y: start.top + start.height / 2 },
          end: { x: finish.right, y: finish.top + finish.height / 2 },
          text: text.textContent!.slice(0, end),
        };
      });
      // Chromium can open the tab after mouse.up has resolved.
      const popupPromise = page.waitForEvent("popup", { timeout: 1000 }).catch(() => null);
      await page.mouse.move(selection.start.x, selection.start.y);
      await page.mouse.down();
      await page.mouse.move(selection.end.x, selection.end.y, { steps: 12 });
      await page.mouse.up();

      await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe(selection.text);
      await expect(page).toHaveURL(new URL(path, "http://127.0.0.1:3000").href);
      expect(await popupPromise).toBeNull();
      expect(context.pages()).toEqual([page]);

      // Selected text must not prevent keyboard activation of the same link.
      await link.focus();
      const destinationPromise = page.waitForEvent("popup");
      await link.press("Enter");
      const destination = await destinationPromise;
      try {
        await expect(destination).toHaveURL((await link.getAttribute("href"))!);
      } finally {
        await destination.close();
      }
      await context.unroute("https://**");
    }
  });
}
