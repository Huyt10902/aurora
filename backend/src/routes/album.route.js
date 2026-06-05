import { Router } from "express";
import { getAlbumById, getAllAlbums } from "../controller/album.controller.js";
import { protectRoute, requireSubscription } from "../middleware/auth.middleware.js";

const router = Router();

// Album routes yêu cầu đăng nhập và subscription
router.get("/", protectRoute, requireSubscription, getAllAlbums);
router.get("/:albumId", protectRoute, requireSubscription, getAlbumById);

export default router;
