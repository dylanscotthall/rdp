# RUDE._.DUDE — Photography & Videography

Portfolio site with a featured grid, photo and video galleries grouped by theme, an interactive 3D globe of shoot locations, and a password-protected admin panel for managing it all.

## Stack

- **Next.js 16** (App Router, React 19, React Compiler)
- **Prisma 7** with SQLite (`@prisma/adapter-better-sqlite3`)
- **Cloudflare R2** for image and video storage (files are uploaded to R2 directly; the admin panel lists the bucket and links files into the database)
- **three.js / react-three-fiber** for the globe on `/map`

## Local setup

```bash
npm install                # also runs `prisma generate`
cp .env.example .env       # then fill in the values
npx prisma migrate dev     # creates prisma/dev.db if it doesn't exist
npm run dev
```

Open http://localhost:3000. The admin panel is at `/admin`; log in with `ADMIN_PASSWORD`.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite file, e.g. `file:./prisma/dev.db` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | R2 API credentials used by the admin panel to list files |
| `NEXT_R2_PUBLIC_URL` | Public media URL (`https://media.rude-dude.com`, the R2 bucket's custom domain) prefixed onto file keys |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SECRET` | Random string used to sign the admin session cookie |

## Project layout

- `app/` — pages (`/`, `/photography`, `/videography`, `/map`, `/about`, `/contact`, `/admin`)
- `app/api/` — route handlers; all writes require the admin cookie (`app/lib/auth.ts`)
- `app/lib/api.ts` — typed client-side fetch helpers
- `prisma/` — schema and migrations
- `proxy.ts` — redirects unauthenticated `/admin` visits to `/admin/login`
