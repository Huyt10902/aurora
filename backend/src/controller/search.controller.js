import { services } from "../services/index.js";

export const searchCatalog = async (req, res, next) => {
	try {
		res.status(200).json(
			await services.musicService.searchCatalog({
				query: typeof req.query.q === "string" ? req.query.q : "",
				genreId: typeof req.query.genreId === "string" ? req.query.genreId : null,
				categoryId:
					typeof req.query.categoryId === "string" ? req.query.categoryId : null,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const getSearchFilters = async (req, res, next) => {
	try {
		const [genres, categories] = await Promise.all([
			services.genreService.getAllGenres(),
			services.categoryService.getAllCategories(),
		]);
		res.status(200).json({ genres, categories });
	} catch (error) {
		next(error);
	}
};
