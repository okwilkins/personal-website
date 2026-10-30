import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import next from "next";
import prometheus from "@prometheus-io/client";
import { logger } from "./lib/logger.ts";

const { Registry, Counter, Histogram, collectDefaultMetrics } = prometheus;
const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: "personal_website_" });

const requests = new Counter({
  name: "personal_website_http_requests_total",
  help: "Completed HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [registry],
});
const duration = new Histogram({
  name: "personal_website_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [registry],
});

// Keep labels bounded: arbitrary URLs must not create new metric series.
function routeLabel(path: string) {
  if (path === "/") return "/";
  if (path === "/experience" || path === "/experience/") return "/experience/";
  if (path === "/projects" || path === "/projects/") return "/projects/";
  if (path === "/services" || path === "/services/") return "/services/";
  if (path === "/metrics" || path === "/healthz") return path;
  if (
    path.startsWith("/_next/") ||
    /^\/(icon\.svg|og\.png|robots\.txt|sitemap\.xml)$/.test(path)
  )
    return "asset";
  return "unmatched";
}

async function start() {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "0.0.0.0";
  const app = next({
    dev: process.env.NODE_ENV !== "production",
    hostname: host,
    port,
  });
  await app.prepare();
  const handle = app.getRequestHandler();

  const server = createServer(async (request, response) => {
    const started = performance.now();
    const requestId = randomUUID();
    const method = /^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS)$/.test(
      request.method ?? "",
    )
      ? request.method!
      : "OTHER";
    const path = (request.url ?? "/").split("?")[0];
    const route = routeLabel(path);
    request.headers["x-request-id"] = requestId;
    response.setHeader("X-Request-Id", requestId);
    response.once("finish", () => {
      const seconds = (performance.now() - started) / 1000;
      const labels = {
        method,
        route,
        status_code: String(response.statusCode),
      };
      requests.inc(labels);
      duration.observe(labels, seconds);
      if (
        (route !== "asset" && route !== "/metrics" && route !== "/healthz") ||
        response.statusCode >= 400
      ) {
        const level =
          response.statusCode >= 500
            ? "error"
            : response.statusCode >= 400
              ? "warn"
              : "info";
        logger[level](
          {
            requestId,
            method,
            path,
            route,
            statusCode: response.statusCode,
            durationMs: Math.round(seconds * 1000),
          },
          "HTTP request",
        );
      }
    });

    try {
      if (route === "/healthz" || route === "/metrics") {
        response.setHeader("Cache-Control", "no-store");
        if (method !== "GET" && method !== "HEAD") {
          response.writeHead(405, { Allow: "GET, HEAD" }).end();
          return;
        }
        const body = route === "/metrics" ? await registry.metrics() : "ok\n";
        response.setHeader(
          "Content-Type",
          route === "/metrics"
            ? registry.contentType
            : "text/plain; charset=utf-8",
        );
        response.end(method === "HEAD" ? undefined : body);
        return;
      }
      await handle(request, response);
    } catch (err) {
      logger.error({ err, requestId, method, path, route }, "Request failed");
      if (!response.headersSent) response.writeHead(500);
      response.end("Internal server error");
    }
  });

  server.on("error", (err) => {
    logger.fatal({ err }, "Server failed");
    process.exit(1);
  });
  server.listen(port, host, () =>
    logger.info({ port, host }, "Server listening"),
  );

  let stopping = false;
  function stop() {
    if (stopping) return;
    stopping = true;
    logger.info("Shutting down");
    server.close(() => {
      process.exit(0);
    });
    void app.close();
    setTimeout(() => process.exit(1), 10_000).unref();
  }
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

start().catch((err) => {
  logger.fatal({ err }, "Startup failed");
  process.exit(1);
});
