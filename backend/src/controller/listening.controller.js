import { services } from "../services/index.js";

export const recordPlay = async (req, res, next) => {
	try {
		res.status(201).json(
			await services.listeningService.recordPlay({
				userId: req.user?._id || null,
				songId: req.params.songId,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const getRecentlyPlayed = async (req, res, next) => {
	try {
		res.status(200).json(await services.listeningService.getRecentlyPlayed(req.user._id));
	} catch (error) {
		next(error);
	}
};

export const getRecommendations = async (req, res, next) => {
	try {
		res.status(200).json(await services.listeningService.getRecommendations(req.user._id));
	} catch (error) {
		next(error);
	}
};
