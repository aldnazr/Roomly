import "dotenv/config";
import { migrate } from "../db";

migrate()
  .then(() => {
    console.log("Migrations applied");
  })
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });