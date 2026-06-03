import { axiosInstance } from "@/lib/axios";
import { FriendsOverview, Friendship, Message, User } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

interface ChatStore {
	users: User[];
	incomingRequests: Friendship[];
	outgoingRequests: Friendship[];
	suggestedUsers: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	unreadCounts: Record<string, number>;
	typingUsers: Set<string>;
	messages: Message[];
	selectedUser: User | null;

	fetchUsers: () => Promise<void>;
	fetchUnreadCounts: () => Promise<void>;
	sendFriendRequest: (userId: string) => Promise<void>;
	acceptFriendRequest: (userId: string) => Promise<void>;
	rejectFriendRequest: (userId: string) => Promise<void>;
	removeFriend: (userId: string) => Promise<void>;
	blockUser: (userId: string) => Promise<void>;
	initSocket: (accessToken: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, content: string) => void;
	sendTypingStart: (receiverId: string) => void;
	sendTypingStop: (receiverId: string) => void;
	fetchMessages: (userId: string) => Promise<void>;
	markConversationRead: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, {
	autoConnect: false, // only connect if user is authenticated
	withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	incomingRequests: [],
	outgoingRequests: [],
	suggestedUsers: [],
	isLoading: false,
	error: null,
	socket: socket,
	isConnected: false,
	onlineUsers: new Set(),
	userActivities: new Map(),
	unreadCounts: {},
	typingUsers: new Set(),
	messages: [],
	selectedUser: null,

	setSelectedUser: (user) => set({ selectedUser: user }),

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get<FriendsOverview>("/friends");
			set({
				incomingRequests: response.data.incomingRequests,
				outgoingRequests: response.data.outgoingRequests,
				suggestedUsers: response.data.suggestions,
				users: response.data.friends.map((friendship) => friendship.user).filter(Boolean),
			});
			get().fetchUnreadCounts();
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchUnreadCounts: async () => {
		try {
			const response = await axiosInstance.get<Record<string, number>>("/users/messages/unread-counts");
			set({ unreadCounts: response.data });
		} catch {
			set({ unreadCounts: {} });
		}
	},

	sendFriendRequest: async (userId) => {
		try {
			await axiosInstance.post(`/friends/requests/${userId}`);
			toast.success("Friend request sent");
			await get().fetchUsers();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to send friend request");
		}
	},

	acceptFriendRequest: async (userId) => {
		try {
			await axiosInstance.put(`/friends/requests/${userId}/accept`);
			toast.success("Friend request accepted");
			await get().fetchUsers();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to accept friend request");
		}
	},

	rejectFriendRequest: async (userId) => {
		try {
			await axiosInstance.put(`/friends/requests/${userId}/reject`);
			toast.success("Friend request rejected");
			await get().fetchUsers();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to reject friend request");
		}
	},

	removeFriend: async (userId) => {
		try {
			await axiosInstance.delete(`/friends/${userId}`);
			set((state) => ({
				messages: state.selectedUser?._id === userId ? [] : state.messages,
				selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
			}));
			toast.success("Friend removed");
			await get().fetchUsers();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to remove friend");
		}
	},

	blockUser: async (userId) => {
		try {
			await axiosInstance.put(`/users/blocks/${userId}`);
			set((state) => ({
				messages: state.selectedUser?._id === userId ? [] : state.messages,
				selectedUser: state.selectedUser?._id === userId ? null : state.selectedUser,
				users: state.users.filter((user) => user._id !== userId),
				suggestedUsers: state.suggestedUsers.filter((user) => user._id !== userId),
				incomingRequests: state.incomingRequests.filter((request) => request.user._id !== userId),
				outgoingRequests: state.outgoingRequests.filter((request) => request.user._id !== userId),
			}));
			toast.success("User blocked");
			await get().fetchUsers();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to block user");
		}
	},

	initSocket: (accessToken) => {
		if (!get().isConnected) {
			socket.auth = { token: accessToken };
			socket.connect();

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("activities", (activities: [string, string][]) => {
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					return { onlineUsers: newOnlineUsers };
				});
			});

			socket.on("receive_message", (message: Message) => {
				const selectedUser = get().selectedUser;
				const belongsToOpenConversation =
					selectedUser &&
					(message.senderId === selectedUser._id || message.receiverId === selectedUser._id);

				if (belongsToOpenConversation) {
					set((state) => ({ messages: [...state.messages, message] }));
					get().markConversationRead(message.senderId);
					return;
				}

				set((state) => ({
					unreadCounts: {
						...state.unreadCounts,
						[message.senderId]: (state.unreadCounts[message.senderId] || 0) + 1,
					},
				}));
			});

			socket.on("message_sent", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			});

			socket.on("message_error", (message: string) => {
				toast.error(message);
				set({ error: message });
			});

			socket.on("typing_start", ({ userId }: { userId: string }) => {
				set((state) => ({
					typingUsers: new Set([...state.typingUsers, userId]),
				}));
			});

			socket.on("typing_stop", ({ userId }: { userId: string }) => {
				set((state) => {
					const typingUsers = new Set(state.typingUsers);
					typingUsers.delete(userId);
					return { typingUsers };
				});
			});

			socket.on("messages_read", ({ by, messageIds }: { by: string; messageIds: string[] }) => {
				const readAt = new Date().toISOString();
				set((state) => ({
					messages: state.messages.map((message) =>
						message.receiverId === by && messageIds.includes(message._id)
							? { ...message, readAt }
							: message,
					),
				}));
			});

			socket.on("messages_read_ack", ({ senderId }: { senderId: string; messageIds: string[] }) => {
				set((state) => ({
					unreadCounts: {
						...state.unreadCounts,
						[senderId]: 0,
					},
				}));
			});

			// Friend request lifecycle events
			socket.on("friend_request", () => {
				toast.success("You have a new friend request");
				get().fetchUsers();
			});

			socket.on("friend_request_accepted", () => {
				toast.success("Your friend request was accepted");
				get().fetchUsers();
			});

			socket.on("friend_request_rejected", () => {
				toast("Your friend request was rejected");
				get().fetchUsers();
			});

			socket.on("friend_removed", (payload: { by: string; target: string }) => {
				toast("A friend removed you");
				get().fetchUsers();
				set((state) => ({
					selectedUser: state.selectedUser?._id === payload.by ? null : state.selectedUser,
					messages: state.selectedUser?._id === payload.by ? [] : state.messages,
				}));
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			set({ isConnected: true });
			get().fetchUnreadCounts();
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.removeAllListeners();
			socket.disconnect();
			set({
				isConnected: false,
				onlineUsers: new Set(),
				typingUsers: new Set(),
				userActivities: new Map(),
			});
		}
	},

	sendMessage: async (receiverId, content) => {
		const socket = get().socket;
		if (!socket) return;

		socket.emit("send_message", { receiverId, content });
	},

	sendTypingStart: (receiverId) => {
		const socket = get().socket;
		if (socket?.connected) socket.emit("typing_start", { receiverId });
	},

	sendTypingStop: (receiverId) => {
		const socket = get().socket;
		if (socket?.connected) socket.emit("typing_stop", { receiverId });
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			set({ messages: response.data });
			await get().markConversationRead(userId);
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			set({ error: message, messages: [] });
			toast.error(message);
		} finally {
			set({ isLoading: false });
		}
	},

	markConversationRead: async (userId: string) => {
		set((state) => ({
			unreadCounts: {
				...state.unreadCounts,
				[userId]: 0,
			},
		}));

		const socket = get().socket;
		if (socket?.connected) {
			socket.emit("mark_messages_read", { senderId: userId });
			return;
		}

		try {
			await axiosInstance.put(`/users/messages/${userId}/read`);
		} catch {
			get().fetchUnreadCounts();
		}
	},
}));
