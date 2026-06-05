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

// Cho phép xem danh sách nhạc mà không cần subscription
router.get("/", optionalAuth, getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/:songId", optionalAuth, getSongById);

// Rating và comments yêu cầu đăng nhập và subscription
router.put("/:songId/rating", protectRoute, requireSubscription, rateSong);
router.delete("/:songId/rating", protectRoute, requireSubscription, clearSongRating);
router.post("/:songId/comments", protectRoute, requireSubscription, createSongComment);
router.delete("/:songId/comments/:commentId", protectRoute, requireSubscription, deleteSongComment);

export default router;
