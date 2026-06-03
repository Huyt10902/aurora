import { Router } from "express";
import { getSearchFilters, searchCatalog } from "../controller/search.controller.js";

const router = Router();

router.get("/filters", getSearchFilters);
router.get("/", searchCatalog);

export default router;
