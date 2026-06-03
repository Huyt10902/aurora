import { Router } from "express";
import {
	getLikedSongIds,
	getLikedSongs,
	likeSong,
	unlikeSong,
} from "../controller/library.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.get("/liked", getLikedSongs);
router.get("/liked/ids", getLikedSongIds);
router.put("/liked/:songId", likeSong);
router.delete("/liked/:songId", unlikeSong);

export default router;
