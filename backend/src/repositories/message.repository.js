import { BaseRepository } from "./base.repository.js";

export class MessageRepository extends BaseRepository {
	create({ senderUserId, receiverUserId, content }) {
		return this.one(
			`INSERT INTO messages (sender_user_id, receiver_user_id, content)
			 VALUES ($1, $2, $3)
			 RETURNING *`,
			[senderUserId, receiverUserId, content]
		);
	}

	findConversation(userId, otherUserId) {
		return this.many(
			`SELECT *
			 FROM messages
			 WHERE (sender_user_id = $1 AND receiver_user_id = $2)
			    OR (sender_user_id = $2 AND receiver_user_id = $1)
			 ORDER BY created_at ASC`,
			[userId, otherUserId]
		);
	}

	markConversationRead({ currentUserId, otherUserId }) {
		return this.many(
			`UPDATE messages
			 SET read_at = COALESCE(read_at, NOW()),
			     updated_at = NOW()
			 WHERE sender_user_id = $2
			   AND receiver_user_id = $1
			   AND read_at IS NULL
			 RETURNING *`,
			[currentUserId, otherUserId],
		);
	}

	countUnreadBySender(userId) {
		return this.many(
			`SELECT sender_user_id AS user_id,
			        COUNT(*)::int AS unread_count
			 FROM messages
			 WHERE receiver_user_id = $1
			   AND read_at IS NULL
			 GROUP BY sender_user_id`,
			[userId],
		);
	}
}
