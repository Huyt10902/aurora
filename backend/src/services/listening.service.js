import { serializeSong } from "../lib/serializers.js";

export class ListeningService {
	constructor({ listeningHistoryRepository, songRepository }) {
		this.listeningHistoryRepository = listeningHistoryRepository;
		this.songRepository = songRepository;
	}

	async recordPlay({ userId, songId }) {
		const song = await this.songRepository.findById(songId);
		if (!song) {
			const error = new Error("Song not found");
			error.status = 404;
			throw error;
		}

		await this.listeningHistoryRepository.recordPlay({ userId, songId });
		return serializeSong(await this.songRepository.findById(songId));
	}

	async getRecentlyPlayed(userId) {
		const rows = await this.listeningHistoryRepository.findRecentSongIds({
			userId,
			limit: 20,
		});
		const songs = await Promise.all(
			rows.map((row) => this.songRepository.findById(row.song_id)),
		);
		return songs.filter(Boolean).map(serializeSong);
	}

	async getRecommendations(userId) {
		let songs = await this.songRepository.findRecommendedForUser({
			userId,
			limit: 12,
		});

		if (songs.length === 0) {
			songs = await this.songRepository.findFallbackRecommendations({
				userId,
				limit: 12,
			});
		}

		return songs.map(serializeSong);
	}
}
