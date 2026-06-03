import { Router } from "express";
import {
	acceptFriendRequest,
	getFriendsOverview,
	rejectFriendRequest,
	removeFriend,
	sendFriendRequest,
} from "../controller/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.get("/", getFriendsOverview);
router.post("/requests/:userId", sendFriendRequest);
router.put("/requests/:userId/accept", acceptFriendRequest);
router.put("/requests/:userId/reject", rejectFriendRequest);
router.delete("/:userId", removeFriend);

export default router;
