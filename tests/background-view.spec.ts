import { test, expect } from "@playwright/test";

type ProbeWindow = Window & { fieldScrollImpulses: number[] };

test.use({
  launchOptions: {
    args: ["--ozone-platform=x11", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    // SwiftShader cannot create a Wayland Vulkan surface; keep this headless.
    env: { ...process.env, WAYLAND_DISPLAY: "", XDG_SESSION_TYPE: "x11" },
  },
});

test("scroll gestures move the background while the foreground is hidden", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.addInitScript(() => {
    const probe = window as unknown as ProbeWindow;
    probe.fieldScrollImpulses = [];
    if (typeof WebGL2RenderingContext === "undefined") return;
    const prototype = WebGL2RenderingContext.prototype;
    const getParameter = prototype.getParameter;
    const getUniformLocation = prototype.getUniformLocation;
    const uniform2f = prototype.uniform2f;
    const scrollUniforms = new WeakSet<WebGLUniformLocation>();

    // Exercise the real float WebGL solver in headless software rendering too.
    // This verifies input wiring rather than claiming hardware visual coverage.
    prototype.getParameter = function (parameter) {
      return parameter === this.RENDERER || parameter === 0x9246
        ? "test renderer"
        : Reflect.apply(getParameter, this, [parameter]);
    };
    prototype.getUniformLocation = function (program, name) {
      const location = Reflect.apply(getUniformLocation, this, [program, name]);
      if (location && name === "uScroll") scrollUniforms.add(location);
      return location;
    };
    prototype.uniform2f = function (location, x, y) {
      if (location && scrollUniforms.has(location) && Math.abs(y) > 0.001) {
        probe.fieldScrollImpulses.push(y);
      }
      return Reflect.apply(uniform2f, this, [location, x, y]);
    };
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const canvas = page.locator("canvas[data-character-grid]");
  const supported = await canvas.evaluate((element) => {
    const gl = (element as HTMLCanvasElement).getContext("webgl2");
    return !!gl?.getExtension("EXT_color_buffer_float");
  });
  test.skip(!supported, "The headless renderer does not support float WebGL targets.");

  const impulses = () => page.evaluate(() => (window as unknown as ProbeWindow).fieldScrollImpulses);
  const clear = () => page.evaluate(() => { (window as unknown as ProbeWindow).fieldScrollImpulses = []; });
  const settle = () => page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
  const swipe = () => page.evaluate(() => {
    const root = document.documentElement;
    for (const [type, y] of [["touchstart", 300], ["touchmove", 180], ["touchend", null]] as const) {
      const event = new Event(type, { bubbles: true });
      Object.defineProperty(event, "touches", { value: y === null ? [] : [{ clientY: y }] });
      root.dispatchEvent(event);
    }
  });

  await page.evaluate(() => scrollTo({ top: 300, behavior: "instant" }));
  await expect.poll(async () => (await impulses()).some((value) => value > 0)).toBe(true);
  await page.getByRole("button", { name: "Hide content", exact: true }).click();
  const position = await page.evaluate(() => scrollY);
  expect(position).toBe(300);

  for (const delta of [120, -120]) {
    await clear();
    await page.mouse.wheel(0, delta);
    await expect.poll(async () => (await impulses()).some((value) => Math.sign(value) === Math.sign(delta))).toBe(true);
    expect(await page.evaluate(() => scrollY)).toBe(position);
  }
  await clear();
  await swipe();
  await expect.poll(async () => (await impulses()).some((value) => value > 0)).toBe(true);
  await clear();
  await page.keyboard.press("ArrowDown");
  await expect.poll(async () => (await impulses()).some((value) => value > 0)).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await settle();
  await clear();
  await page.mouse.wheel(0, 120);
  await swipe();
  await page.keyboard.press("ArrowDown");
  await settle();
  expect(await impulses()).toEqual([]);
  expect(await page.evaluate(() => scrollY)).toBe(position);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Show content", exact: true }).click();
  await expect(page.locator(".site-card")).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(position);
  await clear();
  // A wheel event at mid-page is handled by document scrolling once shown.
  await page.evaluate(() => dispatchEvent(new WheelEvent("wheel", { deltaY: 120 })));
  await settle();
  expect(await impulses()).toEqual([]);
  await page.evaluate(() => scrollTo({ top: 420, behavior: "instant" }));
  await expect.poll(async () => (await impulses()).some((value) => value > 0)).toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(420);
});
