import { Router } from "express";
import {
  clearSongRating,
  createSongComment,
  deleteSongComment,
  getAllSongs,
  getFeaturedSongs,
  getMadeForYouSongs,
  getSongById,
  getTrendingSongs,
  rateSong,
} from "../controller/song.controller.js";
import { optionalAuth, protectRoute, requireSubscription } from "../middleware/auth.middleware.js";

const router = Router();

// Tất cả các route lấy danh sách bài hát đều yêu cầu subscription
router.get("/", protectRoute, requireSubscription, getAllSongs);
router.get("/featured", protectRoute, requireSubscription, getFeaturedSongs);
router.get("/made-for-you", protectRoute, requireSubscription, getMadeForYouSongs);
router.get("/trending", protectRoute, requireSubscription, getTrendingSongs);
router.get("/:songId", protectRoute, requireSubscription, getSongById);

// Rating và comments cũng yêu cầu subscription
router.put("/:songId/rating", protectRoute, requireSubscription, rateSong);
router.delete("/:songId/rating", protectRoute, requireSubscription, clearSongRating);
router.post("/:songId/comments", protectRoute, requireSubscription, createSongComment);
router.delete("/:songId/comments/:commentId", protectRoute, requireSubscription, deleteSongComment);

export default router;
