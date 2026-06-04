import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	host: process.env.PGHOST,
	port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
	database: process.env.PGDATABASE,
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	ssl:
		process.env.PGSSL === "true"
			? { rejectUnauthorized: false }
			: undefined,
});

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
