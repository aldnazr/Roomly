import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/middleware";
import { parseAvailabilityQuery } from "./schema";
import { searchAvailability } from "./service";

export const availabilityRouter = Router();

availabilityRouter.use(requireAuth);
availabilityRouter.use(requirePermission("rooms.browse"));

availabilityRouter.get("/", (req, res, next) => {
  try {
    const query = parseAvailabilityQuery(req.query);
    const result = searchAvailability(query);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
});
