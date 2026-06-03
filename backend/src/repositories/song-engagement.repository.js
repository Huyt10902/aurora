import { BaseRepository } from "./base.repository.js";

export class SongEngagementRepository extends BaseRepository {
	findRatingSummary({ songId, userId = null }) {
		return this.one(
			`SELECT COALESCE(ROUND(AVG(rating)::numeric, 1)::float, 0) AS average_rating,
			        COUNT(*)::int AS rating_count,
			        MAX(rating) FILTER (WHERE user_id = $2::uuid) AS user_rating
			 FROM song_ratings
			 WHERE song_id = $1`,
			[songId, userId],
		);
	}

	upsertRating({ userId, songId, rating }) {
		return this.one(
			`INSERT INTO song_ratings (user_id, song_id, rating)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (user_id, song_id)
			 DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
			 RETURNING *`,
			[userId, songId, rating],
		);
	}

	deleteRating({ userId, songId }) {
		return this.one(
			`DELETE FROM song_ratings
			 WHERE user_id = $1 AND song_id = $2
			 RETURNING *`,
			[userId, songId],
		);
	}

	findComments(songId) {
		return this.many(
			`SELECT comment.id,
			        comment.song_id,
			        comment.content,
			        comment.created_at,
			        comment.updated_at,
			        user_account.id AS user_id,
			        user_account.username,
			        user_account.full_name,
			        avatar.url AS image_url
			 FROM song_comments comment
			 JOIN users user_account ON user_account.id = comment.user_id
			 LEFT JOIN media_assets avatar ON avatar.id = user_account.avatar_asset_id
			 WHERE comment.song_id = $1
			 ORDER BY comment.created_at DESC`,
			[songId],
		);
	}

	createComment({ userId, songId, content }) {
		return this.one(
			`INSERT INTO song_comments (user_id, song_id, content)
			 VALUES ($1, $2, $3)
			 RETURNING *`,
			[userId, songId, content],
		);
	}

	deleteComment({ commentId, songId, userId, isAdmin = false }) {
		return this.one(
			`DELETE FROM song_comments
			 WHERE id = $1
			   AND song_id = $2
			   AND (user_id = $3 OR $4::boolean = true)
			 RETURNING *`,
			[commentId, songId, userId, isAdmin],
		);
	}
}
