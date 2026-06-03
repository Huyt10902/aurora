import { BaseRepository } from "./base.repository.js";

export class RefreshTokenRepository extends BaseRepository {
	create({ userId, tokenHash, expiresAt }) {
		return this.one(
			`INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
			 VALUES ($1, $2, $3)
			 RETURNING *`,
			[userId, tokenHash, expiresAt]
		);
	}

	revoke(tokenHash) {
		return this.one(
			`UPDATE refresh_tokens
			 SET revoked_at = NOW()
			 WHERE token_hash = $1 AND revoked_at IS NULL
			 RETURNING *`,
			[tokenHash]
		);
	}

	findActive(tokenHash, userId) {
		return this.one(
			`SELECT *
			 FROM refresh_tokens
			 WHERE token_hash = $1
			   AND user_id = $2
			   AND revoked_at IS NULL
			   AND expires_at > NOW()`,
			[tokenHash, userId]
		);
	}
}
