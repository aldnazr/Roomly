import { db, query as queryAll, queryOne } from "../db";
import { HttpError } from "../errors";
import type {
  CreateRoomTypeInput,
  QueryRoomTypeInput,
  UpdateRoomTypeInput,
} from "./schema";

export type RoomTypeDto = {
  id: number;
  name: string;
  base_price: number;
  capacity: number;
  description: string | null;
  amenities: string[];
  photos: string[];
  total_rooms: number;
};

type DbRoomTypeRow = {
  id: number;
  name: string;
  base_price: number;
  capacity: number;
  description: string | null;
  amenities: string;
  photos: string;
  total_rooms: number;
};

function mapRow(row: DbRoomTypeRow): RoomTypeDto {
  return {
    id: row.id,
    name: row.name,
    base_price: row.base_price,
    capacity: row.capacity,
    description: row.description,
    amenities: JSON.parse(row.amenities || "[]"),
    photos: JSON.parse(row.photos || "[]"),
    total_rooms: row.total_rooms ?? 0,
  };
}

async function checkNameConflict(name: string, excludeId?: number): Promise<void> {
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM room_types WHERE name = ? COLLATE NOCASE",
    [name],
  );
  if (existing && existing.id !== excludeId) {
    throw new HttpError(409, `Room type with name '${name}' already exists`);
  }
}

export async function listRoomTypes(query?: QueryRoomTypeInput): Promise<RoomTypeDto[]> {
  const conditions: string[] = [];
  const params: number[] = [];

  if (query?.capacity_min !== undefined) {
    conditions.push("rt.capacity >= ?");
    params.push(query.capacity_min);
  }
  if (query?.capacity_max !== undefined) {
    conditions.push("rt.capacity <= ?");
    params.push(query.capacity_max);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await queryAll<DbRoomTypeRow>(
    `SELECT
      rt.id,
      rt.name,
      rt.base_price,
      rt.capacity,
      rt.description,
      rt.amenities,
      rt.photos,
      COUNT(r.id) AS total_rooms
    FROM room_types rt
    LEFT JOIN rooms r ON r.room_type_id = rt.id
    ${whereClause}
    GROUP BY rt.id
    ORDER BY rt.id ASC`,
    params,
  );

  return rows.map(mapRow);
}

export async function getRoomType(id: number): Promise<RoomTypeDto> {
  const row = await queryOne<DbRoomTypeRow>(
    `SELECT
      rt.id,
      rt.name,
      rt.base_price,
      rt.capacity,
      rt.description,
      rt.amenities,
      rt.photos,
      COUNT(r.id) AS total_rooms
    FROM room_types rt
    LEFT JOIN rooms r ON r.room_type_id = rt.id
    WHERE rt.id = ?
    GROUP BY rt.id`,
    [id],
  );

  if (!row) throw new HttpError(404, "Room type not found");
  return mapRow(row);
}

export async function createRoomType(input: CreateRoomTypeInput): Promise<RoomTypeDto> {
  await checkNameConflict(input.name);

  const amenitiesJson = JSON.stringify(input.amenities);
  const photosJson = JSON.stringify(input.photos);

  const row = await queryOne<DbRoomTypeRow>(
    `INSERT INTO room_types (name, base_price, capacity, description, amenities, photos)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING id, name, base_price, capacity, description, amenities, photos`,
    [input.name, input.base_price, input.capacity, input.description ?? null, amenitiesJson, photosJson],
  );

  return mapRow({ ...row!, total_rooms: 0 });
}

export async function updateRoomType(id: number, input: UpdateRoomTypeInput): Promise<RoomTypeDto> {
  await getRoomType(id);

  if (input.name) {
    await checkNameConflict(input.name, id);
  }

  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    params.push(input.name);
  }
  if (input.base_price !== undefined) {
    updates.push("base_price = ?");
    params.push(input.base_price);
  }
  if (input.capacity !== undefined) {
    updates.push("capacity = ?");
    params.push(input.capacity);
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(input.description);
  }
  if (input.amenities !== undefined) {
    updates.push("amenities = ?");
    params.push(JSON.stringify(input.amenities));
  }
  if (input.photos !== undefined) {
    updates.push("photos = ?");
    params.push(JSON.stringify(input.photos));
  }

  params.push(id);

  await db.execute({ sql: `UPDATE room_types SET ${updates.join(", ")} WHERE id = ?`, args: params });

  return getRoomType(id);
}

export async function deleteRoomType(id: number): Promise<{ message: string }> {
  await getRoomType(id);

  const roomsCount =
    (await queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM rooms WHERE room_type_id = ?", [id]))
      ?.count ?? 0;

  const reservationsCount =
    (await queryOne<{ count: number }>(
      "SELECT COUNT(*) AS count FROM reservations WHERE room_type_id = ?",
      [id],
    ))?.count ?? 0;

  if (roomsCount > 0 || reservationsCount > 0) {
    throw new HttpError(
      409,
      `Cannot delete room type: referenced by ${roomsCount} room(s) and ${reservationsCount} reservation(s)`,
    );
  }

  await db.execute({ sql: "DELETE FROM room_types WHERE id = ?", args: [id] });
  return { message: "Room type deleted successfully" };
}