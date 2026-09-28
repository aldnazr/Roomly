# API

Express + SQLite (via Bun) API for the room booking app.

## Setup

```bash
bun install
cp .env.example .env   # then fill in the values
```

Required environment variables (see `.env.example`):

- `PORT` – HTTP port (default `4000`)
- `DATABASE_PATH` – SQLite file location (default `data/database.db`)
- `JWT_SECRET` – signing secret for access tokens, at least 32 characters
- `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` – used by the admin seeder

## Run

```bash
bun run dev     # development with watch
bun run start   # production entrypoint (same TS entry)
bun run build   # type-check
```

Migrations run automatically on startup (tracked in `schema_migrations`).

## Seed

```bash
bun run seed          # roles, then admin
bun run seed:roles    # roles and permissions only
bun run seed:admin    # admin user from ADMIN_* env vars
```

The admin seeder is idempotent: rerunning rotates the admin name/password/role for
the configured `ADMIN_EMAIL`. Users without a stored password hash cannot log in.

## Auth

`POST /api/auth/login` with JSON `{ "email": "...", "password": "..." }`.

```bash
curl -s http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"..."}'
```

- `200` → `{ "data": { "accessToken", "expiresIn": 3600, "user": { "id", "username", "name", "email", "role" } } }`
- `400` → malformed JSON or invalid fields
- `401` → identical generic error for unknown email, wrong password, or missing hash
- `500` → unexpected failure (details only in server logs)

Tokens are HS256 JWTs valid for one hour, carrying `sub` (user id), `role`,
`iat`, and `exp`. Send them as `Authorization: Bearer <accessToken>` on protected
endpoints such as those in [Roles](#roles). There is no refresh/revocation: tokens are valid until expiry.

## Roles

Roles, permissions, and their mappings live in the `roles`, `permissions`, and
`role_permissions` tables, seeded by `bun run seed:roles`. Every endpoint below
needs `Authorization: Bearer <accessToken>` and answers `401` when the token is
missing, malformed, invalid, or expired.

Permission checks read the database on each request, so a permission change
applies from the next request onward. The `role` claim inside an issued token
never changes.

### View

`GET /api/roles` lists every role:

```bash
curl -s http://localhost:4000/api/roles -H "Authorization: Bearer $TOKEN"
```

- `200` → `{ "data": [ { "slug": "guest", "name": "Guest", "description": "...", "permissions": ["rooms.browse", ...] } ] }`

`GET /api/roles/:slug` returns one role in the same shape.

- `200` → single role object instead of an array
- `404` → unknown role slug

### Set

`PUT /api/roles/:slug/permissions` replaces the role's full permission set.

```bash
curl -s -X PUT http://localhost:4000/api/roles/staff/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"permissions":["rooms.browse","bookings.view_all"]}'
```

The caller's role needs the `permissions.manage` permission.

- `200` → updated role object
- `400` → body failed validation or a permission slug does not exist; nothing is written
- `403` → caller's role lacks `permissions.manage`
- `404` → unknown role slug

`permissions` must be an array of unique non-empty strings. `[]` strips every
permission from the role. The replace runs in one transaction, so the set never
ends up half-updated. Any role can be edited, `admin` included: removing
`permissions.manage` from a role revokes its own access to this endpoint.
`bun run seed:roles` restores the seeded defaults.

## Permissions

`GET /api/permissions` lists every permission available in the system (the set
seeded by `bun run seed:roles`). Any authenticated user may call it — no extra
permission required — so role-management UIs can render slug/name/description.

```bash
curl -s http://localhost:4000/api/permissions -H "Authorization: Bearer $TOKEN"
```

- `200` → `{ "data": [ { "slug": "rooms.browse", "name": "Browse rooms", "description": "..." }, ... ] }`
- `401` → missing, malformed, invalid, or expired token

The list is ordered by seed order and reflects the current database contents;
a permission added or renamed via the seeder shows up on the next request.

## Users

User management endpoints require `Authorization: Bearer <accessToken>` and the
`users.manage` permission on the caller's role. Responses never expose password
hashes.

### List

`GET /api/users`

```bash
curl -s http://localhost:4000/api/users -H "Authorization: Bearer $TOKEN"
```

- `200` → `{ "data": [ { "id": 1, "username": "admin", "name": "Admin", "email": "admin@example.com", "role": "admin" }, ... ] }`
- `401` → missing, malformed, or expired token
- `403` → caller's role lacks `users.manage`

### Get

`GET /api/users/:id`

- `200` → `{ "data": { "id": 1, "username": "admin", "name": "Admin", "email": "admin@example.com", "role": "admin" } }`
- `400` → invalid user ID format
- `404` → user not found

### Create

`POST /api/users` with JSON `{ "username", "email", "password", "role" }`.

```bash
curl -s -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"staff_alex","email":"alex@example.com","password":"secure-pass-123","role":"staff"}'
```

- `201` → `{ "data": { "id": 2, "username": "staff_alex", "name": "staff_alex", "email": "alex@example.com", "role": "staff" } }`
- `400` → body validation failed (password < 8 chars, invalid email, username format, or role does not exist)
- `409` → email or username already in use

### Update

`PATCH /api/users/:id` with optional fields `{ "username", "email", "password", "role" }`.

```bash
curl -s -X PATCH http://localhost:4000/api/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"role":"manager"}'
```

- `200` → updated user object
- `400` → invalid fields or no fields provided
- `404` → user not found
- `409` → new email or username is already taken by another user

### Delete

`DELETE /api/users/:id`

```bash
curl -s -X DELETE http://localhost:4000/api/users/2 \
  -H "Authorization: Bearer $TOKEN"
```

- `200` → `{ "data": { "message": "User deleted successfully" } }`
- `404` → user not found

## Room Types

Manage room types (Standard, Deluxe, etc.). Reading requires `rooms.browse` permission (held by guest, staff, manager, admin). Create, update, and delete require `room_types.manage` permission (manager, admin).

### List

`GET /api/room-types[?capacity_min=N&capacity_max=N]`

```bash
curl -s http://localhost:4000/api/room-types \
  -H "Authorization: Bearer $TOKEN"
```

- `200` → `{ "data": [ { "id": 1, "name": "Deluxe", "base_price": 750000, "capacity": 2, "description": "...", "amenities": ["WiFi", "AC"], "photos": ["https://..."], "total_rooms": 5 } ] }`

### Get

`GET /api/room-types/:id`

- `200` → single room type object
- `400` → invalid room type ID
- `404` → room type not found

### Create

`POST /api/room-types` with JSON `{ "name", "capacity", "base_price", "description"?, "amenities"?, "photos"? }`.

```bash
curl -s -X POST http://localhost:4000/api/room-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Deluxe Ocean","capacity":2,"base_price":850000,"description":"Ocean view","amenities":["WiFi","Balcony"],"photos":["https://example.com/img.jpg"]}'
```

- `201` → created room type object
- `400` → body validation failed
- `409` → room type name already exists

### Update

`PATCH /api/room-types/:id` with optional fields `{ "name", "capacity", "base_price", "description", "amenities", "photos" }`.

```bash
curl -s -X PATCH http://localhost:4000/api/room-types/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"base_price":900000}'
```

- `200` → updated room type object
- `400` → invalid fields or no fields provided
- `404` → room type not found
- `409` → name already taken by another room type

### Delete

`DELETE /api/room-types/:id`

```bash
curl -s -X DELETE http://localhost:4000/api/room-types/1 \
  -H "Authorization: Bearer $TOKEN"
```

- `200` → `{ "data": { "message": "Room type deleted successfully" } }`
- `404` → room type not found
- `409` → cannot delete room type because physical rooms or reservations reference it

## Availability

Search for available room types across a requested date range and party size. Requires `rooms.browse` permission.

Rooms in `maintenance` status are excluded from inventory. Active reservations (`pending`, `confirmed`, `checked_in`) overlapping the stay reduce available rooms per night (checkout day is non-blocking). Active pricing rules (`price_override` or `multiplier`) are applied automatically to calculate nightly rates and total stay price.

`GET /api/availability?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD&guests=N`

```bash
curl -s "http://localhost:4000/api/availability?check_in=2026-10-01&check_out=2026-10-03&guests=2" \
  -H "Authorization: Bearer $TOKEN"
```

- `200` → `{ "data": { "check_in": "2026-10-01", "check_out": "2026-10-03", "nights": 2, "guests": 2, "results": [ { "room_type": { ... }, "available_rooms": 3, "price": { "nightly": [ { "date": "2026-10-01", "price": 850000 }, { "date": "2026-10-02", "price": 850000 } ], "total": 1700000, "average_nightly": 850000 } } ] } }`
- `400` → missing/invalid date, `check_out <= check_in`, `guests < 1`, or stay exceeds 30 nights
- `401` → missing or invalid access token

Only room types with `capacity >= guests` and `available_rooms > 0` are returned in `results`.


## Notes

- Access tokens cannot be revoked before they expire.
- Rate limiting / brute-force protection is not implemented yet; add before public deployment.
