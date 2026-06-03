import { services } from "../services/index.js";

export const getAllSongs = async (req, res, next) => {
	try {
		const query = typeof req.query.q === "string" ? req.query.q : "";
		const genreId = typeof req.query.genreId === "string" ? req.query.genreId : null;
		const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : null;

		res.json(await services.musicService.getAllSongs({ query, genreId, categoryId }));
	} catch (error) {
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
	try {
		res.json(await services.musicService.getRandomSongs(6));
	} catch (error) {
		next(error);
	}
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		res.json(await services.musicService.getRandomSongs(4));
	} catch (error) {
		next(error);
	}
};

export const getTrendingSongs = async (req, res, next) => {
	try {
		res.json(await services.musicService.getTrendingSongs(4));
	} catch (error) {
		next(error);
	}
};

export const getSongById = async (req, res, next) => {
	try {
		res.json(
			await services.songEngagementService.getSongDetail({
				songId: req.params.songId,
				userId: req.user?._id || null,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const rateSong = async (req, res, next) => {
	try {
		res.json(
			await services.songEngagementService.rateSong({
				userId: req.user._id,
				songId: req.params.songId,
				rating: req.body.rating,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const clearSongRating = async (req, res, next) => {
	try {
		res.json(
			await services.songEngagementService.clearRating({
				userId: req.user._id,
				songId: req.params.songId,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const createSongComment = async (req, res, next) => {
	try {
		res.status(201).json(
			await services.songEngagementService.createComment({
				userId: req.user._id,
				songId: req.params.songId,
				content: req.body.content,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const deleteSongComment = async (req, res, next) => {
	try {
		res.json(
			await services.songEngagementService.deleteComment({
				userId: req.user._id,
				isAdmin: req.user.isAdmin,
				songId: req.params.songId,
				commentId: req.params.commentId,
			}),
		);
	} catch (error) {
		next(error);
	}
};
