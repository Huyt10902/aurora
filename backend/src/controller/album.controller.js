import { services } from "../services/index.js";

export const getAllAlbums = async (req, res, next) => {
	try {
		res.status(200).json(await services.musicService.getAllAlbums());
	} catch (error) {
		next(error);
	}
};

export const getAlbumById = async (req, res, next) => {
	try {
		const album = await services.musicService.getAlbumById(req.params.albumId);

		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};
