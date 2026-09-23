import db from "../db";
import { HttpError } from "../errors";

type RoleDto = {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
};

const deleteRolePermissions = db.prepare(
  "DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE slug = ?)",
);

const insertRolePermission = db.prepare(`
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT roles.id, permissions.id
  FROM roles, permissions
  WHERE roles.slug = ?
    AND permissions.slug = ?
`);

function assertRoleSlug(slug: string): string {
  const cleaned = slug.trim();
  if (!cleaned) throw new HttpError(400, "Invalid role slug");
  return cleaned;
}

export function listRoles(): RoleDto[] {
  const mapped = db
    .query<{ slug: string; permission_slug: string }, []>(
      `SELECT r.slug, p.slug AS permission_slug
       FROM role_permissions rp
       JOIN roles r ON r.id = rp.role_id
       JOIN permissions p ON p.id = rp.permission_id
       ORDER BY r.id, p.id`,
    )
    .all();

  const grouped = new Map<string, string[]>();
  for (const row of mapped) {
    const list = grouped.get(row.slug);
    if (list) list.push(row.permission_slug);
    else grouped.set(row.slug, [row.permission_slug]);
  }

  const roles = db
    .query<{ slug: string; name: string; description: string }, []>(
      "SELECT slug, name, description FROM roles ORDER BY id",
    )
    .all();

  return roles.map((role) => ({ ...role, permissions: grouped.get(role.slug) ?? [] }));
}

export function getRole(slug: string): RoleDto {
  const cleaned = assertRoleSlug(slug);
  const role = db
    .query<{ slug: string; name: string; description: string }, [string]>(
      "SELECT slug, name, description FROM roles WHERE slug = ?",
    )
    .get(cleaned);
  if (!role) throw new HttpError(404, "Role not found");

  const permissions = db
    .query<{ permission_slug: string }, [string]>(
      `SELECT p.slug AS permission_slug
       FROM role_permissions rp
       JOIN roles r ON r.id = rp.role_id
       JOIN permissions p ON p.id = rp.permission_id
       WHERE r.slug = ?
       ORDER BY p.id`,
    )
    .all(cleaned)
    .map((row) => row.permission_slug);

  return { ...role, permissions };
}

export function setRolePermissions(slug: string, permissionSlugs: string[]): RoleDto {
  const cleaned = assertRoleSlug(slug);
  const role = db
    .query<{ id: number }, [string]>("SELECT id FROM roles WHERE slug = ?")
    .get(cleaned);
  if (!role) throw new HttpError(404, "Role not found");

  const known = new Set(
    db.query<{ slug: string }, []>("SELECT slug FROM permissions").all().map((p) => p.slug),
  );
  const unknown = permissionSlugs.filter((permissionSlug) => !known.has(permissionSlug));
  if (unknown.length > 0) {
    throw new HttpError(400, `Unknown permission slugs: ${unknown.join(", ")}`);
  }

  // ponytail: replace-in-place only; role create/delete stays with the seeder until roles become dynamic.
  db.transaction(() => {
    deleteRolePermissions.run(cleaned);
    for (const permissionSlug of permissionSlugs) {
      insertRolePermission.run(cleaned, permissionSlug);
    }
  })();

  return getRole(cleaned);
}
