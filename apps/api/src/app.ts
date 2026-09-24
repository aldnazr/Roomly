import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { ZodError } from "zod";
import { HttpError } from "./errors";
import { authRouter } from "./auth/routes";
import { rolesRouter } from "./roles/routes";
import { permissionsRouter } from "./permissions/routes";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message } });
  } else if (err instanceof ZodError) {
    res.status(400).json({ error: { message: "Invalid request body" } });
  } else if (err instanceof SyntaxError || err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { message: "Malformed JSON body" } });
  } else if (err?.type === "entity.too.large") {
    res.status(413).json({ error: { message: "Request body too large" } });
  } else {
    console.error(err);
    res.status(500).json({ error: { message: "Internal server error" } });
  }
};

export function createApp() {
  const app = express();

  app.use(
    cors({
      // Wildcard `*` is illegal with credentialed requests; echo an explicit origin.
      // ponytail: single origin only, add allow-list when a second frontend exists.
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use("/api/auth", authRouter);
  app.use("/api/roles", rolesRouter);
  app.use("/api/permissions", permissionsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: { message: "Not found" } });
  });
  app.use(errorHandler);

  return app;
}
