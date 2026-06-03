import { Router } from "express";
import {
	getRecommendations,
	getRecentlyPlayed,
	recordPlay,
} from "../controller/listening.controller.js";
import { optionalAuth, protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/plays/:songId", optionalAuth, recordPlay);
router.use(protectRoute);
router.get("/recent", getRecentlyPlayed);
router.get("/recommendations", getRecommendations);

export default router;
