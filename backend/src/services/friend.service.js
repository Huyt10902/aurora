import { serializeFriendship, serializeUser } from "../lib/serializers.js";

const createError = (message, status = 400) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export class FriendService {
	constructor({ friendshipRepository, userRepository, blockRepository }) {
		this.friendshipRepository = friendshipRepository;
		this.userRepository = userRepository;
		this.blockRepository = blockRepository;
	}

	async getOverview(currentUserId) {
		const [friends, incomingRequests, outgoingRequests, suggestions] =
			await Promise.all([
				this.friendshipRepository.listFriends(currentUserId),
				this.friendshipRepository.listIncomingRequests(currentUserId),
				this.friendshipRepository.listOutgoingRequests(currentUserId),
				this.friendshipRepository.listSuggestions(currentUserId),
			]);

		return {
			friends: friends.map(serializeFriendship),
			incomingRequests: incomingRequests.map(serializeFriendship),
			outgoingRequests: outgoingRequests.map(serializeFriendship),
			suggestions: suggestions.map(serializeUser),
		};
	}

	async getFriends(currentUserId) {
		const friends = await this.friendshipRepository.listFriends(currentUserId);
		return friends.map((friendship) => serializeFriendship(friendship).user);
	}

	async sendRequest(currentUserId, targetUserId) {
		if (!targetUserId || currentUserId === targetUserId) {
			throw createError("Cannot send a friend request to this user");
		}

		const targetUser = await this.userRepository.findById(targetUserId);
		if (!targetUser) {
			throw createError("User not found", 404);
		}

		const blocked = await this.blockRepository.findBetween(
			currentUserId,
			targetUserId,
		);
		if (blocked) {
			throw createError("Cannot send a request to this user", 403);
		}

		const existing = await this.friendshipRepository.findBetween(
			currentUserId,
			targetUserId,
		);

		if (!existing) {
			return serializeFriendship(
				await this.friendshipRepository.createRequest({
					requesterUserId: currentUserId,
					addresseeUserId: targetUserId,
				}),
			);
		}

		if (existing.status === "accepted") {
			return serializeFriendship(existing);
		}

		if (
			existing.status === "pending" &&
			existing.addressee_user_id === currentUserId
		) {
			return await this.acceptRequest(currentUserId, targetUserId);
		}

		if (
			existing.status === "pending" &&
			existing.requester_user_id === currentUserId
		) {
			return serializeFriendship(existing);
		}

		return serializeFriendship(
			await this.friendshipRepository.resetRequest({
				friendshipId: existing.id,
				requesterUserId: currentUserId,
				addresseeUserId: targetUserId,
			}),
		);
	}

	async acceptRequest(currentUserId, requesterUserId) {
		const friendship = await this.friendshipRepository.acceptRequest({
			requesterUserId,
			addresseeUserId: currentUserId,
		});

		if (!friendship) {
			throw createError("Friend request not found", 404);
		}

		return serializeFriendship(friendship);
	}

	async rejectRequest(currentUserId, requesterUserId) {
		const friendship = await this.friendshipRepository.rejectRequest({
			requesterUserId,
			addresseeUserId: currentUserId,
		});

		if (!friendship) {
			throw createError("Friend request not found", 404);
		}

		return serializeFriendship(friendship);
	}

	async removeFriend(currentUserId, targetUserId) {
		const friendship = await this.friendshipRepository.removeBetween(
			currentUserId,
			targetUserId,
		);

		if (!friendship) {
			throw createError("Friendship not found", 404);
		}

		return true;
	}
}
