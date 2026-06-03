import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: "postgres",
});

try {
  await client.connect();
  const dbName = process.env.PGDATABASE || "aurora_db";
  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName],
  );
  if (res.rows.length === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log("Database created:", dbName);
  } else {
    console.log("Database already exists:", dbName);
  }
} catch (err) {
  console.error("Failed to create database:", err.message || err);
  process.exit(1);
} finally {
  await client.end();
}
