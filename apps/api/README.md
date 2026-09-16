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

- `200` → `{ "data": { "accessToken", "expiresIn": 3600, "user": { "id", "name", "email", "role" } } }`
- `400` → malformed JSON or invalid fields
- `401` → identical generic error for unknown email, wrong password, or missing hash
- `500` → unexpected failure (details only in server logs)

Tokens are HS256 JWTs valid for one hour, carrying `sub` (user id), `role`,
`iat`, and `exp`. Send them as `Authorization: Bearer <accessToken>` on future
protected endpoints. There is no refresh/revocation: tokens are valid until expiry.

## Notes

- Access tokens cannot be revoked before they expire.
- Rate limiting / brute-force protection is not implemented yet; add before public deployment.
