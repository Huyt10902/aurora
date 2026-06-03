import { serializeGenre } from "../lib/serializers.js";

export class GenreService {
	constructor({ genreRepository }) {
		this.genreRepository = genreRepository;
	}

	async getAllGenres() {
		const genres = await this.genreRepository.findAll();
		return genres.map(serializeGenre);
	}

	async createGenre(name) {
		const normalizedName = String(name || "").trim();
		if (!normalizedName) {
			const error = new Error("Genre name is required");
			error.status = 400;
			throw error;
		}

		const existingGenre = await this.genreRepository.findByName(normalizedName);
		const genre = existingGenre || (await this.genreRepository.create(normalizedName));
		return serializeGenre(genre);
	}

	async deleteGenre(id) {
		return this.genreRepository.delete(id);
	}
}
