import { BaseRepository } from "./base.repository.js";

export class MediaAssetRepository extends BaseRepository {
	findById(id) {
		return this.one("SELECT * FROM media_assets WHERE id = $1", [id]);
	}

	findByUrl(url) {
		return this.one("SELECT * FROM media_assets WHERE url = $1", [url]);
	}

	async findOrCreate({ provider, resourceType, url, publicId = null, originalName = null, mimeType = null, sizeBytes = null, metadata = {} }) {
		const existing = await this.findByUrl(url);
		if (existing) return existing;

		return this.one(
			`INSERT INTO media_assets (provider, resource_type, url, public_id, original_name, mime_type, size_bytes, metadata)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING *`,
			[provider, resourceType, url, publicId, originalName, mimeType, sizeBytes, metadata]
		);
	}

	deleteIfUnreferenced(id) {
		return this.one(
			`DELETE FROM media_assets ma
			 WHERE ma.id = $1
			   AND NOT EXISTS (SELECT 1 FROM songs WHERE audio_asset_id = ma.id OR cover_asset_id = ma.id)
			   AND NOT EXISTS (SELECT 1 FROM albums WHERE cover_asset_id = ma.id)
			   AND NOT EXISTS (SELECT 1 FROM playlists WHERE cover_asset_id = ma.id)
			   AND NOT EXISTS (SELECT 1 FROM artists WHERE image_asset_id = ma.id)
			   AND NOT EXISTS (SELECT 1 FROM users WHERE avatar_asset_id = ma.id)
			 RETURNING *`,
			[id],
		);
	}
}
