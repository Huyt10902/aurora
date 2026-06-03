import { BaseRepository } from "./base.repository.js";

const playlistSelect = `
	SELECT p.id,
	       p.user_id,
	       p.title,
	       p.description,
	       p.visibility,
	       p.cover_asset_id,
	       cover.url AS image_url,
	       p.created_at,
	       p.updated_at,
	       COUNT(ps.song_id)::int AS song_count
	FROM playlists p
	LEFT JOIN media_assets cover ON cover.id = p.cover_asset_id
	LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
`;

const playlistGroup = "GROUP BY p.id, cover.url";

export class PlaylistRepository extends BaseRepository {
	create({ userId, title, description = "", visibility = "private" }) {
		return this.one(
			`INSERT INTO playlists (user_id, title, description, visibility)
			 VALUES ($1, $2, $3, $4)
			 RETURNING *`,
			[userId, title, description, visibility],
		);
	}

	findByUser(userId) {
		return this.many(
			`${playlistSelect}
			 WHERE p.user_id = $1
			 ${playlistGroup}
			 ORDER BY p.updated_at DESC`,
			[userId],
		);
	}

	findByIdForUser({ playlistId, userId }) {
		return this.one(
			`${playlistSelect}
			 WHERE p.id = $1 AND p.user_id = $2
			 ${playlistGroup}`,
			[playlistId, userId],
		);
	}

	update({ playlistId, userId, title, description, visibility }) {
		return this.one(
			`UPDATE playlists
			 SET title = COALESCE($3, title),
			     description = COALESCE($4, description),
			     visibility = COALESCE($5, visibility),
			     updated_at = NOW()
			 WHERE id = $1 AND user_id = $2
			 RETURNING *`,
			[playlistId, userId, title, description, visibility],
		);
	}

	delete({ playlistId, userId }) {
		return this.one(
			`DELETE FROM playlists
			 WHERE id = $1 AND user_id = $2
			 RETURNING *`,
			[playlistId, userId],
		);
	}

	addSong({ playlistId, songId }) {
		return this.one(
			`INSERT INTO playlist_songs (playlist_id, song_id, position)
			 VALUES (
			 	$1,
			 	$2,
			 	COALESCE((SELECT MAX(position) + 1 FROM playlist_songs WHERE playlist_id = $1), 0)
			 )
			 ON CONFLICT (playlist_id, song_id) DO UPDATE
			 	SET position = playlist_songs.position
			 RETURNING *`,
			[playlistId, songId],
		);
	}

	removeSong({ playlistId, songId }) {
		return this.one(
			`DELETE FROM playlist_songs
			 WHERE playlist_id = $1 AND song_id = $2
			 RETURNING *`,
			[playlistId, songId],
		);
	}

	async reorderSongs({ playlistId, songIds }) {
		for (const [index, songId] of songIds.entries()) {
			await this.query(
				`UPDATE playlist_songs
				 SET position = $3
				 WHERE playlist_id = $1 AND song_id = $2`,
				[playlistId, songId, index],
			);
		}

		return true;
	}

	findSongIds(playlistId) {
		return this.many(
			`SELECT song_id
			 FROM playlist_songs
			 WHERE playlist_id = $1
			 ORDER BY position ASC, added_at ASC`,
			[playlistId],
		);
	}
}
