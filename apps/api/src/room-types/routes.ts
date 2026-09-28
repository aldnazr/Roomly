import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/middleware";
import { HttpError } from "../errors";
import {
  parseCreateRoomTypeBody,
  parseQueryRoomType,
  parseUpdateRoomTypeBody,
} from "./schema";
import {
  createRoomType,
  deleteRoomType,
  getRoomType,
  listRoomTypes,
  updateRoomType,
} from "./service";

export const roomTypesRouter = Router();

roomTypesRouter.use(requireAuth);

function parseRoomTypeId(param: string | string[] | undefined): number {
  const value = Array.isArray(param) ? param[0] : param;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "Invalid room type ID");
  }
  return id;
}

roomTypesRouter.get("/", requirePermission("rooms.browse"), (req, res, next) => {
  try {
    const query = parseQueryRoomType(req.query);
    res.status(200).json({ data: listRoomTypes(query) });
  } catch (err) {
    next(err);
  }
});

roomTypesRouter.get("/:id", requirePermission("rooms.browse"), (req, res) => {
  const id = parseRoomTypeId(req.params.id);
  res.status(200).json({ data: getRoomType(id) });
});

roomTypesRouter.post("/", requirePermission("room_types.manage"), (req, res, next) => {
  try {
    const input = parseCreateRoomTypeBody(req.body);
    const roomType = createRoomType(input);
    res.status(201).json({ data: roomType });
  } catch (err) {
    next(err);
  }
});

roomTypesRouter.patch("/:id", requirePermission("room_types.manage"), (req, res, next) => {
  try {
    const id = parseRoomTypeId(req.params.id);
    const input = parseUpdateRoomTypeBody(req.body);
    const roomType = updateRoomType(id, input);
    res.status(200).json({ data: roomType });
  } catch (err) {
    next(err);
  }
});

roomTypesRouter.delete("/:id", requirePermission("room_types.manage"), (req, res) => {
  const id = parseRoomTypeId(req.params.id);
  res.status(200).json({ data: deleteRoomType(id) });
});
