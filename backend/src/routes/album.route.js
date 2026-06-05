import { Router } from "express";
import { getAlbumById, getAllAlbums } from "../controller/album.controller.js";

const router = Router();

// Cho phép xem albums mà không cần subscription
router.get("/", getAllAlbums);
router.get("/:albumId", getAlbumById);

export default router;
