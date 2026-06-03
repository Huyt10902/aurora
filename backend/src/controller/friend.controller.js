import { services } from "../services/index.js";
import { ioServer, getUserSockets } from "../lib/socket.js";

export const getFriendsOverview = async (req, res, next) => {
	try {
		res.status(200).json(await services.friendService.getOverview(req.user._id));
	} catch (error) {
		next(error);
	}
};

export const sendFriendRequest = async (req, res, next) => {
	try {
		const friendship = await services.friendService.sendRequest(
			req.user._id,
			req.params.userId,
		);

		// Emit real-time notification to addressee if they're online
		try {
			const userSockets = getUserSockets();
			const socketId = userSockets.get(req.params.userId);
			if (ioServer && socketId) {
				ioServer.to(socketId).emit("friend_request", friendship);
			}
		} catch (e) {
			console.warn("Failed to emit friend_request event", e);
		}

		res.status(201).json(friendship);
	} catch (error) {
		next(error);
	}
};

export const acceptFriendRequest = async (req, res, next) => {
	try {
		const friendship = await services.friendService.acceptRequest(
			req.user._id,
			req.params.userId,
		);

		// Notify requester that their request was accepted
		try {
			const userSockets = getUserSockets();
			const socketId = userSockets.get(req.params.userId);
			if (ioServer && socketId) {
				ioServer.to(socketId).emit("friend_request_accepted", friendship);
			}
		} catch (e) {
			console.warn("Failed to emit friend_request_accepted event", e);
		}

		res.status(200).json(friendship);
	} catch (error) {
		next(error);
	}
};

export const rejectFriendRequest = async (req, res, next) => {
	try {
		const friendship = await services.friendService.rejectRequest(
			req.user._id,
			req.params.userId,
		);

		// Notify requester that their request was rejected
		try {
			const userSockets = getUserSockets();
			const socketId = userSockets.get(req.params.userId);
			if (ioServer && socketId) {
				ioServer.to(socketId).emit("friend_request_rejected", friendship);
			}
		} catch (e) {
			console.warn("Failed to emit friend_request_rejected event", e);
		}

		res.status(200).json(friendship);
	} catch (error) {
		next(error);
	}
};

export const removeFriend = async (req, res, next) => {
	try {
		await services.friendService.removeFriend(req.user._id, req.params.userId);

		// Notify target user if online
		try {
			const userSockets = getUserSockets();
			const socketId = userSockets.get(req.params.userId);
			if (ioServer && socketId) {
				ioServer.to(socketId).emit("friend_removed", {
					by: req.user._id,
					target: req.params.userId,
				});
			}
		} catch (e) {
			console.warn("Failed to emit friend_removed event", e);
		}

		res.status(200).json({ message: "Friend removed successfully" });
	} catch (error) {
		next(error);
	}
};
