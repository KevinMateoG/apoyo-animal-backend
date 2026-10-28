import net from "node:net";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

net.setDefaultAutoSelectFamilyAttemptTimeout(5000);

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 10000,
});

export const prisma = new PrismaClient({ adapter });