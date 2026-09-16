import { Router } from "express";
import { login } from "./service";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  res.status(200).json(await login(req.body));
});
