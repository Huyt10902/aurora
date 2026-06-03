import { BaseRepository } from "./base.repository.js";

const userSelect = `
	SELECT u.*,
	       r.code AS role,
	       avatar.url AS image_url
	FROM users u
	JOIN roles r ON r.id = u.role_id
	LEFT JOIN media_assets avatar ON avatar.id = u.avatar_asset_id
`;

const friendshipUserSelect = `
	SELECT f.id AS friendship_id,
	       f.requester_user_id,
	       f.addressee_user_id,
	       f.status AS friendship_status,
	       f.responded_at,
	       f.created_at AS friendship_created_at,
	       f.updated_at AS friendship_updated_at,
	       u.*,
	       r.code AS role,
	       avatar.url AS image_url
	FROM friendships f
	JOIN users u ON u.id = CASE
		WHEN f.requester_user_id = $1 THEN f.addressee_user_id
		ELSE f.requester_user_id
	END
	JOIN roles r ON r.id = u.role_id
	LEFT JOIN media_assets avatar ON avatar.id = u.avatar_asset_id
`;

const excludeBlockedUsers = `
	AND NOT EXISTS (
		SELECT 1
		FROM user_blocks ub
		WHERE (ub.blocker_user_id = $1 AND ub.blocked_user_id = u.id)
		   OR (ub.blocker_user_id = u.id AND ub.blocked_user_id = $1)
	)
`;

export class FriendshipRepository extends BaseRepository {
	findBetween(firstUserId, secondUserId) {
		return this.one(
			`SELECT *
			 FROM friendships
			 WHERE (requester_user_id = $1 AND addressee_user_id = $2)
			    OR (requester_user_id = $2 AND addressee_user_id = $1)`,
			[firstUserId, secondUserId],
		);
	}

	areFriends(firstUserId, secondUserId) {
		return this.one(
			`SELECT 1
			 FROM friendships
			 WHERE status = 'accepted'
			   AND (
					(requester_user_id = $1 AND addressee_user_id = $2)
				 OR (requester_user_id = $2 AND addressee_user_id = $1)
			   )`,
			[firstUserId, secondUserId],
		);
	}

	createRequest({ requesterUserId, addresseeUserId }) {
		return this.one(
			`INSERT INTO friendships (requester_user_id, addressee_user_id, status)
			 VALUES ($1, $2, 'pending')
			 RETURNING *`,
			[requesterUserId, addresseeUserId],
		);
	}

	resetRequest({ friendshipId, requesterUserId, addresseeUserId }) {
		return this.one(
			`UPDATE friendships
			 SET requester_user_id = $2,
			     addressee_user_id = $3,
			     status = 'pending',
			     responded_at = NULL,
			     updated_at = NOW()
			 WHERE id = $1
			 RETURNING *`,
			[friendshipId, requesterUserId, addresseeUserId],
		);
	}

	acceptRequest({ requesterUserId, addresseeUserId }) {
		return this.one(
			`UPDATE friendships
			 SET status = 'accepted',
			     responded_at = NOW(),
			     updated_at = NOW()
			 WHERE requester_user_id = $1
			   AND addressee_user_id = $2
			   AND status = 'pending'
			 RETURNING *`,
			[requesterUserId, addresseeUserId],
		);
	}

	rejectRequest({ requesterUserId, addresseeUserId }) {
		return this.one(
			`UPDATE friendships
			 SET status = 'rejected',
			     responded_at = NOW(),
			     updated_at = NOW()
			 WHERE requester_user_id = $1
			   AND addressee_user_id = $2
			   AND status = 'pending'
			 RETURNING *`,
			[requesterUserId, addresseeUserId],
		);
	}

	removeBetween(firstUserId, secondUserId) {
		return this.one(
			`DELETE FROM friendships
			 WHERE (requester_user_id = $1 AND addressee_user_id = $2)
			    OR (requester_user_id = $2 AND addressee_user_id = $1)
			 RETURNING *`,
			[firstUserId, secondUserId],
		);
	}

	listFriends(userId) {
		return this.many(
			`${friendshipUserSelect}
			 WHERE f.status = 'accepted'
			   AND (f.requester_user_id = $1 OR f.addressee_user_id = $1)
			   ${excludeBlockedUsers}
			 ORDER BY u.full_name ASC`,
			[userId],
		);
	}

	listIncomingRequests(userId) {
		return this.many(
			`${friendshipUserSelect}
			 WHERE f.status = 'pending'
			   AND f.addressee_user_id = $1
			   ${excludeBlockedUsers}
			 ORDER BY f.created_at DESC`,
			[userId],
		);
	}

	listOutgoingRequests(userId) {
		return this.many(
			`${friendshipUserSelect}
			 WHERE f.status = 'pending'
			   AND f.requester_user_id = $1
			   ${excludeBlockedUsers}
			 ORDER BY f.created_at DESC`,
			[userId],
		);
	}

	listSuggestions(userId) {
		return this.many(
			`${userSelect}
			 WHERE u.id <> $1
			   ${excludeBlockedUsers}
			   AND NOT EXISTS (
					SELECT 1
					FROM friendships f
					WHERE f.status <> 'rejected'
					  AND (
							(f.requester_user_id = $1 AND f.addressee_user_id = u.id)
						 OR (f.requester_user_id = u.id AND f.addressee_user_id = $1)
					  )
			   )
			 ORDER BY u.full_name ASC`,
			[userId],
		);
	}
}
