import { BaseRepository } from "./base.repository.js";

export class BlockRepository extends BaseRepository {
	block({ blockerUserId, blockedUserId }) {
		return this.one(
			`INSERT INTO user_blocks (blocker_user_id, blocked_user_id)
			 VALUES ($1, $2)
			 ON CONFLICT (blocker_user_id, blocked_user_id) DO NOTHING
			 RETURNING *`,
			[blockerUserId, blockedUserId],
		);
	}

	unblock({ blockerUserId, blockedUserId }) {
		return this.one(
			`DELETE FROM user_blocks
			 WHERE blocker_user_id = $1 AND blocked_user_id = $2
			 RETURNING *`,
			[blockerUserId, blockedUserId],
		);
	}

	findBetween(firstUserId, secondUserId) {
		return this.one(
			`SELECT *
			 FROM user_blocks
			 WHERE (blocker_user_id = $1 AND blocked_user_id = $2)
			    OR (blocker_user_id = $2 AND blocked_user_id = $1)`,
			[firstUserId, secondUserId],
		);
	}

	listBlocked(userId) {
		return this.many(
			`SELECT blocked_user_id
			 FROM user_blocks
			 WHERE blocker_user_id = $1`,
			[userId],
		);
	}
}
