import { db } from "../db";

const roomTypes = [
  {
    name: "Standard",
    base_price: 350_000,
    capacity: 2,
    description: "Kamar nyaman dengan fasilitas esensial untuk perjalanan singkat.",
    amenities: ["WiFi", "AC", "TV"],
    floor: 1,
    count: 6,
  },
  {
    name: "Deluxe",
    base_price: 650_000,
    capacity: 2,
    description: "Kamar lebih luas dengan area kerja dan pemandangan kota.",
    amenities: ["WiFi", "AC", "TV", "Mini bar", "Brankas"],
    floor: 2,
    count: 5,
  },
  {
    name: "Family",
    base_price: 850_000,
    capacity: 4,
    description: "Kamar luas dengan dua tempat tidur, cocok untuk keluarga.",
    amenities: ["WiFi", "AC", "TV", "Sofa", "Tempat tidur ekstra"],
    floor: 3,
    count: 4,
  },
  {
    name: "Suite",
    base_price: 1_200_000,
    capacity: 3,
    description: "Suite dengan ruang tamu terpisah dan fasilitas premium.",
    amenities: ["WiFi", "AC", "TV", "Mini bar", "Brankas", "Bathtub"],
    floor: 4,
    count: 3,
  },
] as const;

// ponytail: photos seeded empty; fill with real asset URLs when assets exist.
const upsertRoomTypeSql = `
  INSERT INTO room_types (name, base_price, capacity, description, amenities, photos)
  VALUES (?, ?, ?, ?, ?, '[]')
  ON CONFLICT(name) DO UPDATE SET
    base_price = excluded.base_price,
    capacity = excluded.capacity,
    description = excluded.description,
    amenities = excluded.amenities
  RETURNING id
`;

const upsertRoomSql = `
  INSERT INTO rooms (room_type_id, room_number)
  VALUES (?, ?)
  ON CONFLICT(room_number) DO UPDATE SET
    room_type_id = excluded.room_type_id
`;

// ponytail: sequential executes instead of one transaction; upserts are idempotent,
// switch to db.transaction(...) if seeding must be atomic.
export async function seedRooms(): Promise<number> {
  let seeded = 0;

  for (const roomType of roomTypes) {
    const result = await db.execute({
      sql: upsertRoomTypeSql,
      args: [
        roomType.name,
        roomType.base_price,
        roomType.capacity,
        roomType.description,
        JSON.stringify(roomType.amenities),
      ],
    });
    const id = result.rows[0]!.id as number;

    for (let i = 1; i <= roomType.count; i++) {
      const roomNumber = `${roomType.floor}${String(i).padStart(2, "0")}`;
      await db.execute({ sql: upsertRoomSql, args: [id, roomNumber] });
      seeded++;
    }
  }

  return seeded;
}

if (import.meta.main) {
  seedRooms()
    .then((seeded) => {
      console.log(`Seeded ${seeded} rooms across ${roomTypes.length} room types`);
    })
    .catch((err) => {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    });
}