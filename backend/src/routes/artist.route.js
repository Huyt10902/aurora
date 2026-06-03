import { Router } from "express";
import { getArtistById } from "../controller/artist.controller.js";

const router = Router();

router.get("/:artistId", getArtistById);

export default router;
