import { db, query, queryOne } from "../db";
import { HttpError } from "../errors";

type RoleDto = {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
};

function assertRoleSlug(slug: string): string {
  const cleaned = slug.trim();
  if (!cleaned) throw new HttpError(400, "Invalid role slug");
  return cleaned;
}

export async function listRoles(): Promise<RoleDto[]> {
  const mapped = await query<{ slug: string; permission_slug: string }>(
    `SELECT r.slug, p.slug AS permission_slug
     FROM role_permissions rp
     JOIN roles r ON r.id = rp.role_id
     JOIN permissions p ON p.id = rp.permission_id
     ORDER BY r.id, p.id`,
  );

  const grouped = new Map<string, string[]>();
  for (const row of mapped) {
    const list = grouped.get(row.slug);
    if (list) list.push(row.permission_slug);
    else grouped.set(row.slug, [row.permission_slug]);
  }

  const roles = await query<{ slug: string; name: string; description: string }>(
    "SELECT slug, name, description FROM roles ORDER BY id",
  );

  return roles.map((role) => ({ ...role, permissions: grouped.get(role.slug) ?? [] }));
}

export async function getRole(slug: string): Promise<RoleDto> {
  const cleaned = assertRoleSlug(slug);
  const role = await queryOne<{ slug: string; name: string; description: string }>(
    "SELECT slug, name, description FROM roles WHERE slug = ?",
    [cleaned],
  );
  if (!role) throw new HttpError(404, "Role not found");

  const permissions = (
    await query<{ permission_slug: string }>(
      `SELECT p.slug AS permission_slug
       FROM role_permissions rp
       JOIN roles r ON r.id = rp.role_id
       JOIN permissions p ON p.id = rp.permission_id
       WHERE r.slug = ?
       ORDER BY p.id`,
      [cleaned],
    )
  ).map((row) => row.permission_slug);

  return { ...role, permissions };
}

export async function setRolePermissions(slug: string, permissionSlugs: string[]): Promise<RoleDto> {
  const cleaned = assertRoleSlug(slug);
  const role = await queryOne<{ id: number }>("SELECT id FROM roles WHERE slug = ?", [cleaned]);
  if (!role) throw new HttpError(404, "Role not found");

  const known = new Set(
    (await query<{ slug: string }>("SELECT slug FROM permissions")).map((p) => p.slug),
  );
  const unknown = permissionSlugs.filter((permissionSlug) => !known.has(permissionSlug));
  if (unknown.length > 0) {
    throw new HttpError(400, `Unknown permission slugs: ${unknown.join(", ")}`);
  }

  // ponytail: replace-in-place only; role create/delete stays with the seeder until roles become dynamic.
  await db.batch(
    [
      {
        sql: "DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE slug = ?)",
        args: [cleaned],
      },
      ...permissionSlugs.map((permissionSlug) => ({
        sql: `INSERT INTO role_permissions (role_id, permission_id)
              SELECT roles.id, permissions.id
              FROM roles, permissions
              WHERE roles.slug = ? AND permissions.slug = ?`,
        args: [cleaned, permissionSlug],
      })),
    ],
    "write",
  );

  return getRole(cleaned);
}