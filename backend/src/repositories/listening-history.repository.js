import { BaseRepository } from "./base.repository.js";

export class ListeningHistoryRepository extends BaseRepository {
	recordPlay({ userId, songId }) {
		return this.one(
			`INSERT INTO user_song_plays (user_id, song_id)
			 VALUES ($1, $2)
			 RETURNING *`,
			[userId, songId],
		);
	}

	findRecentSongIds({ userId, limit = 20 }) {
		return this.many(
			`SELECT song_id, played_at
			 FROM (
			 	SELECT DISTINCT ON (song_id) song_id, played_at
			 	FROM user_song_plays
			 	WHERE user_id = $1
			 	ORDER BY song_id, played_at DESC
			 ) recent
			 ORDER BY played_at DESC
			 LIMIT $2`,
			[userId, limit],
		);
	}
}
