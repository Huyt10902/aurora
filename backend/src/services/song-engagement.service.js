import {
	serializeSong,
	serializeSongComment,
	serializeSongRatingSummary,
} from "../lib/serializers.js";

const normalizeRating = (value) => {
	const rating = Number(value);
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		const error = new Error("Rating must be an integer from 1 to 5");
		error.status = 400;
		throw error;
	}
	return rating;
};

const normalizeComment = (value) => {
	const content = String(value || "").trim();
	if (!content) {
		const error = new Error("Comment cannot be empty");
		error.status = 400;
		throw error;
	}
	if (content.length > 1000) {
		const error = new Error("Comment must be 1000 characters or fewer");
		error.status = 400;
		throw error;
	}
	return content;
};

export class SongEngagementService {
	constructor({ songRepository, songEngagementRepository }) {
		this.songRepository = songRepository;
		this.songEngagementRepository = songEngagementRepository;
	}

	async getSongDetail({ songId, userId = null }) {
		const song = await this.songRepository.findById(songId);
		if (!song) {
			const error = new Error("Song not found");
			error.status = 404;
			throw error;
		}

		const [rating, comments] = await Promise.all([
			this.songEngagementRepository.findRatingSummary({ songId, userId }),
			this.songEngagementRepository.findComments(songId),
		]);

		return {
			song: serializeSong(song),
			rating: serializeSongRatingSummary(rating),
			comments: comments.map(serializeSongComment),
		};
	}

	async rateSong({ userId, songId, rating }) {
		await this.ensureSongExists(songId);
		await this.songEngagementRepository.upsertRating({
			userId,
			songId,
			rating: normalizeRating(rating),
		});
		return this.getSongDetail({ songId, userId });
	}

	async clearRating({ userId, songId }) {
		await this.songEngagementRepository.deleteRating({ userId, songId });
		return this.getSongDetail({ songId, userId });
	}

	async createComment({ userId, songId, content }) {
		await this.ensureSongExists(songId);
		await this.songEngagementRepository.createComment({
			userId,
			songId,
			content: normalizeComment(content),
		});
		return this.getSongDetail({ songId, userId });
	}

	async deleteComment({ userId, isAdmin, songId, commentId }) {
		const deleted = await this.songEngagementRepository.deleteComment({
			commentId,
			songId,
			userId,
			isAdmin,
		});

		if (!deleted) {
			const error = new Error("Comment not found or you do not have permission to delete it");
			error.status = 404;
			throw error;
		}

		return this.getSongDetail({ songId, userId });
	}

	async ensureSongExists(songId) {
		const song = await this.songRepository.findById(songId);
		if (!song) {
			const error = new Error("Song not found");
			error.status = 404;
			throw error;
		}
	}
}
