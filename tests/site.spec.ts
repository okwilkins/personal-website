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

test("the space below the footer stays clear when a transition finishes", async ({ page }) => {
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 2000 });
  await page.addInitScript(() => {
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (update) => {
      const transition = original(update);
      void transition.ready.then(() => {
        for (const animation of document.getAnimations() as CSSAnimation[]) {
          if (/page-(in|out)/.test(animation.animationName)) {
            animation.pause();
            animation.currentTime = 380;
          }
        }
      }).catch(() => {});
      return transition;
    };
  });
  for (const path of ["projects", "services"]) {
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    // Make any extra dark backing beneath the footer easy to spot.
    await page.addStyleTag({ content: "body { background: #999; } canvas[data-character-grid] { opacity: 0 !important; }" });
    await page.locator(`a[href="/${path}/"]`).click();
    await page.waitForFunction(() => document.getAnimations().some((animation) =>
      (animation as CSSAnimation).animationName === "page-in" && animation.playState === "paused",
    ));
    const footer = (await page.getByRole("contentinfo").boundingBox())!;
    const clip = { x: Math.round(footer.x + footer.width / 2), y: Math.ceil(footer.y + footer.height) + 4, width: 8, height: 8 };
    expect(clip.y + clip.height).toBeLessThan(2000);
    const during = await page.screenshot({ clip });
    await page.evaluate(() => {
      document.activeViewTransition?.skipTransition();
      return document.activeViewTransition?.finished;
    });
    expect((await page.screenshot({ clip })).equals(during)).toBe(true);
    expect((await page.getByRole("contentinfo").boundingBox())!).toEqual(footer);
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

test("card slides respect link and browser history directions", async ({ page }) => {
  const slides: { incoming: number; outgoing: number; target: string; previousTop: number; outgoingTop: number }[] = [];
  await page.exposeFunction("recordSlide", (slide: typeof slides[number]) => slides.push(slide));
  await page.addInitScript(() => {
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (update) => {
      const previousTop = document.querySelector("[data-site-content]")!.getBoundingClientRect().top;
      const transition = original(update);
      void transition.ready.then(() => {
        const animations = document.getAnimations() as CSSAnimation[];
        const incoming = animations.find((animation) => animation.animationName === "page-in")?.effect as KeyframeEffect;
        const outgoing = animations.find((animation) => animation.animationName === "page-out")?.effect as KeyframeEffect;
        const report = (window as unknown as { recordSlide: (slide: object) => void }).recordSlide;
        const probe = document.createElement("div");
        probe.style.cssText = `position: fixed; visibility: hidden; width: ${document.documentElement.clientWidth}px`;
        document.body.append(probe);
        const offset = (transform: unknown) => {
          probe.style.transform = String(transform);
          return new DOMMatrixReadOnly(getComputedStyle(probe).transform).m41;
        };
        report({
          incoming: offset(incoming.getKeyframes()[0].transform),
          outgoing: offset(outgoing.getKeyframes().at(-1)!.transform),
          target: incoming.pseudoElement,
          previousTop,
          outgoingTop:
            new DOMMatrixReadOnly(getComputedStyle(document.documentElement, "::view-transition-group(site-content)").transform).m42 +
            new DOMMatrixReadOnly(getComputedStyle(document.documentElement, "::view-transition-old(site-content)").transform).m42,
        });
        probe.remove();
      });
      return transition;
    };
  });
  await page.goto("/");
  const distance = await page.locator(".site-card").evaluate((card) =>
    innerWidth < 640 ? document.documentElement.clientWidth : card.getBoundingClientRect().width,
  );
  const expectSlide = async (back: boolean, action: () => Promise<unknown>) => {
    const count = slides.length;
    await action();
    await expect.poll(() => slides.length).toBe(count + 1);
    expect(slides.at(-1)).toMatchObject({
      incoming: back ? -distance : distance,
      outgoing: back ? distance : -distance,
      target: "::view-transition-new(site-content)",
    });
    expect(slides.at(-1)!.outgoingTop).toBeCloseTo(slides.at(-1)!.previousTop, 2);
    await page.evaluate(() => document.activeViewTransition?.finished);
    expect(await page.evaluate(() => history.scrollRestoration)).toBe("auto");
  };
  for (const [label, path] of [["Full experience", "experience"], ["All projects", "projects"], ["All services", "services"]]) {
    const link = page.getByRole("link", { name: label, exact: true });
    await link.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await expectSlide(false, () => link.click());
    await expect(page).toHaveURL(new RegExp(`/${path}/$`));
    await expectSlide(true, () => page.goBack());
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(before);
    await expectSlide(false, () => page.goForward());
    await expectSlide(true, () => page.getByRole("link", { name: "Back home", exact: true }).click());
    await expect(page).toHaveURL(new RegExp(`/#${path}$`));
  }

  const count = slides.length;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("link", { name: "All projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await page.goBack();
  await expect(page.locator("#projects")).toBeVisible();
  expect(slides).toHaveLength(count);
});

test("navigation keeps the background fixed and sends a sideways scroll impulse", async ({ page }) => {
  const impulses: number[] = [];
  await page.exposeFunction("recordImpulse", (delta: number) => impulses.push(delta));
  // A static renderer lets this check catch accidental canvas/page translations.
  await page.addInitScript(() => {
    window.addEventListener("character-scroll", (event) => {
      const report = (window as unknown as { recordImpulse: (delta: number) => void }).recordImpulse;
      report((event as CustomEvent<number>).detail);
    });
    if (typeof WebGL2RenderingContext === "undefined") return;
    const original = WebGL2RenderingContext.prototype.getExtension;
    WebGL2RenderingContext.prototype.getExtension = function (name) {
      return name === "EXT_color_buffer_float" ? null : Reflect.apply(original, this, [name]);
    };
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const canvas = page.locator("canvas[data-character-grid]");
  await expect(canvas).toHaveCSS("view-transition-name", "none");
  await expect(page.locator("[data-site-content]")).toHaveCSS("view-transition-name", "site-content");
  await expect.poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).width)).toBeGreaterThan(0);
  const background = async () => {
    await page.evaluate(() => document.activeViewTransition?.finished);
    const hidden = await page.addStyleTag({ content: "[data-site-content], nextjs-portal { opacity: 0 !important; }" });
    const pixels = await canvas.screenshot();
    await hidden.evaluate((element) => element.parentNode?.removeChild(element));
    return pixels;
  };
  const home = await background();
  await page.getByRole("link", { name: "All projects", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  expect((await background()).equals(home)).toBe(true);
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Oli Wilkins", exact: true })).toBeVisible();
  expect((await background()).equals(home)).toBe(true);
  await page.goForward();
  await expect(page).toHaveURL(/\/projects\/$/);
  expect((await background()).equals(home)).toBe(true);
  await page.getByRole("link", { name: "Back home", exact: true }).click();
  await expect(page).toHaveURL(/\/#projects$/);
  expect((await background()).equals(home)).toBe(true);
  const width = await page.evaluate(() => innerWidth);
  expect(impulses).toEqual([-width, width, -width, width]);
});

test("sliding pages stay inside the card with a solid seam", async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop")
    await page.setViewportSize({ width: 2560, height: 900 });
  await page.addInitScript(() => {
    if (typeof WebGL2RenderingContext !== "undefined") {
      const getExtension = WebGL2RenderingContext.prototype.getExtension;
      WebGL2RenderingContext.prototype.getExtension = function (name) {
        return name === "EXT_color_buffer_float" ? null : Reflect.apply(getExtension, this, [name]);
      };
    }
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (update) => {
      const transition = original(update);
      void transition.ready.then(() => {
        for (const animation of document.getAnimations() as CSSAnimation[]) {
          if (/page-(in|out)/.test(animation.animationName)) animation.pause();
        }
      }).catch(() => {});
      return transition;
    };
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator('a[href="/projects/"]').scrollIntoViewIfNeeded();
  const card = (await page.locator(".site-card").boundingBox())!;
  const width = await page.evaluate(() => document.documentElement.clientWidth);
  // Leave a CSS pixel for antialiasing at fractional device-pixel boundaries.
  const sides = [
    { x: 0, y: 150, width: Math.floor(card.x) - 1, height: 500 },
    { x: Math.ceil(card.x + card.width) + 1, y: 150, width: width - Math.ceil(card.x + card.width) - 1, height: 500 },
  ];
  const background = await Promise.all(sides.map((clip) => page.screenshot({ clip })));
  for (const navigate of [
    () => page.locator('a[href="/projects/"]').evaluate((link) => (link as HTMLAnchorElement).click()),
    () => page.goBack(),
  ]) {
    await navigate();
    await page.waitForFunction(() => document.getAnimations().some((animation) =>
      (animation as CSSAnimation).animationName === "page-in" && animation.playState === "paused",
    ));
    for (const time of [0, 60, 85, 200, 379]) {
      await page.evaluate((time) => {
        for (const animation of document.getAnimations() as CSSAnimation[]) {
          if (/page-(in|out)/.test(animation.animationName)) animation.currentTime = time;
        }
      }, time);
      for (const [index, clip] of sides.entries()) {
        expect((await page.screenshot({ clip })).equals(background[index])).toBe(true);
      }
      if (time === 60) {
        const seam = await page.evaluate(() => {
          const root = document.documentElement;
          const card = document.querySelector(".site-card")!.getBoundingClientRect();
          const offset = new DOMMatrixReadOnly(getComputedStyle(root, "::view-transition-new(site-content)").transform).m41;
          return (root.dataset.pageDirection === "back" ? card.right : card.left) + offset;
        });
        const pixels = await page.screenshot({ clip: { x: Math.round(seam) - 1, y: 150, width: 3, height: 500 } });
        const peak = await page.evaluate(async (png) => {
          const image = new Image();
          image.src = `data:image/png;base64,${png}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d")!;
          context.drawImage(image, 0, 0);
          const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let peak = 0;
          for (let i = 0; i < data.length; i += 4) peak = Math.max(peak, data[i], data[i + 1], data[i + 2]);
          return peak;
        }, pixels.toString("base64"));
        expect(peak).toBeLessThanOrEqual(13);
      }
    }
    await page.evaluate(() => {
      for (const animation of document.getAnimations() as CSSAnimation[]) {
        if (/page-(in|out)/.test(animation.animationName)) animation.play();
      }
      return document.activeViewTransition?.finished;
    });
  }
});

test("side fades stay visible throughout page transitions", async ({ page }) => {
  await page.addInitScript(() => {
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (update) => {
      if (typeof update !== "function") return original(update);
      const positionStripe = () => {
        const content = document.querySelector<HTMLElement>("[data-site-content]")!;
        content.style.setProperty("--stripe-top", `${666 - content.getBoundingClientRect().top}px`);
      };
      positionStripe();
      const transition = original(async () => {
        await update();
        positionStripe();
      });
      void transition.ready.then(() => {
        for (const animation of document.getAnimations() as CSSAnimation[]) {
          if (/page-(in|out)/.test(animation.animationName)) {
            animation.pause();
            animation.currentTime = 0;
          }
        }
      }).catch(() => {});
      return transition;
    };
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // A flat bright backdrop makes disappearing or moving edge masks measurable.
  await page.addStyleTag({ content: `
    body { background: #999; }
    canvas[data-character-grid] { opacity: 0 !important; }
    [data-site-content]::after {
      content: ""; position: absolute; top: var(--stripe-top, 666px); inset-inline: 0; height: 4px;
      z-index: 50; background: white; pointer-events: none;
    }
  ` });
  await page.locator('a[href="/projects/"]').scrollIntoViewIfNeeded();
  const edges = await page.locator(".site-card").evaluate((card) => {
    const probe = document.createElement("div");
    probe.style.cssText = "position: absolute; visibility: hidden; width: var(--surface-edge)";
    card.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    const bounds = card.getBoundingClientRect();
    return [bounds.left, bounds.right - width].map((x) => ({ x, y: 200, width, height: 400 }));
  });
  const profile = async (y = 200, height = 400) => {
    const values: number[] = [];
    for (const clip of edges) {
      const png = await page.screenshot({ clip: { ...clip, y, height }, scale: "css" });
      values.push(...await page.evaluate(async (png) => {
        const image = new Image();
        image.src = `data:image/png;base64,${png}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        return Array.from({ length: canvas.width }, (_, x) => {
          let total = 0;
          for (let y = 0; y < canvas.height; y++) total += data[(y * canvas.width + x) * 4];
          return total / canvas.height;
        });
      }, png.toString("base64")));
    }
    return values;
  };
  const before = await profile();
  const expectFade = async () => {
    const current = await profile();
    const difference = current.reduce((total, value, index) => total + Math.abs(value - before[index]), 0) / current.length;
    expect(difference).toBeLessThan(8);
  };
  for (const navigate of [
    () => page.locator('a[href="/projects/"]').evaluate((link) => (link as HTMLAnchorElement).click()),
    () => page.goBack(),
  ]) {
    await navigate();
    await page.waitForFunction(() => document.getAnimations().some((animation) =>
      (animation as CSSAnimation).animationName === "page-in" && animation.playState === "paused",
    ));
    for (const time of [0, 60, 85, 200, 379]) {
      await page.evaluate((time) => {
        for (const animation of document.getAnimations() as CSSAnimation[]) {
          if (/page-(in|out)/.test(animation.animationName)) animation.currentTime = time;
        }
      }, time);
      await expectFade();
      // The same mask must fade foreground pixels, rather than only the glass.
      const foreground = await profile(668, 1);
      expect(foreground[Math.floor(foreground.length / 8)]).toBeLessThan(200);
      expect(foreground[Math.floor(foreground.length * 7 / 8)]).toBeLessThan(200);
      expect(foreground[Math.floor(foreground.length / 2) - 1]).toBeGreaterThan(240);
    }
    await page.evaluate(() => {
      document.activeViewTransition?.skipTransition();
      return document.activeViewTransition?.finished;
    });
    await expectFade();
  }
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
