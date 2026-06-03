import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { Send } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

const MessageInput = () => {
	const [newMessage, setNewMessage] = useState("");
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isTypingRef = useRef(false);
	const { selectedUser, sendMessage, sendTypingStart, sendTypingStop } = useChatStore();

	const stopTyping = useCallback((receiverId?: string) => {
		const targetId = receiverId || selectedUser?._id;
		if (!targetId || !isTypingRef.current) return;
		sendTypingStop(targetId);
		isTypingRef.current = false;
	}, [selectedUser?._id, sendTypingStop]);

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
			if (selectedUser) stopTyping(selectedUser._id);
		};
	}, [selectedUser, stopTyping]);

	const handleSend = () => {
		if (!selectedUser || !newMessage.trim()) return;
		sendMessage(selectedUser._id, newMessage.trim());
		stopTyping(selectedUser._id);
		setNewMessage("");
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setNewMessage(value);
		if (!selectedUser) return;

		if (!value.trim()) {
			stopTyping(selectedUser._id);
			return;
		}

		if (!isTypingRef.current) {
			sendTypingStart(selectedUser._id);
			isTypingRef.current = true;
		}

		if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
		typingTimeoutRef.current = setTimeout(() => stopTyping(selectedUser._id), 1200);
	};

	return (
		<div className='p-4 mt-auto border-t border-zinc-800'>
			<div className='flex gap-2'>
				<Input
					placeholder='Type a message'
					value={newMessage}
					onChange={handleChange}
					className='bg-zinc-800 border-none'
					onKeyDown={(e) => e.key === "Enter" && handleSend()}
				/>

				<Button size={"icon"} onClick={handleSend} disabled={!newMessage.trim()}>
					<Send className='size-4' />
				</Button>
			</div>
		</div>
	);
};
export default MessageInput;
