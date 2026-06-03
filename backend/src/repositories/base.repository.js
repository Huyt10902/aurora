import { query } from "../lib/db.js";

export class BaseRepository {
	constructor(db = query) {
		this.db = db;
	}

	query(text, params) {
		return this.db(text, params);
	}

	async one(text, params) {
		const result = await this.query(text, params);
		return result.rows[0] || null;
	}

	async many(text, params) {
		const result = await this.query(text, params);
		return result.rows;
	}
}
