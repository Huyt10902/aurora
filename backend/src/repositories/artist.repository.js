import { BaseRepository } from "./base.repository.js";

export class ArtistRepository extends BaseRepository {
	findByName(name) {
		return this.one("SELECT * FROM artists WHERE LOWER(name) = LOWER($1)", [name]);
	}

	findById(id) {
		return this.one(
			`SELECT a.id,
			        a.name,
			        a.bio,
			        avatar.url AS image_url,
			        a.created_at,
			        a.updated_at,
			        COUNT(DISTINCT sa.song_id)::int AS song_count,
			        COUNT(DISTINCT aa.album_id)::int AS album_count
			 FROM artists a
			 LEFT JOIN media_assets avatar ON avatar.id = a.image_asset_id
			 LEFT JOIN song_artists sa ON sa.artist_id = a.id
			 LEFT JOIN album_artists aa ON aa.artist_id = a.id
			 WHERE a.id = $1
			 GROUP BY a.id, avatar.url`,
			[id],
		);
	}

	search({ term = "", genreId = null, categoryId = null } = {}) {
		const searchTerm = `%${String(term || "").trim().toLowerCase()}%`;
		return this.many(
			`SELECT a.id,
			        a.name,
			        a.bio,
			        avatar.url AS image_url,
			        a.created_at,
			        a.updated_at,
			        COUNT(DISTINCT sa.song_id)::int AS song_count,
			        COUNT(DISTINCT aa.album_id)::int AS album_count
			 FROM artists a
			 LEFT JOIN media_assets avatar ON avatar.id = a.image_asset_id
			 LEFT JOIN song_artists sa ON sa.artist_id = a.id
			 LEFT JOIN album_artists aa ON aa.artist_id = a.id
			 WHERE ($1 = '%%' OR LOWER(a.name) LIKE $1)
			   AND ($2::uuid IS NULL OR EXISTS (
			   	SELECT 1
			   	FROM song_artists sa_filter
			   	JOIN song_genres sg_filter ON sg_filter.song_id = sa_filter.song_id
			   	WHERE sa_filter.artist_id = a.id
			   	  AND sg_filter.genre_id = $2
			   ))
			   AND ($3::uuid IS NULL OR EXISTS (
			   	SELECT 1
			   	FROM song_artists sa_filter
			   	JOIN song_categories sc_filter ON sc_filter.song_id = sa_filter.song_id
			   	WHERE sa_filter.artist_id = a.id
			   	  AND sc_filter.category_id = $3
			   ))
			 GROUP BY a.id, avatar.url
			 ORDER BY a.name ASC
			 LIMIT 20`,
			[searchTerm, genreId || null, categoryId || null],
		);
	}

	async findOrCreateByName(name) {
		const trimmedName = String(name || "").trim();
		const existing = await this.findByName(trimmedName);
		if (existing) return existing;

		return this.one(
			`INSERT INTO artists (name)
			 VALUES ($1)
			 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			 RETURNING *`,
			[trimmedName]
		);
	}
}
