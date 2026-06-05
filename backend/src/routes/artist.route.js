import { Router } from "express";
import { getArtistById } from "../controller/artist.controller.js";
import { protectRoute, requireSubscription } from "../middleware/auth.middleware.js";

const router = Router();

// Artist routes yêu cầu đăng nhập và subscription
router.get("/:artistId", protectRoute, requireSubscription, getArtistById);

export default router;
