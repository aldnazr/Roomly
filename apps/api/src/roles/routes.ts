import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/middleware";
import { parseSetPermissionsBody } from "./schema";
import { getRole, listRoles, setRolePermissions } from "./service";

export const rolesRouter = Router();

rolesRouter.use(requireAuth);

rolesRouter.get("/", (_req, res) => {
  res.status(200).json({ data: listRoles() });
});

rolesRouter.get("/:slug", (req, res) => {
  res.status(200).json({ data: getRole(req.params.slug ?? "") });
});

rolesRouter.put(
  "/:slug/permissions",
  requirePermission("permissions.manage"),
  (req, res) => {
    const { permissions } = parseSetPermissionsBody(req.body);
    const slug = typeof req.params.slug === "string" ? req.params.slug : "";
    res.status(200).json({ data: setRolePermissions(slug, permissions) });
  },
);
