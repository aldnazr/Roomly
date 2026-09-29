import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/middleware";
import { parseSetPermissionsBody } from "./schema";
import { getRole, listRoles, setRolePermissions } from "./service";

export const rolesRouter = Router();

rolesRouter.use(requireAuth);

rolesRouter.get("/", async (_req, res) => {
  res.status(200).json({ data: await listRoles() });
});

rolesRouter.get("/:slug", async (req, res) => {
  res.status(200).json({ data: await getRole(req.params.slug ?? "") });
});

rolesRouter.put(
  "/:slug/permissions",
  requirePermission("permissions.manage"),
  async (req, res, next) => {
    try {
      const { permissions } = parseSetPermissionsBody(req.body);
      const slug = typeof req.params.slug === "string" ? req.params.slug : "";
      res.status(200).json({ data: await setRolePermissions(slug, permissions) });
    } catch (err) {
      next(err);
    }
  },
);
