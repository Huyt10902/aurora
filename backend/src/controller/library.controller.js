import { services } from "../services/index.js";

export const getLikedSongs = async (req, res, next) => {
	try {
		res.status(200).json(await services.libraryService.getLikedSongs(req.user._id));
	} catch (error) {
		next(error);
	}
};

export const getLikedSongIds = async (req, res, next) => {
	try {
		res.status(200).json(await services.libraryService.getLikedSongIds(req.user._id));
	} catch (error) {
		next(error);
	}
};

export const likeSong = async (req, res, next) => {
	try {
		res.status(200).json(
			await services.libraryService.likeSong({
				userId: req.user._id,
				songId: req.params.songId,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const unlikeSong = async (req, res, next) => {
	try {
		await services.libraryService.unlikeSong({
			userId: req.user._id,
			songId: req.params.songId,
		});
		res.status(200).json({ message: "Song removed from library" });
	} catch (error) {
		next(error);
	}
};
