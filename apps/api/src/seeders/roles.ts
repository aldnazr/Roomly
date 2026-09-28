import db from "../db";

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
    slug: "guest",
    name: "Guest",
    description:
      "Tamu yang dapat mencari kamar dan mengelola booking miliknya sendiri.",
    permissions: [
      "rooms.browse",
      "bookings.create",
      "bookings.view_own",
      "bookings.cancel_own",
    ],
  },
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
    slug: "manager",
    name: "Manager",
    description:
      "Pengelola tipe kamar, harga, laporan, dan persetujuan refund.",
    permissions: [
      "rooms.browse",
      "bookings.create",
      "bookings.view_own",
      "bookings.cancel_own",
      "bookings.view_all",
      "bookings.check_in",
      "bookings.check_out",
      "rooms.update_status",
      "room_types.manage",
      "pricing.manage",
      "reports.occupancy.view",
      "reports.revenue.view",
      "refunds.approve",
    ],
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Administrator dengan akses penuh ke seluruh fitur aplikasi.",
    permissions: permissions.map(({ slug }) => slug),
  },
] as const;

const upsertPermission = db.prepare(`
  INSERT INTO permissions (slug, name, description)
  VALUES (?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    description = excluded.description
`);

const upsertRole = db.prepare(`
  INSERT INTO roles (slug, name, description)
  VALUES (?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    name = excluded.name,
    description = excluded.description
`);

const deleteRolePermissions = db.prepare(`
  DELETE FROM role_permissions
  WHERE role_id = (SELECT id FROM roles WHERE slug = ?)
`);

const insertRolePermission = db.prepare(`
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT roles.id, permissions.id
  FROM roles, permissions
  WHERE roles.slug = ?
    AND permissions.slug = ?
`);

export function seedRoles(): void {
  db.transaction(() => {
    for (const permission of permissions) {
      upsertPermission.run(
        permission.slug,
        permission.name,
        permission.description,
      );
    }

    for (const role of roles) {
      upsertRole.run(role.slug, role.name, role.description);
      deleteRolePermissions.run(role.slug);

      for (const permissionSlug of role.permissions) {
        insertRolePermission.run(role.slug, permissionSlug);
      }
    }
  })();
}

if (import.meta.main) {
  seedRoles();
}
