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

## Notes

- Access tokens cannot be revoked before they expire.
- Rate limiting / brute-force protection is not implemented yet; add before public deployment.
