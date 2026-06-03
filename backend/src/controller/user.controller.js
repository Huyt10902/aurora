import { services } from "../services/index.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const query = typeof req.query.q === "string" ? req.query.q : "";
		res.status(200).json(await services.userService.getAllUsers(req.user._id, query));
	} catch (error) {
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const messages = await services.userService.getMessages(req.user._id, req.params.userId);
		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

export const markConversationRead = async (req, res, next) => {
	try {
		const messages = await services.userService.markConversationRead(
			req.user._id,
			req.params.userId,
		);
		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

export const getUnreadCounts = async (req, res, next) => {
	try {
		res.status(200).json(await services.userService.getUnreadCounts(req.user._id));
	} catch (error) {
		next(error);
	}
};

export const updateProfile = async (req, res, next) => {
	try {
		const uploadedAvatar = req.files?.avatarFile;
		const avatarFile = Array.isArray(uploadedAvatar)
			? uploadedAvatar[0]
			: uploadedAvatar;

		res.status(200).json(
			await services.userService.updateProfile({
				userId: req.user._id,
				fullName: req.body.fullName,
				avatarFile,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const updatePassword = async (req, res, next) => {
	try {
		await services.userService.updatePassword({
			userId: req.user._id,
			currentPassword: req.body.currentPassword,
			newPassword: req.body.newPassword,
		});
		res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		next(error);
	}
};

export const blockUser = async (req, res, next) => {
	try {
		await services.userService.blockUser(req.user._id, req.params.userId);
		res.status(200).json({ message: "User blocked successfully" });
	} catch (error) {
		next(error);
	}
};

export const unblockUser = async (req, res, next) => {
	try {
		await services.userService.unblockUser(req.user._id, req.params.userId);
		res.status(200).json({ message: "User unblocked successfully" });
	} catch (error) {
		next(error);
	}
};
