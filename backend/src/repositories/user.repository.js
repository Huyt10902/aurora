import { BaseRepository } from "./base.repository.js";

const userSelect = `
	SELECT u.*,
	       r.code AS role,
	       avatar.url AS image_url
	FROM users u
	JOIN roles r ON r.id = u.role_id
	LEFT JOIN media_assets avatar ON avatar.id = u.avatar_asset_id
`;

export class UserRepository extends BaseRepository {
	findById(id) {
		return this.one(`${userSelect} WHERE u.id = $1`, [id]);
	}

	findByIdentifier(identifier) {
		return this.one(`${userSelect} WHERE u.email = $1 OR u.username = $1`, [identifier]);
	}

	listExcept(userId) {
		return this.many(`${userSelect} WHERE u.id <> $1 ORDER BY u.full_name ASC`, [userId]);
	}

	searchByTerm(userId, term) {
		const searchTerm = `%${term.trim().toLowerCase()}%`;
		return this.many(
			`${userSelect}
			 WHERE u.id <> $1
			   AND (
				 LOWER(u.full_name) LIKE $2
				 OR LOWER(u.username) LIKE $2
			   )
			 ORDER BY u.full_name ASC`,
			[userId, searchTerm],
		);
	}

	updateProfile({ id, fullName, avatarAssetId }) {
		return this.one(
			`WITH updated AS (
				UPDATE users
				SET full_name = COALESCE($2, full_name),
				    avatar_asset_id = COALESCE($3, avatar_asset_id),
				    updated_at = NOW()
				WHERE id = $1
				RETURNING *
			)
			SELECT updated.*, r.code AS role, avatar.url AS image_url
			FROM updated
			JOIN roles r ON r.id = updated.role_id
			LEFT JOIN media_assets avatar ON avatar.id = updated.avatar_asset_id`,
			[id, fullName, avatarAssetId],
		);
	}

	updatePassword({ id, passwordHash }) {
		return this.one(
			`UPDATE users
			 SET password_hash = $2,
			     updated_at = NOW()
			 WHERE id = $1
			 RETURNING *`,
			[id, passwordHash],
		);
	}

	create({ username, email, passwordHash, fullName, avatarAssetId, roleId }) {
		return this.one(
			`WITH inserted AS (
				INSERT INTO users (username, email, password_hash, full_name, avatar_asset_id, role_id)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING *
			)
			SELECT inserted.*, r.code AS role, avatar.url AS image_url
			FROM inserted
			JOIN roles r ON r.id = inserted.role_id
			LEFT JOIN media_assets avatar ON avatar.id = inserted.avatar_asset_id`,
			[username, email, passwordHash, fullName, avatarAssetId, roleId]
		);
	}
}
