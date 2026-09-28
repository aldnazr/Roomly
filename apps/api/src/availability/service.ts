import db from "../db";
import type { RoomTypeDto } from "../room-types/service";
import type { AvailabilityQueryInput } from "./schema";

export type NightlyPrice = {
  date: string;
  price: number;
};

export type AvailableRoomTypeResult = {
  room_type: RoomTypeDto;
  available_rooms: number;
  price: {
    nightly: NightlyPrice[];
    total: number;
    average_nightly: number;
  };
};

export type AvailabilityResponseDto = {
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  results: AvailableRoomTypeResult[];
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

type DbReservationRow = {
  id: number;
  room_id: number | null;
  check_in: string;
  check_out: string;
};

type DbPricingRuleRow = {
  start_date: string;
  end_date: string;
  price_override: number | null;
  multiplier: number | null;
};

function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (current < end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

export function searchAvailability(
  query: AvailabilityQueryInput,
): AvailabilityResponseDto {
  const dates = getDatesInRange(query.check_in, query.check_out);
  const nights = dates.length;

  const roomTypes = db
    .query<DbRoomTypeRow, [number]>(
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
      WHERE rt.capacity >= ?
      GROUP BY rt.id
      ORDER BY rt.base_price ASC, rt.id ASC`,
    )
    .all(query.guests);

  const results: AvailableRoomTypeResult[] = [];

  for (const rt of roomTypes) {
    const operableRooms = db
      .query<{ id: number }, [number]>(
        "SELECT id FROM rooms WHERE room_type_id = ? AND status <> 'maintenance'",
      )
      .all(rt.id);

    const operableRoomIds = new Set(operableRooms.map((r) => r.id));
    const totalOperable = operableRoomIds.size;

    if (totalOperable === 0) {
      continue;
    }

    const reservations = db
      .query<DbReservationRow, [number, string, string]>(
        `SELECT id, room_id, check_in, check_out
         FROM reservations
         WHERE room_type_id = ?
           AND status IN ('pending', 'confirmed', 'checked_in')
           AND check_in < ?
           AND check_out > ?`,
      )
      .all(rt.id, query.check_out, query.check_in);

    let minAvailable = totalOperable;

    for (const date of dates) {
      const activeForDate = reservations.filter(
        (r) => r.check_in <= date && r.check_out > date,
      );

      const assignedOperable = new Set<number>();
      let unassignedCount = 0;

      for (const res of activeForDate) {
        if (res.room_id !== null) {
          if (operableRoomIds.has(res.room_id)) {
            assignedOperable.add(res.room_id);
          }
        } else {
          unassignedCount += 1;
        }
      }

      const bookedCount = assignedOperable.size + unassignedCount;
      const availableOnDate = Math.max(0, totalOperable - bookedCount);

      if (availableOnDate < minAvailable) {
        minAvailable = availableOnDate;
      }

      if (minAvailable === 0) {
        break;
      }
    }

    // ponytail: sold-out room types are omitted; add ?include_unavailable=1 when UI requires rendering them disabled.
    if (minAvailable <= 0) {
      continue;
    }

    const pricingRules = db
      .query<DbPricingRuleRow, [number, string, string]>(
        `SELECT start_date, end_date, price_override, multiplier
         FROM pricing_rules
         WHERE room_type_id = ?
           AND start_date < ?
           AND end_date >= ?
         ORDER BY start_date ASC`,
      )
      .all(rt.id, query.check_out, query.check_in);

    const nightly: NightlyPrice[] = dates.map((date) => {
      const activeRule = pricingRules.find(
        (rule) => rule.start_date <= date && rule.end_date >= date,
      );

      let price = rt.base_price;
      if (activeRule) {
        if (activeRule.price_override !== null) {
          price = activeRule.price_override;
        } else if (activeRule.multiplier !== null) {
          price = Math.round(rt.base_price * activeRule.multiplier);
        }
      }

      return { date, price };
    });

    const total = nightly.reduce((sum, item) => sum + item.price, 0);
    const average_nightly = Math.round(total / nights);

    const roomTypeDto: RoomTypeDto = {
      id: rt.id,
      name: rt.name,
      base_price: rt.base_price,
      capacity: rt.capacity,
      description: rt.description,
      amenities: JSON.parse(rt.amenities || "[]"),
      photos: JSON.parse(rt.photos || "[]"),
      total_rooms: rt.total_rooms ?? 0,
    };

    results.push({
      room_type: roomTypeDto,
      available_rooms: minAvailable,
      price: {
        nightly,
        total,
        average_nightly,
      },
    });
  }

  return {
    check_in: query.check_in,
    check_out: query.check_out,
    nights,
    guests: query.guests,
    results,
  };
}
