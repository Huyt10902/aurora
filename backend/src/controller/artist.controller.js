import { services } from "../services/index.js";

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
