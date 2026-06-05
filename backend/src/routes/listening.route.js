import { Router } from "express";
import {
	getRecommendations,
	getRecentlyPlayed,
	recordPlay,
} from "../controller/listening.controller.js";
import { protectRoute, requireSubscription } from "../middleware/auth.middleware.js";

const router = Router();

// Record play YÊU CẦU subscription - đây là action chính
router.post("/plays/:songId", protectRoute, requireSubscription, recordPlay);

// Recent và recommendations yêu cầu đăng nhập và subscription
router.use(protectRoute);
router.use(requireSubscription);
router.get("/recent", getRecentlyPlayed);
router.get("/recommendations", getRecommendations);

export default router;
