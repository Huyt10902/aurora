import { serializeMessage } from "../lib/serializers.js";

export class ChatService {
	constructor({ messageRepository, friendshipRepository, blockRepository }) {
		this.messageRepository = messageRepository;
		this.friendshipRepository = friendshipRepository;
		this.blockRepository = blockRepository;
	}

	async canChat(senderUserId, receiverUserId) {
		if (!receiverUserId || senderUserId === receiverUserId) return false;

		const blocked = await this.blockRepository.findBetween(senderUserId, receiverUserId);
		if (blocked) return false;

		return Boolean(
			await this.friendshipRepository.areFriends(senderUserId, receiverUserId),
		);
	}

	async sendMessage({ senderUserId, receiverUserId, content }) {
		const normalizedContent = String(content || "").trim();
		if (!receiverUserId || !normalizedContent) return null;

		const allowed = await this.canChat(senderUserId, receiverUserId);
		if (!allowed) {
			const error = new Error("You can only chat with friends");
			error.status = 403;
			throw error;
		}

		const message = await this.messageRepository.create({
			senderUserId,
			receiverUserId,
			content: normalizedContent,
		});

		return serializeMessage(message);
	}
}
