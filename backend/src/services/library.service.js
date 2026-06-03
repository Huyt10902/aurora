import { serializeSong } from "../lib/serializers.js";

const createError = (message, status = 400) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export class LibraryService {
	constructor({ libraryRepository, songRepository }) {
		this.libraryRepository = libraryRepository;
		this.songRepository = songRepository;
	}

	async getLikedSongs(userId) {
		const likedRows = await this.libraryRepository.findLikedSongIds(userId);
		const songs = await Promise.all(
			likedRows.map((row) => this.songRepository.findById(row.song_id)),
		);
		return songs.filter(Boolean).map(serializeSong);
	}

	async getLikedSongIds(userId) {
		const likedRows = await this.libraryRepository.findLikedSongIds(userId);
		return likedRows.map((row) => row.song_id);
	}

	async likeSong({ userId, songId }) {
		const song = await this.songRepository.findById(songId);
		if (!song) throw createError("Song not found", 404);

		await this.libraryRepository.likeSong({ userId, songId });
		return serializeSong(song);
	}

	async unlikeSong({ userId, songId }) {
		await this.libraryRepository.unlikeSong({ userId, songId });
		return true;
	}
}
