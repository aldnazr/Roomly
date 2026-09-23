import type { RequestHandler } from "express";
import { jwtVerify } from "jose";
import { requireJwtSecret } from "../config";
import db from "../db";
import { HttpError } from "../errors";

export type AuthUser = { id: number; role: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const INVALID_TOKEN = "Invalid or expired access token";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? "");
    const token = match?.[1];
    if (!token) throw new HttpError(401, "Missing or malformed Authorization header");

    const secret = new TextEncoder().encode(requireJwtSecret());
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      issuer: "roomly-api",
      audience: "roomly",
    });

    const id = Number(payload.sub);
    if (!Number.isInteger(id) || typeof payload.role !== "string") {
      throw new HttpError(401, INVALID_TOKEN);
    }

    req.user = { id, role: payload.role };
    next();
  } catch (err) {
    next(err instanceof HttpError ? err : new HttpError(401, INVALID_TOKEN));
  }
};

export function requirePermission(slug: string): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, INVALID_TOKEN));
      return;
    }

    const granted = db
      .query<{ granted: number }, [string, string]>(
        `SELECT 1 AS granted
         FROM role_permissions rp
         JOIN roles r ON r.id = rp.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE r.slug = ? AND p.slug = ?`,
      )
      .get(req.user.role, slug);

    if (granted) next();
    else next(new HttpError(403, "Insufficient permissions"));
  };
}
