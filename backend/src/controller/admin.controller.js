import { services } from "../services/index.js";

export const createSong = async (req, res, next) => {
	try {
		const song = await services.adminService.createSong({
			...req.body,
			audioFile: req.files?.audioFile,
			imageFile: req.files?.imageFile,
		});

		res.status(201).json(song);
	} catch (error) {
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const deletedSong = await services.adminService.deleteSong(req.params.id);

		if (!deletedSong) {
			return res.status(404).json({ message: "Song not found" });
		}

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		next(error);
	}
};

export const updateSong = async (req, res, next) => {
	try {
		const song = await services.adminService.updateSong({
			id: req.params.id,
			...req.body,
			audioFile: req.files?.audioFile,
			imageFile: req.files?.imageFile,
		});

		res.status(200).json(song);
	} catch (error) {
		next(error);
	}
};

export const createAlbum = async (req, res, next) => {
	try {
		const album = await services.adminService.createAlbum({
			...req.body,
			imageFile: req.files?.imageFile,
		});

		res.status(201).json(album);
	} catch (error) {
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const deletedAlbum = await services.adminService.deleteAlbum(req.params.id);

		if (!deletedAlbum) {
			return res.status(404).json({ message: "Album not found" });
		}

		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		next(error);
	}
};

export const updateAlbum = async (req, res, next) => {
	try {
		const album = await services.adminService.updateAlbum({
			id: req.params.id,
			...req.body,
			imageFile: req.files?.imageFile,
		});

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};

export const checkAdmin = async (req, res) => {
	res.status(200).json({ admin: true });
};

export const getGenres = async (req, res, next) => {
	try {
		res.status(200).json(await services.genreService.getAllGenres());
	} catch (error) {
		next(error);
	}
};

export const createGenre = async (req, res, next) => {
	try {
		const genre = await services.genreService.createGenre(req.body.name);
		res.status(201).json(genre);
	} catch (error) {
		next(error);
	}
};

export const deleteGenre = async (req, res, next) => {
	try {
		const deletedGenre = await services.genreService.deleteGenre(req.params.id);
		if (!deletedGenre) {
			return res.status(404).json({ message: "Genre not found" });
		}

		res.status(200).json({ message: "Genre deleted successfully" });
	} catch (error) {
		next(error);
	}
};

export const getCategories = async (req, res, next) => {
	try {
		res.status(200).json(await services.categoryService.getAllCategories());
	} catch (error) {
		next(error);
	}
};

export const createCategory = async (req, res, next) => {
	try {
		const category = await services.categoryService.createCategory(req.body);
		res.status(201).json(category);
	} catch (error) {
		next(error);
	}
};

export const deleteCategory = async (req, res, next) => {
	try {
		const deletedCategory = await services.categoryService.deleteCategory(req.params.id);
		if (!deletedCategory) {
			return res.status(404).json({ message: "Category not found" });
		}

		res.status(200).json({ message: "Category deleted successfully" });
	} catch (error) {
		next(error);
	}
};

export const classifySongAll = async (req, res, next) => {
	try {
		const song = await services.adminService.classifySong({
			songId: req.params.id,
			genreIds: req.body.genreIds || [],
			categoryIds: req.body.categoryIds || [],
		});
		res.status(200).json(song);
	} catch (error) {
		next(error);
	}
};
