import { Router } from "express";
import { requireAuth, requirePermission } from "../auth/middleware";
import { HttpError } from "../errors";
import { parseCreateUserBody, parseUpdateUserBody } from "./schema";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "./service";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.use(requirePermission("users.manage"));

function parseUserId(param: string | undefined): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "Invalid user ID");
  }
  return id;
}

usersRouter.get("/", async (_req, res) => {
  res.status(200).json({ data: await listUsers() });
});

usersRouter.get("/:id", async (req, res) => {
  const id = parseUserId(req.params.id);
  res.status(200).json({ data: await getUser(id) });
});

usersRouter.post("/", async (req, res, next) => {
  try {
    const input = parseCreateUserBody(req.body);
    const user = await createUser(input);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/:id", async (req, res, next) => {
  try {
    const id = parseUserId(req.params.id);
    const input = parseUpdateUserBody(req.body);
    const user = await updateUser(id, input);
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});

usersRouter.delete("/:id", async (req, res) => {
  const id = parseUserId(req.params.id);
  res.status(200).json({ data: await deleteUser(id) });
});
