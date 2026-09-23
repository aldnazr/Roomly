import { Router } from "express";
import { requireAuth } from "../auth/middleware";
import db from "../db";

type PermissionDto = {
  slug: string;
  name: string;
  description: string;
};

export const permissionsRouter = Router();

permissionsRouter.use(requireAuth);

permissionsRouter.get("/", (_req, res) => {
  const data = db
    .query<PermissionDto, []>("SELECT slug, name, description FROM permissions ORDER BY id")
    .all();
  res.status(200).json({ data });
});
