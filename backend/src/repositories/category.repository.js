import { BaseRepository } from "./base.repository.js";

export class CategoryRepository extends BaseRepository {
	findAll() {
		return this.many("SELECT * FROM categories ORDER BY name ASC");
	}

	findById(id) {
		return this.one("SELECT * FROM categories WHERE id = $1", [id]);
	}

	findByName(name) {
		return this.one("SELECT * FROM categories WHERE LOWER(name) = LOWER($1)", [name]);
	}

	create({ name, description = "" }) {
		return this.one(
			`INSERT INTO categories (name, description)
			 VALUES ($1, $2)
			 ON CONFLICT (name) DO UPDATE SET
			 	name = EXCLUDED.name,
			 	description = EXCLUDED.description,
			 	updated_at = NOW()
			 RETURNING *`,
			[name, description]
		);
	}

	update({ id, name, description = "" }) {
		return this.one(
			`UPDATE categories
			 SET name = $2,
			     description = $3,
			     updated_at = NOW()
			 WHERE id = $1
			 RETURNING *`,
			[id, name, description],
		);
	}

	async delete(id) {
		await this.query("DELETE FROM song_categories WHERE category_id = $1", [id]);
		return this.one("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);
	}
}
