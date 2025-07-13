import { PassThrough } from "stream";
import type { EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import compression from "compression";
import { renderToPipeableStream } from "react-dom/server";
import { createExpressApp } from "remix-create-express-app";

const ABORT_DELAY = 15_000;

// the default for this is 5 sec, but we will increase it to 30 sec
export const streamTimeout = 30_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: unknown
) {
  return handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
      />,
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell. Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export const app = createExpressApp({
  configure: (app) => {
    app.use(compression());
    app.set("trust proxy", true); // can rely on x-forwarded-for
    app.disable("x-powered-by");

    // Add request logging middleware
    app.use((req, res, next) => {
      console.log(`==> ${req.method} ${req.url}`);
      next();
    });
  },
  unstable_middleware: true,
});
