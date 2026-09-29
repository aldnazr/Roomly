import bcrypt from "bcryptjs";
import { db, query, queryOne } from "../db";
import { HttpError } from "../errors";
import type { CreateUserInput, UpdateUserInput } from "./schema";

export type UserDto = {
  id: number;
  username: string | null;
  name: string;
  email: string;
  role: string;
};

async function assertRoleExists(roleSlug: string): Promise<void> {
  const role = await queryOne<{ id: number }>("SELECT id FROM roles WHERE slug = ?", [roleSlug]);
  if (!role) throw new HttpError(400, `Role '${roleSlug}' does not exist`);
}

async function checkConflict(
  email?: string,
  username?: string,
  excludeUserId?: number,
): Promise<void> {
  if (email) {
    const existingEmail = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE email = ? COLLATE NOCASE",
      [email],
    );
    if (existingEmail && existingEmail.id !== excludeUserId) {
      throw new HttpError(409, "Email is already in use");
    }
  }

  if (username) {
    const existingUsername = await queryOne<{ id: number }>(
      "SELECT id FROM users WHERE username = ? COLLATE NOCASE",
      [username],
    );
    if (existingUsername && existingUsername.id !== excludeUserId) {
      throw new HttpError(409, "Username is already in use");
    }
  }
}

export async function listUsers(): Promise<UserDto[]> {
  return query<UserDto>("SELECT id, username, name, email, role FROM users ORDER BY id ASC");
}

export async function getUser(id: number): Promise<UserDto> {
  const user = await queryOne<UserDto>(
    "SELECT id, username, name, email, role FROM users WHERE id = ?",
    [id],
  );

  if (!user) throw new HttpError(404, "User not found");
  return user;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  await assertRoleExists(input.role);
  await checkConflict(input.email, input.username);

  const passwordHash = await bcrypt.hash(input.password, 12);

  // ponytail: name mirrors username; separate display name can be added later if needed.
  const result = await queryOne<UserDto>(
    `INSERT INTO users (username, name, email, role, password_hash)
     VALUES (?, ?, ?, ?, ?)
     RETURNING id, username, name, email, role`,
    [input.username, input.username, input.email, input.role, passwordHash],
  );

  return result!;
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<UserDto> {
  await getUser(id);

  if (input.role) await assertRoleExists(input.role);
  await checkConflict(input.email, input.username, id);

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
    const hash = await bcrypt.hash(input.password, 12);
    updates.push("password_hash = ?");
    params.push(hash);
  }

  params.push(id);

  await db.execute({ sql: `UPDATE users SET ${updates.join(", ")} WHERE id = ?`, args: params });

  return getUser(id);
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const user = await getUser(id);
  // ponytail: self-delete or last-admin delete protection can be added when multi-admin policy is defined.
  await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [user.id] });
  return { message: "User deleted successfully" };
}