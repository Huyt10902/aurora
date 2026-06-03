import { BaseRepository } from "./base.repository.js";

export class LibraryRepository extends BaseRepository {
	findLikedSongIds(userId) {
		return this.many(
			`SELECT song_id
			 FROM user_liked_songs
			 WHERE user_id = $1
			 ORDER BY created_at DESC`,
			[userId],
		);
	}

	isLiked({ userId, songId }) {
		return this.one(
			`SELECT 1
			 FROM user_liked_songs
			 WHERE user_id = $1 AND song_id = $2`,
			[userId, songId],
		);
	}

	likeSong({ userId, songId }) {
		return this.one(
			`INSERT INTO user_liked_songs (user_id, song_id)
			 VALUES ($1, $2)
			 ON CONFLICT (user_id, song_id) DO NOTHING
			 RETURNING *`,
			[userId, songId],
		);
	}

	unlikeSong({ userId, songId }) {
		return this.one(
			`DELETE FROM user_liked_songs
			 WHERE user_id = $1 AND song_id = $2
			 RETURNING *`,
			[userId, songId],
		);
	}
}
