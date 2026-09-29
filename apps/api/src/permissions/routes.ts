import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import { query } from "../db";

type PermissionDto = {
  slug: string;
  name: string;
  description: string;
};

export const permissionsRouter = Router();

permissionsRouter.use(requireAuth);

permissionsRouter.get("/", async (_req, res) => {
  const data = await query<PermissionDto>(
    "SELECT slug, name, description FROM permissions ORDER BY id",
  );
  res.status(200).json({ data });
});
