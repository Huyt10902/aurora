import { hashPassword, verifyPassword } from "../lib/password.js";
import { deleteFromStorage, uploadToStorage } from "../lib/minio.js";
import { serializeMessage, serializeUser } from "../lib/serializers.js";

export class UserService {
	constructor({
		userRepository,
		messageRepository,
		friendshipRepository,
		mediaAssetRepository,
		blockRepository,
	}) {
		this.userRepository = userRepository;
		this.messageRepository = messageRepository;
		this.friendshipRepository = friendshipRepository;
		this.mediaAssetRepository = mediaAssetRepository;
		this.blockRepository = blockRepository;
	}

	async getAllUsers(currentUserId, query) {
		if (query && query.trim()) {
			const users = await this.userRepository.searchByTerm(currentUserId, query);
			return users.map(serializeUser);
		}

		const friends = await this.friendshipRepository.listFriends(currentUserId);
		return friends.map(serializeUser);
	}

	async getMessages(currentUserId, otherUserId) {
		const blocked = await this.blockRepository.findBetween(currentUserId, otherUserId);
		if (blocked) {
			const error = new Error("Conversation is blocked");
			error.status = 403;
			throw error;
		}

		const friendship = await this.friendshipRepository.areFriends(currentUserId, otherUserId);
		if (!friendship) {
			const error = new Error("You can only view messages with friends");
			error.status = 403;
			throw error;
		}

		const messages = await this.messageRepository.findConversation(currentUserId, otherUserId);
		return messages.map(serializeMessage);
	}

	async markConversationRead(currentUserId, otherUserId) {
		const blocked = await this.blockRepository.findBetween(currentUserId, otherUserId);
		if (blocked) {
			const error = new Error("Conversation is blocked");
			error.status = 403;
			throw error;
		}

		const friendship = await this.friendshipRepository.areFriends(
			currentUserId,
			otherUserId,
		);
		if (!friendship) {
			const error = new Error("You can only mark messages from friends");
			error.status = 403;
			throw error;
		}

		const messages = await this.messageRepository.markConversationRead({
			currentUserId,
			otherUserId,
		});
		return messages.map(serializeMessage);
	}

	async getUnreadCounts(currentUserId) {
		const rows = await this.messageRepository.countUnreadBySender(currentUserId);
		return rows.reduce((counts, row) => {
			counts[row.user_id] = row.unread_count;
			return counts;
		}, {});
	}

	async updateProfile({ userId, fullName, avatarFile }) {
		const currentUser = await this.userRepository.findById(userId);
		if (!currentUser) {
			const error = new Error("User not found");
			error.status = 404;
			throw error;
		}

		const normalizedFullName =
			fullName === undefined ? null : String(fullName || "").trim();
		if (normalizedFullName !== null && !normalizedFullName) {
			const error = new Error("Full name is required");
			error.status = 400;
			throw error;
		}

		let avatarAsset = null;
		if (avatarFile) {
			const upload = await uploadToStorage(avatarFile, "users/avatars");
			avatarAsset = await this.mediaAssetRepository.findOrCreate({
				provider: upload.provider,
				resourceType: upload.resourceType,
				url: upload.url,
				publicId: upload.publicId,
				originalName: avatarFile.name,
				mimeType: avatarFile.mimetype,
				sizeBytes: avatarFile.size,
				metadata: upload.metadata,
			});
		}

		const updatedUser = await this.userRepository.updateProfile({
			id: userId,
			fullName: normalizedFullName,
			avatarAssetId: avatarAsset?.id || null,
		});

		if (avatarAsset && currentUser.avatar_asset_id) {
			await this.deleteAvatarIfUnused(currentUser.avatar_asset_id);
		}

		return serializeUser(updatedUser);
	}

	async updatePassword({ userId, currentPassword, newPassword }) {
		const user = await this.userRepository.findById(userId);
		if (!user) {
			const error = new Error("User not found");
			error.status = 404;
			throw error;
		}

		const isValid = await verifyPassword(
			String(currentPassword || ""),
			user.password_hash,
		);
		if (!isValid) {
			const error = new Error("Current password is incorrect");
			error.status = 400;
			throw error;
		}

		const normalizedPassword = String(newPassword || "");
		if (normalizedPassword.length < 8) {
			const error = new Error("New password must be at least 8 characters");
			error.status = 400;
			throw error;
		}

		await this.userRepository.updatePassword({
			id: userId,
			passwordHash: await hashPassword(normalizedPassword),
		});
		return true;
	}

	async blockUser(currentUserId, targetUserId) {
		if (!targetUserId || currentUserId === targetUserId) {
			const error = new Error("Cannot block this user");
			error.status = 400;
			throw error;
		}

		await this.blockRepository.block({
			blockerUserId: currentUserId,
			blockedUserId: targetUserId,
		});
		return true;
	}

	async unblockUser(currentUserId, targetUserId) {
		await this.blockRepository.unblock({
			blockerUserId: currentUserId,
			blockedUserId: targetUserId,
		});
		return true;
	}

	async deleteAvatarIfUnused(assetId) {
		const asset = await this.mediaAssetRepository.findById(assetId);
		if (!asset) return;

		const deletedAsset = await this.mediaAssetRepository.deleteIfUnreferenced(assetId);
		if (deletedAsset?.public_id) {
			await deleteFromStorage({ publicId: deletedAsset.public_id });
		}
	}
}
