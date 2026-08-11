import { PrismaClient } from "@/app/generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    // Production — dynamically require so better-sqlite3 is never imported
    // on Vercel (it can't build native modules in serverless)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");

    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    return new PrismaClient({ adapter: new PrismaLibSQL(turso) });
  }

  // Local dev only — better-sqlite3 is never required on Vercel
  // because TURSO_DATABASE_URL is always set in production
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
