import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("./lib/logger");
    logger.error(
      {
        err: error,
        requestId: request.headers["x-request-id"],
        method: request.method,
        route: context.routePath,
      },
      "Rendering failed",
    );
  }
};
