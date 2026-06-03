import { Router } from "express";
import {
	checkAdmin,
	classifySongAll,
	createAlbum,
	createCategory,
	createGenre,
	createSong,
	deleteAlbum,
	deleteCategory,
	deleteGenre,
	deleteSong,
	getCategories,
	getGenres,
	updateAlbum,
	updateSong,
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.put("/songs/:id", updateSong);
router.put("/songs/:id/classification", classifySongAll);
router.delete("/songs/:id", deleteSong);

router.post("/albums", createAlbum);
router.put("/albums/:id", updateAlbum);
router.delete("/albums/:id", deleteAlbum);

router.get("/genres", getGenres);
router.post("/genres", createGenre);
router.delete("/genres/:id", deleteGenre);

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
