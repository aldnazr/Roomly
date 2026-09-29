import "dotenv/config";
import { requireJwtSecret } from "./config";
import { createApp } from "./app";
import { migrate } from "./db";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error(
    `Invalid configuration: PORT "${process.env.PORT}" is not a valid port`,
  );
  process.exit(1);
}

try {
  requireJwtSecret();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

// Runs before the server starts listening; migrations are idempotent.
await migrate();

createApp().listen(port);
