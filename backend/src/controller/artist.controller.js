import { services } from "../services/index.js";

export const getAllArtists = async (req, res, next) => {
	try {
		const artists = await services.musicService.getAllArtists();
		res.status(200).json(artists);
	} catch (error) {
		next(error);
	}
};

export const getArtistById = async (req, res, next) => {
	try {
		const artist = await services.musicService.getArtistById(req.params.artistId);

		if (!artist) {
			return res.status(404).json({ message: "Artist not found" });
		}

		res.status(200).json(artist);
	} catch (error) {
		next(error);
	}
};
