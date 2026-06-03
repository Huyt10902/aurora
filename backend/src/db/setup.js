import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "../lib/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setup = async () => {
	try {
		const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
		await pool.query(schema);
		console.log("PostgreSQL schema applied successfully!");
	} catch (error) {
		console.error("Error applying PostgreSQL schema:", error);
		process.exitCode = 1;
	} finally {
		await pool.end();
	}
};

setup();
