import { BaseRepository } from "./base.repository.js";

export class StatsRepository extends BaseRepository {
	getDashboardStats() {
		return this.one(
			`SELECT
				(SELECT COUNT(*)::int FROM songs) AS total_songs,
				(SELECT COUNT(*)::int FROM albums) AS total_albums,
				(SELECT COUNT(*)::int FROM users) AS total_users,
				(SELECT COUNT(*)::int FROM artists) AS total_artists,
				(SELECT COUNT(*)::int FROM user_song_plays) AS total_plays`
		);
	}
}
