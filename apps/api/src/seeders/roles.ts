import { db } from "../db";

const permissions = [
  {
    slug: "rooms.browse",
    name: "Browse rooms",
    description: "Melihat daftar kamar dan ketersediaannya.",
  },
  {
    slug: "bookings.create",
    name: "Create booking",
    description: "Membuat booking baru.",
  },
  {
    slug: "bookings.view_own",
    name: "View own booking history",
    description: "Melihat riwayat booking milik sendiri.",
  },
  {
    slug: "bookings.cancel_own",
    name: "Cancel own booking",
    description: "Membatalkan booking sendiri sesuai kebijakan pembatalan.",
  },
  {
    slug: "bookings.view_all",
    name: "View all bookings",
    description: "Melihat seluruh booking tamu.",
  },
  {
    slug: "bookings.check_in",
    name: "Check in guest",
    description: "Melakukan proses check-in tamu.",
  },
  {
    slug: "bookings.check_out",
    name: "Check out guest",
    description: "Melakukan proses check-out tamu.",
  },
  {
    slug: "rooms.update_status",
    name: "Update room status",
    description:
      "Mengubah status kamar, termasuk dirty, clean, dan maintenance.",
  },
  {
    slug: "room_types.manage",
    name: "Manage room types",
    description: "Membuat, mengubah, dan menghapus tipe kamar.",
  },
  {
    slug: "pricing.manage",
    name: "Manage pricing",
    description: "Mengelola harga dasar dan aturan harga kamar.",
  },
  {
    slug: "reports.occupancy.view",
    name: "View occupancy reports",
    description: "Melihat laporan tingkat okupansi.",
  },
  {
    slug: "reports.revenue.view",
    name: "View revenue reports",
    description: "Melihat laporan pendapatan.",
  },
  {
    slug: "refunds.approve",
    name: "Approve refunds",
    description: "Menyetujui permintaan refund.",
  },
  {
    slug: "staff.manage",
    name: "Manage staff accounts",
    description: "Membuat, mengubah, menonaktifkan, dan menghapus akun staff.",
  },
  {
    slug: "permissions.manage",
    name: "Manage permissions",
    description: "Mengelola permission untuk setiap role.",
  },
  {
    slug: "users.manage",
    name: "Manage users",
    description: "Membuat, melihat, mengubah, dan menghapus akun pengguna.",
  },
] as const;

const roles = [
  {
    slug: "staff",
    name: "Front Desk / Staff",
    description: "Petugas operasional yang menangani booking dan status kamar.",
    permissions: [
      "rooms.browse",
      "bookings.create",
      "bookings.view_own",
      "bookings.cancel_own",
      "bookings.view_all",
      "bookings.check_in",
      "bookings.check_out",
      "rooms.update_status",
    ],
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Administrator dengan akses penuh ke seluruh fitur aplikasi.",
    permissions: permissions.map(({ slug }) => slug),
  },
] as const;

const upsertPermissionSql = `
  INSERT INTO permissions (slug, name, description)
  VALUES (?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    description = excluded.description
`;

const upsertRoleSql = `
  INSERT INTO roles (slug, name, description)
  VALUES (?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    description = excluded.description
`;

const deleteRolePermissionsSql = `
  DELETE FROM role_permissions
  WHERE role_id = (SELECT id FROM roles WHERE slug = ?)
`;

const insertRolePermissionSql = `
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT roles.id, permissions.id
  FROM roles, permissions
  WHERE roles.slug = ?
    AND permissions.slug = ?
`;

export async function seedRoles(): Promise<void> {
  const stmts: Array<{ sql: string; args: unknown[] }> = [];

  for (const permission of permissions) {
    stmts.push({
      sql: upsertPermissionSql,
      args: [permission.slug, permission.name, permission.description],
    });
  }

  for (const role of roles) {
    stmts.push({ sql: upsertRoleSql, args: [role.slug, role.name, role.description] });
    stmts.push({ sql: deleteRolePermissionsSql, args: [role.slug] });

    for (const permissionSlug of role.permissions) {
      stmts.push({ sql: insertRolePermissionSql, args: [role.slug, permissionSlug] });
    }
  }

  await db.batch(stmts as never, "write");
}

if (import.meta.main) {
  seedRoles().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}