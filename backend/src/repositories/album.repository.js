import { BaseRepository } from "./base.repository.js";

const albumSelect = `
	SELECT a.id,
	       a.title,
	       a.release_year,
	       a.cover_asset_id,
	       a.created_at,
	       a.updated_at,
	       cover.url AS image_url,
	       cover.public_id AS cover_public_id,
	       COALESCE(
	       	STRING_AGG(DISTINCT artist.name, ', ' ORDER BY artist.name)
	       	FILTER (WHERE artist.id IS NOT NULL),
	       	'Unknown Artist'
	       ) AS artist,
	       COALESCE(
	       	JSON_AGG(DISTINCT als.song_id) FILTER (WHERE als.song_id IS NOT NULL),
	       	'[]'
	       ) AS song_ids
	FROM albums a
	LEFT JOIN media_assets cover ON cover.id = a.cover_asset_id
	LEFT JOIN album_artists aa ON aa.album_id = a.id
	LEFT JOIN artists artist ON artist.id = aa.artist_id
	LEFT JOIN album_songs als ON als.album_id = a.id
`;

const albumGroup = "GROUP BY a.id, cover.url, cover.public_id";

export class AlbumRepository extends BaseRepository {
	create({ title, releaseYear, coverAssetId }) {
		return this.one(
			`INSERT INTO albums (title, release_year, cover_asset_id)
			 VALUES ($1, $2, $3)
			 RETURNING *`,
			[title, releaseYear, coverAssetId]
		);
	}

	linkArtist({ albumId, artistId, role = "primary", sortOrder = 0 }) {
		return this.one(
			`INSERT INTO album_artists (album_id, artist_id, role, sort_order)
			 VALUES ($1, $2, $3, $4)
			 ON CONFLICT (album_id, artist_id, role)
			 DO UPDATE SET sort_order = EXCLUDED.sort_order
			 RETURNING *`,
			[albumId, artistId, role, sortOrder]
		);
	}

	findAll() {
		return this.many(`${albumSelect} ${albumGroup} ORDER BY a.created_at DESC`);
	}

	findByTerm(term) {
		const searchTerm = `%${String(term || "").trim().toLowerCase()}%`;
		return this.many(
			`${albumSelect}
			 WHERE LOWER(a.title) LIKE $1
			    OR EXISTS (
			    	SELECT 1
			    	FROM album_artists aa_search
			    	JOIN artists artist_search ON artist_search.id = aa_search.artist_id
			    	WHERE aa_search.album_id = a.id
			    	  AND LOWER(artist_search.name) LIKE $1
			    )
			 ${albumGroup}
			 ORDER BY a.created_at DESC
			 LIMIT 20`,
			[searchTerm],
		);
	}

	findById(id) {
		return this.one(`${albumSelect} WHERE a.id = $1 ${albumGroup}`, [id]);
	}

	findByArtistId(artistId) {
		return this.many(
			`${albumSelect}
			 JOIN album_artists aa_filter ON aa_filter.album_id = a.id
			 WHERE aa_filter.artist_id = $1
			 ${albumGroup}
			 ORDER BY a.created_at DESC`,
			[artistId],
		);
	}

	async replaceArtists({ albumId, artistId }) {
		await this.query("DELETE FROM album_artists WHERE album_id = $1", [albumId]);
		return this.linkArtist({ albumId, artistId });
	}

	update({ id, title, releaseYear, coverAssetId }) {
		return this.one(
			`UPDATE albums
			 SET title = COALESCE($2, title),
			     release_year = COALESCE($3, release_year),
			     cover_asset_id = COALESCE($4, cover_asset_id),
			     updated_at = NOW()
			 WHERE id = $1
			 RETURNING *`,
			[id, title, releaseYear, coverAssetId],
		);
	}

	findAssetsById(id) {
		return this.one(
			`SELECT a.id,
			        a.cover_asset_id,
			        cover.public_id AS cover_public_id
			 FROM albums a
			 LEFT JOIN media_assets cover ON cover.id = a.cover_asset_id
			 WHERE a.id = $1`,
			[id],
		);
	}

	delete(id) {
		return this.one(
			`DELETE FROM albums
			 WHERE id = $1
			 RETURNING id, cover_asset_id`,
			[id],
		);
	}
}
