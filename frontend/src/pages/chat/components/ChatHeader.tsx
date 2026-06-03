import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { Ban, UserMinus } from "lucide-react";

const ChatHeader = () => {
	const { blockUser, onlineUsers, removeFriend, selectedUser, typingUsers } = useChatStore();

	if (!selectedUser) return null;

	const isTyping = typingUsers.has(selectedUser._id);

	return (
		<div className='p-4 border-b border-zinc-800'>
			<div className='flex items-center gap-3'>
				<Avatar>
					<AvatarImage src={selectedUser.imageUrl} />
					<AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
				</Avatar>
				<div>
					<h2 className='font-medium'>{selectedUser.fullName}</h2>
					<p className='text-sm text-zinc-400'>
						{isTyping ? "Typing..." : onlineUsers.has(selectedUser._id) ? "Online" : "Offline"}
					</p>
				</div>
				<Button
					size='icon'
					variant='ghost'
					className='ml-auto text-zinc-400 hover:text-white'
					title='Block user'
					onClick={() => {
						if (window.confirm(`Block ${selectedUser.fullName}?`)) {
							blockUser(selectedUser._id);
						}
					}}
				>
					<Ban className='size-4' />
				</Button>
				<Button
					size='icon'
					variant='ghost'
					className='text-zinc-400 hover:text-white'
					title='Remove friend'
					onClick={() => removeFriend(selectedUser._id)}
				>
					<UserMinus className='size-4' />
				</Button>
			</div>
		</div>
	);
};
export default ChatHeader;
