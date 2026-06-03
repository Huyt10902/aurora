import MediaImage from "@/components/MediaImage";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPlayCount } from "@/lib/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import { ArrowDown, ArrowUp, Heart, Play, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const LibraryPage = () => {
	const {
		createPlaylist,
		currentPlaylist,
		deletePlaylist,
		fetchLikedSongs,
		fetchPlaylistById,
		fetchPlaylists,
		likedSongs,
		playlists,
		removeSongFromPlaylist,
		reorderPlaylistSongs,
	} = useMusicStore();
	const { playAlbum } = usePlayerStore();
	const [playlistTitle, setPlaylistTitle] = useState("");
	const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

	useEffect(() => {
		fetchLikedSongs();
		fetchPlaylists();
	}, [fetchLikedSongs, fetchPlaylists]);

	useEffect(() => {
		if (selectedPlaylistId) fetchPlaylistById(selectedPlaylistId);
	}, [fetchPlaylistById, selectedPlaylistId]);

	const selectedSongs = currentPlaylist?.songs || [];
	const canPlaySelected = selectedSongs.length > 0;

	const handleCreatePlaylist = async () => {
		const playlist = await createPlaylist(playlistTitle);
		if (playlist) {
			setPlaylistTitle("");
			setSelectedPlaylistId(playlist._id);
		}
	};

	const moveSong = async (songId: string, direction: -1 | 1) => {
		if (!currentPlaylist) return;
		const currentIndex = selectedSongs.findIndex((song) => song._id === songId);
		const nextIndex = currentIndex + direction;
		if (currentIndex < 0 || nextIndex < 0 || nextIndex >= selectedSongs.length) return;

		const nextSongs = [...selectedSongs];
		const [song] = nextSongs.splice(currentIndex, 1);
		nextSongs.splice(nextIndex, 0, song);
		await reorderPlaylistSongs(currentPlaylist._id, nextSongs.map((item) => item._id));
	};

	const activePlaylist = useMemo(
		() => playlists.find((playlist) => playlist._id === selectedPlaylistId),
		[playlists, selectedPlaylistId],
	);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6 space-y-8'>
					<section>
						<div className='flex items-center gap-3 mb-4'>
							<Heart className='size-5 text-rose-400 fill-current' />
							<h1 className='text-2xl font-bold'>Saved Songs</h1>
						</div>
						<SongList
							songs={likedSongs}
							emptyText='No saved songs yet'
							onPlay={(songs, index) => playAlbum(songs, index)}
						/>
					</section>

					<section className='grid gap-6 xl:grid-cols-[320px_1fr]'>
						<div className='space-y-4'>
							<div className='flex items-center gap-2'>
								<Input
									value={playlistTitle}
									onChange={(event) => setPlaylistTitle(event.target.value)}
									placeholder='New playlist name'
									className='bg-zinc-800 border-zinc-700'
								/>
								<Button size='icon' onClick={handleCreatePlaylist} disabled={!playlistTitle.trim()}>
									<Plus className='size-4' />
								</Button>
							</div>

							<div className='space-y-2'>
								{playlists.map((playlist) => (
									<button
										key={playlist._id}
										onClick={() => setSelectedPlaylistId(playlist._id)}
										className={`w-full text-left rounded-md p-3 transition-colors ${
											selectedPlaylistId === playlist._id ? "bg-zinc-700" : "bg-zinc-800/60 hover:bg-zinc-800"
										}`}
									>
										<div className='font-medium truncate'>{playlist.title}</div>
										<div className='text-xs text-zinc-400'>{playlist.songCount} songs</div>
									</button>
								))}
								{playlists.length === 0 && (
									<p className='text-sm text-zinc-500'>Create a playlist to start collecting songs.</p>
								)}
							</div>
						</div>

						<div className='rounded-md bg-zinc-900/50 p-4'>
							<div className='mb-4 flex items-center justify-between gap-3'>
								<div>
									<h2 className='text-xl font-semibold'>{activePlaylist?.title || "Select a playlist"}</h2>
									<p className='text-sm text-zinc-400'>Add songs from Home with the playlist button.</p>
								</div>
								<div className='flex gap-2'>
									<Button
										size='icon'
										variant='ghost'
										disabled={!canPlaySelected}
										onClick={() => playAlbum(selectedSongs, 0)}
									>
										<Play className='size-4' />
									</Button>
									<Button
										size='icon'
										variant='ghost'
										className='text-red-400 hover:text-red-300'
										disabled={!currentPlaylist}
										onClick={() => {
											if (!currentPlaylist) return;
											deletePlaylist(currentPlaylist._id);
											setSelectedPlaylistId("");
										}}
									>
										<Trash2 className='size-4' />
									</Button>
								</div>
							</div>

							<div className='space-y-2'>
								{selectedSongs.map((song, index) => (
									<div key={song._id} className='flex items-center gap-3 rounded-md bg-zinc-800/60 p-2'>
										<MediaImage src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
										<div className='min-w-0 flex-1'>
											<Link to={`/songs/${song._id}`} className='block truncate font-medium hover:text-green-400'>
												{song.title}
											</Link>
											<div className='truncate text-xs text-zinc-400'>
												{song.artist} - {formatPlayCount(song.playCount)}
											</div>
										</div>
										<Button size='icon' variant='ghost' onClick={() => moveSong(song._id, -1)} disabled={index === 0}>
											<ArrowUp className='size-4' />
										</Button>
										<Button
											size='icon'
											variant='ghost'
											onClick={() => moveSong(song._id, 1)}
											disabled={index === selectedSongs.length - 1}
										>
											<ArrowDown className='size-4' />
										</Button>
										<Button
											size='icon'
											variant='ghost'
											className='text-red-400 hover:text-red-300'
											onClick={() => currentPlaylist && removeSongFromPlaylist(currentPlaylist._id, song._id)}
										>
											<Trash2 className='size-4' />
										</Button>
									</div>
								))}
								{currentPlaylist && selectedSongs.length === 0 && (
									<p className='text-sm text-zinc-500'>This playlist is empty.</p>
								)}
							</div>
						</div>
					</section>
				</div>
			</ScrollArea>
		</main>
	);
};

const SongList = ({
	emptyText,
	onPlay,
	songs,
}: {
	emptyText: string;
	onPlay: (songs: Song[], index: number) => void;
	songs: Song[];
}) => (
	<div className='space-y-2'>
		{songs.map((song, index) => (
			<div key={song._id} className='flex items-center gap-3 rounded-md bg-zinc-800/60 p-2'>
				<MediaImage src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
				<div className='min-w-0 flex-1'>
					<Link to={`/songs/${song._id}`} className='block truncate font-medium hover:text-green-400'>
						{song.title}
					</Link>
					<div className='truncate text-xs text-zinc-400'>
						{song.artist} - {formatPlayCount(song.playCount)}
					</div>
				</div>
				<Button size='icon' variant='ghost' onClick={() => onPlay(songs, index)}>
					<Play className='size-4' />
				</Button>
			</div>
		))}
		{songs.length === 0 && <p className='text-sm text-zinc-500'>{emptyText}</p>}
	</div>
);

export default LibraryPage;
