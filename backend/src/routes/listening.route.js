import { Router } from "express";
import {
	getRecommendations,
	getRecentlyPlayed,
	recordPlay,
} from "../controller/listening.controller.js";
import { protectRoute, requireSubscription } from "../middleware/auth.middleware.js";

const router = Router();

// Record play yêu cầu subscription
router.post("/plays/:songId", protectRoute, requireSubscription, recordPlay);
router.use(protectRoute);
router.use(requireSubscription);
router.get("/recent", getRecentlyPlayed);
router.get("/recommendations", getRecommendations);

export default router;
