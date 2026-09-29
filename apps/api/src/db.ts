import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import { dirname, resolve } from "path";

export const databasePath = resolve(
  process.env.DATABASE_PATH || "data/database.db",
);
mkdirSync(dirname(databasePath), { recursive: true });

const db = new Database(databasePath, { create: true });
db.run("PRAGMA journal_mode = WAL;");
db.run("PRAGMA foreign_keys = ON;");

type Migration = { id: number; name: string; up: (db: Database) => void };

const migrations: Migration[] = [
  {
    id: 1,
    name: "initial_schema",
    up: (db) => {
      db.run(`
    CREATE TABLE IF NOT EXISTS room_types (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE CHECK(length(trim(name)) > 0),
      base_price INTEGER NOT NULL CHECK(base_price >= 0),
      capacity INTEGER NOT NULL CHECK(capacity > 0),
      description TEXT CHECK(description IS NULL OR length(trim(description)) > 0)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS guests (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL CHECK(length(trim(name)) > 0),
      email TEXT CHECK(email IS NULL OR length(trim(email)) > 0),
      phone TEXT CHECK(phone IS NULL OR length(trim(phone)) > 0)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE CHECK(length(trim(slug)) > 0),
      name TEXT NOT NULL CHECK(length(trim(name)) > 0),
      description TEXT NOT NULL CHECK(length(trim(description)) > 0)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE CHECK(length(trim(slug)) > 0),
      name TEXT NOT NULL CHECK(length(trim(name)) > 0),
      description TEXT NOT NULL CHECK(length(trim(description)) > 0)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE ON UPDATE RESTRICT,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE RESTRICT,
      PRIMARY KEY(role_id, permission_id)
    ) STRICT, WITHOUT ROWID;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL CHECK(length(trim(name)) > 0),
      email TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK(length(trim(email)) > 0),
      role TEXT NOT NULL DEFAULT 'guest' REFERENCES roles(slug) ON DELETE RESTRICT ON UPDATE CASCADE
    ) STRICT;

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY,
      room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      room_number TEXT NOT NULL UNIQUE CHECK(length(trim(room_number)) > 0),
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'maintenance')),
      UNIQUE(id, room_type_id)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY,
      guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      room_id INTEGER,
      check_in TEXT NOT NULL CHECK(
        length(check_in) = 10 AND
        check_in GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND
        date(check_in, '+0 days') IS NOT NULL AND
        date(check_in, '+0 days') = check_in
      ),
      check_out TEXT NOT NULL CHECK(
        length(check_out) = 10 AND
        check_out GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND
        date(check_out, '+0 days') IS NOT NULL AND
        date(check_out, '+0 days') = check_out
      ),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
      total_price INTEGER NOT NULL CHECK(total_price >= 0),
      CHECK(check_out > check_in),
      CHECK(status NOT IN ('checked_in', 'checked_out') OR room_id IS NOT NULL),
      FOREIGN KEY(room_id, room_type_id) REFERENCES rooms(id, room_type_id) ON DELETE RESTRICT ON UPDATE RESTRICT
    ) STRICT;

    CREATE TABLE IF NOT EXISTS pricing_rules (
      id INTEGER PRIMARY KEY,
      room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
      start_date TEXT NOT NULL CHECK(
        length(start_date) = 10 AND
        start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND
        date(start_date, '+0 days') IS NOT NULL AND
        date(start_date, '+0 days') = start_date
      ),
      end_date TEXT NOT NULL CHECK(
        length(end_date) = 10 AND
        end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]' AND
        date(end_date, '+0 days') IS NOT NULL AND
        date(end_date, '+0 days') = end_date
      ),
      price_override INTEGER CHECK(price_override IS NULL OR price_override >= 0),
      multiplier REAL CHECK(multiplier IS NULL OR multiplier > 0),
      CHECK(end_date >= start_date),
      CHECK(
        (price_override IS NOT NULL AND multiplier IS NULL) OR
        (price_override IS NULL AND multiplier IS NOT NULL)
      )
    ) STRICT;

    CREATE INDEX IF NOT EXISTS idx_rooms_room_type_id ON rooms(room_type_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_room_type_id ON reservations(room_type_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_room_dates ON reservations(room_id, check_in, check_out);
    CREATE INDEX IF NOT EXISTS idx_pricing_rules_room_type_dates ON pricing_rules(room_type_id, start_date, end_date);

    CREATE TRIGGER IF NOT EXISTS trg_reservations_insert_no_overlap
    BEFORE INSERT ON reservations
    WHEN NEW.room_id IS NOT NULL AND NEW.status IN ('pending', 'confirmed', 'checked_in')
    BEGIN
      SELECT RAISE(ABORT, 'Reservation overlaps an active booking for this room')
      WHERE EXISTS (
        SELECT 1 FROM reservations
        WHERE room_id = NEW.room_id
          AND status IN ('pending', 'confirmed', 'checked_in')
          AND NEW.check_in < check_out
          AND NEW.check_out > check_in
      );
    END;

    CREATE TRIGGER IF NOT EXISTS trg_reservations_update_no_overlap
    BEFORE UPDATE ON reservations
    WHEN NEW.room_id IS NOT NULL AND NEW.status IN ('pending', 'confirmed', 'checked_in')
    BEGIN
      SELECT RAISE(ABORT, 'Reservation overlaps an active booking for this room')
      WHERE EXISTS (
        SELECT 1 FROM reservations
        WHERE room_id = NEW.room_id
          AND id <> OLD.id
          AND status IN ('pending', 'confirmed', 'checked_in')
          AND NEW.check_in < check_out
          AND NEW.check_out > check_in
      );
    END;

    CREATE TRIGGER IF NOT EXISTS trg_pricing_rules_insert_no_overlap
    BEFORE INSERT ON pricing_rules
    BEGIN
      SELECT RAISE(ABORT, 'Pricing rule overlaps another rule for this room type')
      WHERE EXISTS (
        SELECT 1 FROM pricing_rules
        WHERE room_type_id = NEW.room_type_id
          AND NEW.start_date <= end_date
          AND NEW.end_date >= start_date
      );
    END;

    CREATE TRIGGER IF NOT EXISTS trg_pricing_rules_update_no_overlap
    BEFORE UPDATE ON pricing_rules
    BEGIN
      SELECT RAISE(ABORT, 'Pricing rule overlaps another rule for this room type')
      WHERE EXISTS (
        SELECT 1 FROM pricing_rules
        WHERE room_type_id = NEW.room_type_id
          AND id <> OLD.id
          AND NEW.start_date <= end_date
          AND NEW.end_date >= start_date
      );
    END;
  `);
    },
  },
  {
    id: 2,
    name: "users_add_password_hash",
    up: (db) => {
      const columns = db
        .query<{ name: string }, []>("PRAGMA table_info(users)")
        .all();
      if (!columns.some((column) => column.name === "password_hash")) {
        db.run("ALTER TABLE users ADD COLUMN password_hash TEXT");
      }
    },
  },
  {
    id: 3,
    name: "users_add_username",
    up: (db) => {
      const columns = db
        .query<{ name: string }, []>("PRAGMA table_info(users)")
        .all();
      if (!columns.some((column) => column.name === "username")) {
        db.run("ALTER TABLE users ADD COLUMN username TEXT");
        // ponytail: unique index allows multiple legacy NULLs; API enforces required on write.
        db.run(
          "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL",
        );
      }
    },
  },
  {
    id: 4,
    name: "room_types_add_amenities_photos",
    up: (db) => {
      const columns = db
        .query<{ name: string }, []>("PRAGMA table_info(room_types)")
        .all();
      if (!columns.some((column) => column.name === "amenities")) {
        db.run(
          "ALTER TABLE room_types ADD COLUMN amenities TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(amenities) AND json_type(amenities) = 'array')",
        );
      }
      if (!columns.some((column) => column.name === "photos")) {
        db.run(
          "ALTER TABLE room_types ADD COLUMN photos TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(photos) AND json_type(photos) = 'array')",
        );
      }
    },
  },
];

export function migrate(database: Database = db): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE CHECK(length(trim(name)) > 0),
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    ) STRICT;
  `);

  // ponytail: keyed by name, not id — ids get reused when migrations are
  // renumbered; upsert on id so a stale row from an old numbering is replaced.
  const applied = new Set(
    database
      .query<{ name: string }, []>("SELECT name FROM schema_migrations")
      .all()
      .map((row) => row.name),
  );

  for (const migration of migrations) {
    if (applied.has(migration.name)) continue;
    database.transaction(() => {
      migration.up(database);
      database
        .prepare(
          `INSERT INTO schema_migrations (id, name) VALUES (?, ?)
           ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
        )
        .run(migration.id, migration.name);
    })();
  }
}

migrate();

export default db;
