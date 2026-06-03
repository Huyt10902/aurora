import UsersListSkeleton from "@/components/skeletons/UsersListSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/useChatStore";
import { User } from "@/types";
import { Check, Clock, UserPlus, X } from "lucide-react";
import { type ReactNode, useState } from "react";

const UsersList = () => {
	const {
		acceptFriendRequest,
		incomingRequests,
		isLoading,
		onlineUsers,
		outgoingRequests,
		rejectFriendRequest,
		selectedUser,
		sendFriendRequest,
		setSelectedUser,
		suggestedUsers,
		unreadCounts,
		users,
	} = useChatStore();

	const [searchQuery, setSearchQuery] = useState("");
	const normalizedQuery = searchQuery.trim().toLowerCase();

	const filterUser = (user: User) =>
		!normalizedQuery ||
		user.fullName.toLowerCase().includes(normalizedQuery) ||
		user.username.toLowerCase().includes(normalizedQuery);

	const filteredIncomingRequests = incomingRequests.filter((request) => filterUser(request.user));
	const filteredFriends = users.filter(filterUser);
	const filteredOutgoingRequests = outgoingRequests.filter((request) => filterUser(request.user));
	const filteredSuggestedUsers = suggestedUsers.filter(filterUser);

	return (
		<div className='border-r border-zinc-800'>
			<div className='flex flex-col h-full'>
				<ScrollArea className='h-[calc(100vh-280px)]'>
					<div className='space-y-5 p-4'>
						<div className='mb-4'>
							<Input
								placeholder='Search friends, requests, suggested users'
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
							/>
						</div>
						{isLoading ? (
							<UsersListSkeleton />
						) : (
							<>
							{filteredIncomingRequests.length > 0 && (
								<SectionTitle label='Requests' count={filteredIncomingRequests.length} />
								)}
								{filteredIncomingRequests.map((request) => (
									<UserRow
										key={request._id}
										user={request.user}
										online={onlineUsers.has(request.user._id)}
										actions={
											<div className='flex items-center gap-1'>
												<Button
													size='icon'
													className='size-8 bg-emerald-500 text-black hover:bg-emerald-400'
													onClick={() => acceptFriendRequest(request.user._id)}
												>
													<Check className='size-4' />
												</Button>
												<Button
													size='icon'
													variant='ghost'
													className='size-8 text-zinc-400 hover:text-white'
													onClick={() => rejectFriendRequest(request.user._id)}
												>
													<X className='size-4' />
												</Button>
											</div>
										}
									/>
								))}

								<SectionTitle label='Friends' count={filteredFriends.length} />
								{filteredFriends.length > 0 ? (
									filteredFriends.map((user) => (
										<UserRow
											key={user._id}
											user={user}
											online={onlineUsers.has(user._id)}
											selected={selectedUser?._id === user._id}
											unreadCount={unreadCounts[user._id] || 0}
											onClick={() => setSelectedUser(user)}
										/>
									))
								) : (
									<p className='hidden lg:block text-sm text-zinc-500 px-2'>No friends yet</p>
								)}

								{filteredOutgoingRequests.length > 0 && (
									<>
										<SectionTitle label='Pending' count={filteredOutgoingRequests.length} />
										{filteredOutgoingRequests.map((request) => (
											<UserRow
												key={request._id}
												user={request.user}
												online={onlineUsers.has(request.user._id)}
												actions={<Clock className='size-4 text-zinc-500' />}
											/>
										))}
									</>
								)}

								{filteredSuggestedUsers.length > 0 && (
									<>
										<SectionTitle label='Add Friends' count={filteredSuggestedUsers.length} />
										{filteredSuggestedUsers.map((user) => (
											<UserRow
												key={user._id}
												user={user}
												online={onlineUsers.has(user._id)}
												actions={
													<Button
														size='icon'
														variant='ghost'
														className='size-8 text-zinc-300 hover:text-white'
														onClick={() => sendFriendRequest(user._id)}
													>
														<UserPlus className='size-4' />
													</Button>
												}
											/>
										))}
									</>
								)}
							</>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

interface UserRowProps {
	actions?: ReactNode;
	onClick?: () => void;
	online: boolean;
	selected?: boolean;
	unreadCount?: number;
	user: User;
}

const UserRow = ({ actions, onClick, online, selected, unreadCount = 0, user }: UserRowProps) => (
	<div
		onClick={onClick}
		className={`flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg transition-colors
			${onClick ? "cursor-pointer" : ""}
			${selected ? "bg-zinc-800" : onClick ? "hover:bg-zinc-800/50" : "bg-zinc-900/40"}`}
	>
		<div className='relative'>
			<Avatar className='size-8 md:size-12'>
				<AvatarImage src={user.imageUrl} />
				<AvatarFallback>{user.fullName[0]}</AvatarFallback>
			</Avatar>
			{unreadCount > 0 && (
				<div className='absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-semibold text-black lg:hidden'>
					{unreadCount > 9 ? "9+" : unreadCount}
				</div>
			)}
			<div
				className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-zinc-900
					${online ? "bg-green-500" : "bg-zinc-500"}`}
			/>
		</div>

		<div className='flex-1 min-w-0 lg:block hidden'>
			<div className='flex items-center gap-2'>
				<span className='font-medium truncate'>{user.fullName}</span>
				{unreadCount > 0 && (
					<span className='rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-black'>
						{unreadCount}
					</span>
				)}
			</div>
			<div className='text-xs text-zinc-500 truncate'>@{user.username}</div>
		</div>

		<div className='hidden lg:flex shrink-0'>{actions}</div>
	</div>
);

const SectionTitle = ({ count, label }: { count: number; label: string }) => (
	<div className='hidden lg:flex items-center justify-between px-2 text-xs uppercase text-zinc-500'>
		<span>{label}</span>
		<span>{count}</span>
	</div>
);

export default UsersList;
