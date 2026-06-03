import { serializePlaylist, serializeSong } from "../lib/serializers.js";

const createError = (message, status = 400) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export class PlaylistService {
	constructor({ playlistRepository, songRepository }) {
		this.playlistRepository = playlistRepository;
		this.songRepository = songRepository;
	}

	async getPlaylists(userId) {
		const playlists = await this.playlistRepository.findByUser(userId);
		return playlists.map((playlist) => serializePlaylist(playlist, []));
	}

	async getPlaylist({ userId, playlistId }) {
		const playlist = await this.playlistRepository.findByIdForUser({
			playlistId,
			userId,
		});
		if (!playlist) throw createError("Playlist not found", 404);

		const songIds = await this.playlistRepository.findSongIds(playlistId);
		const songs = await Promise.all(
			songIds.map((row) => this.songRepository.findById(row.song_id)),
		);

		return serializePlaylist(playlist, songs.filter(Boolean).map(serializeSong));
	}

	async createPlaylist({ userId, title, description, visibility }) {
		const normalizedTitle = String(title || "").trim();
		if (!normalizedTitle) throw createError("Playlist title is required");

		const playlist = await this.playlistRepository.create({
			userId,
			title: normalizedTitle,
			description,
			visibility,
		});
		return serializePlaylist(playlist, []);
	}

	async updatePlaylist({ userId, playlistId, title, description, visibility }) {
		const normalizedTitle = title === undefined ? null : String(title).trim();
		if (title !== undefined && !normalizedTitle) {
			throw createError("Playlist title is required");
		}

		const playlist = await this.playlistRepository.update({
			playlistId,
			userId,
			title: normalizedTitle,
			description,
			visibility,
		});
		if (!playlist) throw createError("Playlist not found", 404);

		return await this.getPlaylist({ userId, playlistId });
	}

	async deletePlaylist({ userId, playlistId }) {
		const deleted = await this.playlistRepository.delete({ playlistId, userId });
		if (!deleted) throw createError("Playlist not found", 404);
		return true;
	}

	async addSong({ userId, playlistId, songId }) {
		const playlist = await this.playlistRepository.findByIdForUser({
			playlistId,
			userId,
		});
		if (!playlist) throw createError("Playlist not found", 404);

		const song = await this.songRepository.findById(songId);
		if (!song) throw createError("Song not found", 404);

		await this.playlistRepository.addSong({ playlistId, songId });
		return await this.getPlaylist({ userId, playlistId });
	}

	async removeSong({ userId, playlistId, songId }) {
		const playlist = await this.playlistRepository.findByIdForUser({
			playlistId,
			userId,
		});
		if (!playlist) throw createError("Playlist not found", 404);

		await this.playlistRepository.removeSong({ playlistId, songId });
		return await this.getPlaylist({ userId, playlistId });
	}

	async reorderSongs({ userId, playlistId, songIds }) {
		const playlist = await this.playlistRepository.findByIdForUser({
			playlistId,
			userId,
		});
		if (!playlist) throw createError("Playlist not found", 404);
		if (!Array.isArray(songIds)) throw createError("songIds must be an array");

		const currentSongIds = (await this.playlistRepository.findSongIds(playlistId)).map(
			(row) => row.song_id,
		);
		const uniqueSongIds = new Set(songIds);
		const hasSameSongs =
			uniqueSongIds.size === currentSongIds.length &&
			songIds.length === currentSongIds.length &&
			currentSongIds.every((songId) => uniqueSongIds.has(songId));

		if (!hasSameSongs) {
			throw createError("songIds must contain every playlist song exactly once");
		}

		await this.playlistRepository.reorderSongs({ playlistId, songIds });
		return await this.getPlaylist({ userId, playlistId });
	}
}
