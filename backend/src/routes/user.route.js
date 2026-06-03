import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	blockUser,
	getAllUsers,
	getMessages,
	getUnreadCounts,
	markConversationRead,
	unblockUser,
	updatePassword,
	updateProfile,
} from "../controller/user.controller.js";
const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/unread-counts", protectRoute, getUnreadCounts);
router.get("/messages/:userId", protectRoute, getMessages);
router.put("/messages/:userId/read", protectRoute, markConversationRead);
router.put("/me/profile", protectRoute, updateProfile);
router.put("/me/password", protectRoute, updatePassword);
router.put("/blocks/:userId", protectRoute, blockUser);
router.delete("/blocks/:userId", protectRoute, unblockUser);

export default router;
