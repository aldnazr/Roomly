import { test } from "node:test";
import assert from "node:assert/strict";
import { loginSchema } from "./auth/scheme";
import { userCreateSchema, userUpdateSchema } from "./users/schema";

const login = (identifier: string, password = "x") =>
  loginSchema.safeParse({ identifier, password }).success;

test("login identifier accepts username and email, trims, rejects invalid", () => {
  assert.equal(login("  nabila.putri  "), true);
  assert.equal(login("nabila@contoh.com"), true);
  assert.equal(login("ab"), false);
  assert.equal(login("bad email@"), false);
  assert.equal(login(""), false);
  assert.equal(login("nabila", ""), false);
});

const create = {
  username: "nabila",
  email: "nabila@contoh.com",
  role: "admin",
  password: "password123",
};

test("create rejects invalid email, empty role, empty or short password", () => {
  assert.equal(userCreateSchema.safeParse(create).success, true);
  assert.equal(userCreateSchema.safeParse({ ...create, email: "x" }).success, false);
  assert.equal(userCreateSchema.safeParse({ ...create, role: "" }).success, false);
  assert.equal(userCreateSchema.safeParse({ ...create, password: "" }).success, false);
  assert.equal(userCreateSchema.safeParse({ ...create, password: "short" }).success, false);
});

test("update maps empty password to undefined, rejects short password", () => {
  const { password: _, ...rest } = create;
  const empty = userUpdateSchema.safeParse({ ...rest, password: "" });
  assert.equal(empty.success, true);
  if (empty.success) assert.equal(empty.data.password, undefined);
  assert.equal(userUpdateSchema.safeParse({ ...rest, password: "short" }).success, false);
  const kept = userUpdateSchema.safeParse({ ...rest, password: "password123" });
  assert.equal(kept.success && kept.data.password, "password123");
});

