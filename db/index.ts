import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// One shared pool for the entire process — never create additional clients in route files.
// Supabase free tier allows ~15 connections total; cap at 4 to leave room for migrations/studio.
const globalForDb = globalThis as unknown as { _pgClient?: ReturnType<typeof postgres> };

if (!globalForDb._pgClient) {
  globalForDb._pgClient = postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 4,
  });
}

export const db = drizzle(globalForDb._pgClient, { schema });
