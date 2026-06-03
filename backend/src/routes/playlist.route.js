import { Router } from "express";
import {
	addSongToPlaylist,
	createPlaylist,
	deletePlaylist,
	getPlaylistById,
	getPlaylists,
	removeSongFromPlaylist,
	reorderPlaylistSongs,
	updatePlaylist,
} from "../controller/playlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.get("/", getPlaylists);
router.post("/", createPlaylist);
router.get("/:playlistId", getPlaylistById);
router.put("/:playlistId", updatePlaylist);
router.delete("/:playlistId", deletePlaylist);
router.put("/:playlistId/songs/:songId", addSongToPlaylist);
router.delete("/:playlistId/songs/:songId", removeSongFromPlaylist);
router.put("/:playlistId/songs", reorderPlaylistSongs);

export default router;
