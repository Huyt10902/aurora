import MediaImage from "@/components/MediaImage";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPlayCount } from "@/lib/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { SubscriptionDialog } from "@/components/SubscriptionDialog";
import { Clock, Music2, Pause, Play, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const AlbumPage = () => {
	const { albumId } = useParams();
	const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const { isPremium } = useSubscriptionStore();
	const { user } = useAuthStore();
	const [showDialog, setShowDialog] = useState(false);

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	if (isLoading) return null;

	const handlePlayAlbum = () => {
		if (!user || !isPremium) {
			setShowDialog(true);
			return;
		}
		
		if (!currentAlbum) return;

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			// start playing the album from the beginning
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!user || !isPremium) {
			setShowDialog(true);
			return;
		}
		
		if (!currentAlbum) return;

		playAlbum(currentAlbum?.songs, index);
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				{/* Main Content */}
				<div className='relative min-h-full'>
					{/* bg gradient */}
					<div
						className='absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80
					 to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					{/* Content */}
					<div className='relative z-10'>
						<div className='flex p-6 gap-6 pb-8'>
							<MediaImage
								src={currentAlbum?.imageUrl}
								alt={currentAlbum?.title}
								className='w-[240px] h-[240px] object-cover shadow-xl rounded'
							/>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>Album</p>
								<h1 className='text-7xl font-bold my-4'>{currentAlbum?.title}</h1>
								<div className='flex items-center gap-2 text-sm text-zinc-100'>
									<span className='font-medium text-white'>{currentAlbum?.artist}</span>
									<span>- {currentAlbum?.songs.length} songs</span>
									<span>- {currentAlbum?.releaseYear}</span>
								</div>
							</div>
						</div>

						{/* play button */}
						<div className='px-6 pb-4 flex items-center gap-6'>
							<Button
								onClick={handlePlayAlbum}
								size='icon'
								className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 
                hover:scale-105 transition-all'
							>
								{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-black' />
								) : (
									<Play className='h-7 w-7 text-black' />
								)}
							</Button>
						</div>

						{/* Table Section */}
						<div className='bg-black/20 backdrop-blur-sm'>
							{/* table header */}
							<div
								className='grid grid-cols-[16px_4fr_1.5fr_1fr_1fr] gap-4 px-10 py-2 text-sm 
            text-zinc-400 border-b border-white/5'
							>
								<div>#</div>
								<div>Title</div>
								<div>Released Date</div>
								<div>
									<PlayCircle className='h-4 w-4' />
								</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
							</div>

							{/* songs list */}

							<div className='px-6'>
								<div className='space-y-2 py-4'>
									{currentAlbum?.songs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;
										return (
											<div
												key={song._id}
												onClick={() => handlePlaySong(index)}
												className={`grid grid-cols-[16px_4fr_1.5fr_1fr_1fr] gap-4 px-4 py-2 text-sm 
                      text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer
                      `}
											>
												<div className='flex items-center justify-center'>
													{isCurrentSong && isPlaying ? (
														<Music2 className='size-4 text-green-500' />
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && (
														<Play className='h-4 w-4 hidden group-hover:block' />
													)}
												</div>

												<div className='flex items-center gap-3'>
													<MediaImage src={song.imageUrl} alt={song.title} className='size-10 object-cover rounded' />

													<div>
														<Link
															to={`/songs/${song._id}`}
															onClick={(event) => event.stopPropagation()}
															className='block font-medium text-white hover:text-green-400'
														>
															{song.title}
														</Link>
														<div>{song.artist}</div>
													</div>
												</div>
												<div className='flex items-center'>{song.createdAt.split("T")[0]}</div>
												<div className='flex items-center'>{formatPlayCount(song.playCount)}</div>
												<div className='flex items-center'>{formatDuration(song.duration)}</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
			<SubscriptionDialog open={showDialog} onOpenChange={setShowDialog} />
		</div>
	);
};
export default AlbumPage;
