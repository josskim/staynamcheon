import { PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "./database-url";

const prismaClientSingleton = () => {
  const url = runtimeDatabaseUrl(process.env.DATABASE_URL);
  if (url) {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".pooler.supabase.com") && parsed.port === "6543") {
      console.info("Database runtime pool configured", { mode: "transaction", connectionLimit: 1 });
    }
  }
  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

globalThis.prisma = prisma;
