import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const poolConfig = {};

// Prefer a full DATABASE_URL when provided to avoid mixing sources
if (process.env.DATABASE_URL) {
	poolConfig.connectionString = process.env.DATABASE_URL;
} else {
	if (process.env.PGHOST) poolConfig.host = process.env.PGHOST;
	if (process.env.PGPORT) poolConfig.port = Number(process.env.PGPORT);
	if (process.env.PGDATABASE) poolConfig.database = process.env.PGDATABASE;
	if (process.env.PGUSER) poolConfig.user = process.env.PGUSER;
	if (process.env.PGPASSWORD) poolConfig.password = process.env.PGPASSWORD;
}

if (process.env.PGSSL === "true") {
	poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);

export const query = (text, params) => pool.query(text, params);

export const withTransaction = async (callback) => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const result = await callback(client);
		await client.query("COMMIT");
		return result;
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
};

export const connectDB = async () => {
	try {
		await pool.query("SELECT 1");
		console.log("Connected to PostgreSQL");
	} catch (error) {
		console.error("Failed to connect to PostgreSQL", error);
		process.exit(1);
	}
};
