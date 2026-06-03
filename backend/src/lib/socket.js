import { Server } from "socket.io";
import { verifyAccessToken } from "./tokens.js";
import { UserRepository } from "../repositories/user.repository.js";
import { services } from "../services/index.js";

const userRepository = new UserRepository();
export let ioServer = null;
export let userSockets = new Map();
export let userActivities = new Map();

export const getUserSockets = () => userSockets;

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: process.env.CLIENT_URL || "http://localhost:3000",
			credentials: true,
		},
	});

	ioServer = io;

	// reset maps for this server instance
	userSockets = new Map();
	userActivities = new Map();

	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth?.token;
			if (!token) return next(new Error("Unauthorized"));

			const payload = verifyAccessToken(token);
			const user = await userRepository.findById(payload.userId);
			if (!user) return next(new Error("Unauthorized"));

			socket.user = user;
			next();
		} catch (error) {
			next(new Error("Unauthorized"));
		}
	});

	io.on("connection", (socket) => {
		const userId = socket.user.id;

		userSockets.set(userId, socket.id);
		userActivities.set(userId, "Idle");

		io.emit("user_connected", userId);
		socket.emit("users_online", Array.from(userSockets.keys()));
		io.emit("activities", Array.from(userActivities.entries()));

		socket.on("update_activity", ({ activity }) => {
			userActivities.set(userId, activity || "Idle");
			io.emit("activity_updated", { userId, activity: activity || "Idle" });
		});

		socket.on("send_message", async (data) => {
			try {
				const receiverId = data.receiverId;
				const content = String(data.content || "").trim();
				if (!receiverId || !content) return;

				const message = await services.chatService.sendMessage({
					senderUserId: userId,
					receiverUserId: receiverId,
					content,
				});
				if (!message) return;
				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("typing_start", async ({ receiverId }) => {
			try {
				const canChat = await services.chatService.canChat(userId, receiverId);
				if (!canChat) return;

				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("typing_start", { userId });
				}
			} catch (error) {
				socket.emit("message_error", error.message);
			}
		});

		socket.on("typing_stop", async ({ receiverId }) => {
			try {
				const canChat = await services.chatService.canChat(userId, receiverId);
				if (!canChat) return;

				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("typing_stop", { userId });
				}
			} catch (error) {
				socket.emit("message_error", error.message);
			}
		});

		socket.on("mark_messages_read", async ({ senderId }) => {
			try {
				if (!senderId) return;
				const messages = await services.userService.markConversationRead(
					userId,
					senderId,
				);
				const senderSocketId = userSockets.get(senderId);
				if (senderSocketId) {
					io.to(senderSocketId).emit("messages_read", {
						by: userId,
						messageIds: messages.map((message) => message._id),
					});
				}
				socket.emit("messages_read_ack", {
					senderId,
					messageIds: messages.map((message) => message._id),
				});
			} catch (error) {
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", () => {
			userSockets.delete(userId);
			userActivities.delete(userId);
			io.emit("user_disconnected", userId);
		});
	});
};
