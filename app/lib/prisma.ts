import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

declare global {
  var prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
