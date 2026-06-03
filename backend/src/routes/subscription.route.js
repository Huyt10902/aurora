import { Router } from "express";
import {
	cancelSubscription,
	confirmMockPayment,
	createCheckout,
	getCurrentSubscription,
	getPlans,
} from "../controller/subscription.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/plans", getPlans);
router.get("/me", protectRoute, getCurrentSubscription);
router.post("/checkout", protectRoute, createCheckout);
router.post("/orders/:orderId/mock-confirm", protectRoute, confirmMockPayment);
router.post("/cancel", protectRoute, cancelSubscription);

export default router;
