import { BaseRepository } from "./base.repository.js";

export class GenreRepository extends BaseRepository {
	findAll() {
		return this.many("SELECT * FROM genres ORDER BY name ASC");
	}

	findById(id) {
		return this.one("SELECT * FROM genres WHERE id = $1", [id]);
	}

	findByName(name) {
		return this.one("SELECT * FROM genres WHERE LOWER(name) = LOWER($1)", [name]);
	}

	create(name) {
		return this.one(
			`INSERT INTO genres (name)
			 VALUES ($1)
			 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			 RETURNING *`,
			[name]
		);
	}

	async delete(id) {
		await this.query("DELETE FROM song_genres WHERE genre_id = $1", [id]);
		return this.one("DELETE FROM genres WHERE id = $1 RETURNING id", [id]);
	}

	findBySongId(songId) {
		return this.many(
			`SELECT g.*
			 FROM genres g
			 JOIN song_genres sg ON sg.genre_id = g.id
			 WHERE sg.song_id = $1
			 ORDER BY g.name ASC`,
			[songId]
		);
	}
}
