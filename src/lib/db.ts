import { Knex } from "knex";

let db: Knex;

export async function getDb(): Promise<Knex> {
  if (!db) {
    const knexModule = await import("knex"); // dynamic import prevents Next.js bundling all drivers
    db = knexModule.default({
      client: "mysql2",
      connection: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        connectTimeout: 10000,
      },
      pool: { min: 0, max: 20 },
    });
  }
  return db;
}
