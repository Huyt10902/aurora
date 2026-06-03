import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { Heart, ListPlus } from "lucide-react";
import { type MouseEvent, useState } from "react";
import toast from "react-hot-toast";

const SongActions = ({ song }: { song: Song }) => {
	const { user } = useAuthStore();
	const {
		addSongToPlaylist,
		createPlaylist,
		fetchPlaylists,
		likedSongIds,
		playlists,
		toggleLikeSong,
	} = useMusicStore();
	const [open, setOpen] = useState(false);
	const [playlistId, setPlaylistId] = useState("");
	const [newPlaylistTitle, setNewPlaylistTitle] = useState("");

	const isLiked = likedSongIds.has(song._id);

	const handleLike = async (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		if (!user) {
			toast.error("Please sign in to save songs");
			return;
		}
		await toggleLikeSong(song._id);
	};

	const handleAddToPlaylist = async () => {
		if (!user) {
			toast.error("Please sign in to use playlists");
			return;
		}

		let targetPlaylistId = playlistId;
		if (!targetPlaylistId && newPlaylistTitle.trim()) {
			const playlist = await createPlaylist(newPlaylistTitle);
			targetPlaylistId = playlist?._id || "";
		}

		if (!targetPlaylistId) {
			toast.error("Choose or create a playlist");
			return;
		}

		await addSongToPlaylist(targetPlaylistId, song._id);
		setPlaylistId("");
		setNewPlaylistTitle("");
		setOpen(false);
	};

	return (
		<div className='absolute inset-x-2 top-2 flex items-center justify-between'>
			<Button
				size='icon'
				variant='ghost'
				className={`size-8 bg-black/50 hover:bg-black/70 ${isLiked ? "text-rose-400" : "text-white"}`}
				onClick={handleLike}
			>
				<Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
			</Button>

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<Button
					size='icon'
					variant='ghost'
					className='size-8 bg-black/50 text-white hover:bg-black/70'
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						if (!user) {
							toast.error("Please sign in to use playlists");
							return;
						}
						setOpen(true);
						fetchPlaylists();
					}}
				>
					<ListPlus className='size-4' />
				</Button>
				<DialogContent className='bg-zinc-900 border-zinc-700'>
					<DialogHeader>
						<DialogTitle>Add to playlist</DialogTitle>
						<DialogDescription>Choose an existing playlist or create a new one.</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						<Select value={playlistId} onValueChange={setPlaylistId}>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Choose playlist' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								{playlists.map((playlist) => (
									<SelectItem key={playlist._id} value={playlist._id}>
										{playlist.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Input
							value={newPlaylistTitle}
							onChange={(event) => setNewPlaylistTitle(event.target.value)}
							placeholder='Or create a new playlist'
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleAddToPlaylist}>Add</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SongActions;
