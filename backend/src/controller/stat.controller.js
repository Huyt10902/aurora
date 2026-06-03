import { services } from "../services/index.js";

export const getStats = async (req, res, next) => {
	try {
		res.status(200).json(await services.statsService.getDashboardStats());
	} catch (error) {
		next(error);
	}
};
