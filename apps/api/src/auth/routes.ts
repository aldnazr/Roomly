import { Router } from "express";
import { requireAuth } from "./middleware";
import { getMe, login } from "./service";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  res.status(200).json(await login(req.body));
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.status(200).json({ data: await getMe(req.user!.id) });
});

