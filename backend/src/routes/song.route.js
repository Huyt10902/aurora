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
import { optionalAuth, protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/:songId", optionalAuth, getSongById);
router.put("/:songId/rating", protectRoute, rateSong);
router.delete("/:songId/rating", protectRoute, clearSongRating);
router.post("/:songId/comments", protectRoute, createSongComment);
router.delete("/:songId/comments/:commentId", protectRoute, deleteSongComment);

export default router;
