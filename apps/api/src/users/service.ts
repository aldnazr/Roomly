import db from "../db";
import { HttpError } from "../errors";
import type { CreateUserInput, UpdateUserInput } from "./schema";

export type UserDto = {
  id: number;
  username: string | null;
  name: string;
  email: string;
  role: string;
};

function assertRoleExists(roleSlug: string): void {
  const role = db
    .query<{ id: number }, [string]>("SELECT id FROM roles WHERE slug = ?")
    .get(roleSlug);
  if (!role) throw new HttpError(400, `Role '${roleSlug}' does not exist`);
}

function checkConflict(email?: string, username?: string, excludeUserId?: number): void {
  if (email) {
    const existingEmail = db
      .query<{ id: number }, [string]>(
        "SELECT id FROM users WHERE email = ? COLLATE NOCASE",
      )
      .get(email);
    if (existingEmail && existingEmail.id !== excludeUserId) {
      throw new HttpError(409, "Email is already in use");
    }
  }

  if (username) {
    const existingUsername = db
      .query<{ id: number }, [string]>(
        "SELECT id FROM users WHERE username = ? COLLATE NOCASE",
      )
      .get(username);
    if (existingUsername && existingUsername.id !== excludeUserId) {
      throw new HttpError(409, "Username is already in use");
    }
  }
}

export function listUsers(): UserDto[] {
  return db
    .query<UserDto, []>(
      "SELECT id, username, name, email, role FROM users ORDER BY id ASC",
    )
    .all();
}

export function getUser(id: number): UserDto {
  const user = db
    .query<UserDto, [number]>(
      "SELECT id, username, name, email, role FROM users WHERE id = ?",
    )
    .get(id);

  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  assertRoleExists(input.role);
  checkConflict(input.email, input.username);

  const passwordHash = await Bun.password.hash(input.password);

  // ponytail: name mirrors username; separate display name can be added later if needed.
  const result = db
    .prepare(
      `INSERT INTO users (username, name, email, role, password_hash)
       VALUES (?, ?, ?, ?, ?)
       RETURNING id, username, name, email, role`,
    )
    .get(input.username, input.username, input.email, input.role, passwordHash) as UserDto;

  return result;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<UserDto> {
  const current = getUser(id);

  if (input.role) assertRoleExists(input.role);
  checkConflict(input.email, input.username, id);

  const updates: string[] = [];
  const params: (string | number)[] = [];

  if (input.username !== undefined) {
    updates.push("username = ?", "name = ?");
    params.push(input.username, input.username);
  }

  if (input.email !== undefined) {
    updates.push("email = ?");
    params.push(input.email);
  }

  if (input.role !== undefined) {
    updates.push("role = ?");
    params.push(input.role);
  }

  if (input.password !== undefined) {
    const hash = await Bun.password.hash(input.password);
    updates.push("password_hash = ?");
    params.push(hash);
  }

  params.push(id);

  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);

  return getUser(id);
}

export function deleteUser(id: number): { message: string } {
  const user = getUser(id);
  // ponytail: self-delete or last-admin delete protection can be added when multi-admin policy is defined.
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  return { message: "User deleted successfully" };
}
