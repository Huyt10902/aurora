import { BaseRepository } from "./base.repository.js";

export class SettingsRepository extends BaseRepository {
	async findAll() {
		return this.many("SELECT * FROM app_settings ORDER BY key ASC");
	}

	async findByKey(key) {
		return this.one("SELECT * FROM app_settings WHERE key = $1", [key]);
	}

	async upsert({ key, value, userId }) {
		return this.one(
			`INSERT INTO app_settings (key, value, updated_by)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (key)
			 DO UPDATE SET
			   value = EXCLUDED.value,
			   updated_by = EXCLUDED.updated_by,
			   updated_at = NOW()
			 RETURNING *`,
			[key, value, userId]
		);
	}
}
