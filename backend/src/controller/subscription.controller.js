import { services } from "../services/index.js";

export const getPlans = async (req, res, next) => {
	try {
		res.json(await services.subscriptionService.getPlans());
	} catch (error) {
		next(error);
	}
};

export const getCurrentSubscription = async (req, res, next) => {
	try {
		res.json(await services.subscriptionService.getCurrent(req.user._id));
	} catch (error) {
		next(error);
	}
};

export const createCheckout = async (req, res, next) => {
	try {
		res.status(201).json(
			await services.subscriptionService.createCheckout({
				userId: req.user._id,
				planCode: req.body.planCode,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const confirmMockPayment = async (req, res, next) => {
	try {
		res.json(
			await services.subscriptionService.confirmMockPayment({
				userId: req.user._id,
				orderId: req.params.orderId,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const cancelSubscription = async (req, res, next) => {
	try {
		res.json(await services.subscriptionService.cancel(req.user._id));
	} catch (error) {
		next(error);
	}
};
