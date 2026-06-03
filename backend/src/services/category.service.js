import { serializeCategory } from "../lib/serializers.js";

export class CategoryService {
	constructor({ categoryRepository }) {
		this.categoryRepository = categoryRepository;
	}

	async getAllCategories() {
		const categories = await this.categoryRepository.findAll();
		return categories.map(serializeCategory);
	}

	async createCategory({ name, description }) {
		const normalizedName = String(name || "").trim();
		const normalizedDescription = String(description || "").trim();

		if (!normalizedName) {
			const error = new Error("Category name is required");
			error.status = 400;
			throw error;
		}

		const existingCategory = await this.categoryRepository.findByName(normalizedName);
		const category = existingCategory
			? await this.categoryRepository.update({
					id: existingCategory.id,
					name: normalizedName,
					description: normalizedDescription,
				})
			: await this.categoryRepository.create({
				name: normalizedName,
				description: normalizedDescription,
			});

		return serializeCategory(category);
	}

	async deleteCategory(id) {
		return this.categoryRepository.delete(id);
	}
}
