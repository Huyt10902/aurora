import { Router } from "express";
import { getArtistById } from "../controller/artist.controller.js";

const router = Router();

// Cho phép xem artist mà không cần subscription
router.get("/:artistId", getArtistById);

export default router;
