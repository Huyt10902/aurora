import { BaseRepository } from "./base.repository.js";

const songSelect = `
	SELECT s.id,
	       s.title,
	       s.duration,
	       s.audio_asset_id,
	       s.cover_asset_id,
	       s.created_at,
	       s.updated_at,
	       audio.url AS audio_url,
	       audio.public_id AS audio_public_id,
	       cover.url AS image_url,
	       cover.public_id AS cover_public_id,
	       COALESCE(
	       	STRING_AGG(DISTINCT artist.name, ', ' ORDER BY artist.name)
	       	FILTER (WHERE artist.id IS NOT NULL),
	       	'Unknown Artist'
	       ) AS artist,
	       (
	       	SELECT als.album_id
	       	FROM album_songs als
	       	WHERE als.song_id = s.id
	       	ORDER BY als.track_number ASC
	       	LIMIT 1
	       ) AS album_id,
	       (
	       	SELECT album.title
	       	FROM album_songs als
	       	JOIN albums album ON album.id = als.album_id
	       	WHERE als.song_id = s.id
	       	ORDER BY als.track_number ASC
	       	LIMIT 1
	       ) AS album_title,
	       (
	       	SELECT album.release_year
	       	FROM album_songs als
	       	JOIN albums album ON album.id = als.album_id
	       	WHERE als.song_id = s.id
	       	ORDER BY als.track_number ASC
	       	LIMIT 1
	       ) AS album_release_year,
	       (
	       	SELECT COUNT(*)::int
	       	FROM user_song_plays usp
	       	WHERE usp.song_id = s.id
	       ) AS play_count,
	       COALESCE(
	       	(
	       		SELECT ROUND(AVG(song_rating.rating)::numeric, 1)::float
	       		FROM song_ratings song_rating
	       		WHERE song_rating.song_id = s.id
	       	),
	       	0
	       ) AS average_rating,
	       (
	       	SELECT COUNT(*)::int
	       	FROM song_ratings song_rating
	       	WHERE song_rating.song_id = s.id
	       ) AS rating_count,
	       (
	       	SELECT COUNT(*)::int
	       	FROM song_comments song_comment
	       	WHERE song_comment.song_id = s.id
	       ) AS comment_count,
	       COALESCE(
	       	(
	       		SELECT JSON_AGG(
	       			JSON_BUILD_OBJECT(
	       				'id', genre.id,
	       				'name', genre.name,
	       				'created_at', genre.created_at,
	       				'updated_at', genre.updated_at
	       			)
	       			ORDER BY genre.name ASC
	       		)
	       		FROM song_genres sg
	       		JOIN genres genre ON genre.id = sg.genre_id
	       		WHERE sg.song_id = s.id
	       	),
	       	'[]'::json
	       ) AS genres,
	       COALESCE(
	       	(
	       		SELECT JSON_AGG(
	       			JSON_BUILD_OBJECT(
	       				'id', category.id,
	       				'name', category.name,
	       				'description', category.description,
	       				'created_at', category.created_at,
	       				'updated_at', category.updated_at
	       			)
	       			ORDER BY category.name ASC
	       		)
	       		FROM song_categories sc
	       		JOIN categories category ON category.id = sc.category_id
	       		WHERE sc.song_id = s.id
	       	),
	       	'[]'::json
	       ) AS categories
	FROM songs s
	JOIN media_assets audio ON audio.id = s.audio_asset_id
	LEFT JOIN media_assets cover ON cover.id = s.cover_asset_id
	LEFT JOIN song_artists sa ON sa.song_id = s.id
	LEFT JOIN artists artist ON artist.id = sa.artist_id
`;

const songGroup = `
	GROUP BY s.id, audio.url, audio.public_id, cover.url, cover.public_id
`;

export class SongRepository extends BaseRepository {
	create({ title, duration, audioAssetId, coverAssetId }) {
		return this.one(
			`INSERT INTO songs (title, duration, audio_asset_id, cover_asset_id)
			 VALUES ($1, $2, $3, $4)
			 RETURNING *`,
			[title, duration, audioAssetId, coverAssetId]
		);
	}

	linkArtist({ songId, artistId, role = "primary", sortOrder = 0 }) {
		return this.one(
			`INSERT INTO song_artists (song_id, artist_id, role, sort_order)
			 VALUES ($1, $2, $3, $4)
			 ON CONFLICT (song_id, artist_id, role)
			 DO UPDATE SET sort_order = EXCLUDED.sort_order
			 RETURNING *`,
			[songId, artistId, role, sortOrder]
		);
	}

	findAll() {
		return this.many(`${songSelect} ${songGroup} ORDER BY s.created_at DESC`);
	}

	findWithFilters({ query = "", genreId = null, categoryId = null }) {
		const searchTerm = `%${String(query || "").trim().toLowerCase()}%`;
		return this.many(
			`${songSelect}
			 WHERE ($1 = '%%'
			       OR LOWER(s.title) LIKE $1
			       OR EXISTS (
			       	SELECT 1
			       	FROM song_artists sa_search
			       	JOIN artists artist_search ON artist_search.id = sa_search.artist_id
			       	WHERE sa_search.song_id = s.id
			       	  AND LOWER(artist_search.name) LIKE $1
			       ))
			   AND ($2::uuid IS NULL OR EXISTS (
			   	SELECT 1 FROM song_genres sg_filter
			   	WHERE sg_filter.song_id = s.id AND sg_filter.genre_id = $2
			   ))
			   AND ($3::uuid IS NULL OR EXISTS (
			   	SELECT 1 FROM song_categories sc_filter
			   	WHERE sc_filter.song_id = s.id AND sc_filter.category_id = $3
			   ))
			 ${songGroup}
			 ORDER BY s.created_at DESC`,
			[searchTerm, genreId || null, categoryId || null],
		);
	}

	findRandom(limit) {
		return this.many(`${songSelect} ${songGroup} ORDER BY RANDOM() LIMIT $1`, [limit]);
	}

	findTrending(limit) {
		return this.many(
			`${songSelect}
			 ${songGroup}
			 ORDER BY play_count DESC, s.created_at DESC
			 LIMIT $1`,
			[limit],
		);
	}

	findById(id) {
		return this.one(`${songSelect} WHERE s.id = $1 ${songGroup}`, [id]);
	}

	findByTerm(term) {
		return this.findWithFilters({ query: term });
	}

	findByAlbumId(albumId) {
		return this.many(
			`${songSelect}
			 JOIN album_songs als_filter ON als_filter.song_id = s.id
			 WHERE als_filter.album_id = $1
			 ${songGroup}, als_filter.track_number
			 ORDER BY als_filter.track_number ASC, s.created_at ASC`,
			[albumId]
		);
	}

	findByArtistId(artistId) {
		return this.many(
			`${songSelect}
			 JOIN song_artists sa_filter ON sa_filter.song_id = s.id
			 WHERE sa_filter.artist_id = $1
			 ${songGroup}
			 ORDER BY s.created_at DESC`,
			[artistId],
		);
	}

	findRecommendedForUser({ userId, limit = 12 }) {
		return this.many(
			`${songSelect}
			 WHERE s.id NOT IN (
			 	SELECT song_id FROM user_liked_songs WHERE user_id = $1
			 	UNION
			 	SELECT song_id FROM user_song_plays WHERE user_id = $1
			 )
			   AND (
			   	EXISTS (
			   		SELECT 1
			   		FROM song_genres candidate_genre
			   		WHERE candidate_genre.song_id = s.id
			   		  AND candidate_genre.genre_id IN (
			   		  	SELECT liked_genre.genre_id
			   		  	FROM user_liked_songs liked
			   		  	JOIN song_genres liked_genre ON liked_genre.song_id = liked.song_id
			   		  	WHERE liked.user_id = $1
			   		  	UNION
			   		  	SELECT played_genre.genre_id
			   		  	FROM user_song_plays played
			   		  	JOIN song_genres played_genre ON played_genre.song_id = played.song_id
			   		  	WHERE played.user_id = $1
			   		  )
			   	)
			   	OR EXISTS (
			   		SELECT 1
			   		FROM song_categories candidate_category
			   		WHERE candidate_category.song_id = s.id
			   		  AND candidate_category.category_id IN (
			   		  	SELECT liked_category.category_id
			   		  	FROM user_liked_songs liked
			   		  	JOIN song_categories liked_category ON liked_category.song_id = liked.song_id
			   		  	WHERE liked.user_id = $1
			   		  	UNION
			   		  	SELECT played_category.category_id
			   		  	FROM user_song_plays played
			   		  	JOIN song_categories played_category ON played_category.song_id = played.song_id
			   		  	WHERE played.user_id = $1
			   		  )
			   	)
			   )
			 ${songGroup}
			 ORDER BY RANDOM()
			 LIMIT $2`,
			[userId, limit],
		);
	}

	findFallbackRecommendations({ userId, limit = 12 }) {
		return this.many(
			`${songSelect}
			 WHERE s.id NOT IN (
			 	SELECT song_id FROM user_liked_songs WHERE user_id = $1
			 	UNION
			 	SELECT song_id FROM user_song_plays WHERE user_id = $1
			 )
			 ${songGroup}
			 ORDER BY RANDOM()
			 LIMIT $2`,
			[userId, limit],
		);
	}

	linkAlbum({ albumId, songId, trackNumber = 0 }) {
		return this.one(
			`INSERT INTO album_songs (album_id, song_id, track_number)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (album_id, song_id)
			 DO UPDATE SET track_number = EXCLUDED.track_number
			 RETURNING *`,
			[albumId, songId, trackNumber]
		);
	}

	async replaceAlbum({ songId, albumId }) {
		await this.query("DELETE FROM album_songs WHERE song_id = $1", [songId]);
		if (!albumId) return null;
		return this.linkAlbum({ albumId, songId });
	}

	async replaceArtists({ songId, artistId }) {
		await this.query("DELETE FROM song_artists WHERE song_id = $1", [songId]);
		return this.linkArtist({ songId, artistId });
	}

	update({ id, title, duration, audioAssetId, coverAssetId }) {
		return this.one(
			`UPDATE songs
			 SET title = COALESCE($2, title),
			     duration = COALESCE($3, duration),
			     audio_asset_id = COALESCE($4, audio_asset_id),
			     cover_asset_id = COALESCE($5, cover_asset_id),
			     updated_at = NOW()
			 WHERE id = $1
			 RETURNING *`,
			[id, title, duration, audioAssetId, coverAssetId],
		);
	}

	async replaceGenres(songId, genreIds) {
		await this.query("DELETE FROM song_genres WHERE song_id = $1", [songId]);

		for (const genreId of genreIds) {
			await this.query(
				`INSERT INTO song_genres (song_id, genre_id)
				 VALUES ($1, $2)
				 ON CONFLICT (song_id, genre_id) DO NOTHING`,
				[songId, genreId]
			);
		}

		return this.findById(songId);
	}

	async replaceCategories(songId, categoryIds) {
		await this.query("DELETE FROM song_categories WHERE song_id = $1", [songId]);

		for (const categoryId of categoryIds) {
			await this.query(
				`INSERT INTO song_categories (song_id, category_id)
				 VALUES ($1, $2)
				 ON CONFLICT (song_id, category_id) DO NOTHING`,
				[songId, categoryId]
			);
		}

		return this.findById(songId);
	}

	findAssetsById(id) {
		return this.one(
			`SELECT s.id,
			        s.audio_asset_id,
			        s.cover_asset_id,
			        audio.public_id AS audio_public_id,
			        cover.public_id AS cover_public_id
			 FROM songs s
			 JOIN media_assets audio ON audio.id = s.audio_asset_id
			 LEFT JOIN media_assets cover ON cover.id = s.cover_asset_id
			 WHERE s.id = $1`,
			[id],
		);
	}

	delete(id) {
		return this.one(
			`DELETE FROM songs
			 WHERE id = $1
			 RETURNING id, audio_asset_id, cover_asset_id`,
			[id],
		);
	}
}
