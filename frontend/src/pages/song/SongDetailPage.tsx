import MediaImage from "@/components/MediaImage";
import SongActions from "@/components/SongActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatDuration, formatPlayCount, formatRating } from "@/lib/format";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import {
	Calendar,
	Clock,
	Disc3,
	Hash,
	MessageCircle,
	Pause,
	Play,
	PlayCircle,
	Star,
	Tags,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const ratingChoices = [1, 2, 3, 4, 5];

const SongDetailPage = () => {
	const { songId } = useParams();
	const { user } = useAuthStore();
	const {
		addSongComment,
		clearSongRating,
		currentSongDetail,
		deleteSongComment,
		error,
		fetchSongById,
		isLoading,
		rateSong,
	} = useMusicStore();
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const [comment, setComment] = useState("");
	const [hoverRating, setHoverRating] = useState<number | null>(null);

	useEffect(() => {
		if (songId) fetchSongById(songId);
	}, [fetchSongById, songId]);

	if (isLoading && !currentSongDetail) {
		return <div className='h-full rounded-md bg-zinc-900 p-6 text-zinc-400'>Loading song...</div>;
	}

	if (!currentSongDetail || error) {
		return <div className='h-full rounded-md bg-zinc-900 p-6 text-zinc-400'>{error || "Song not found"}</div>;
	}

	const { song, rating, comments } = currentSongDetail;
	const isCurrentSong = currentSong?._id === song._id;
	const displayedRating = hoverRating ?? rating.userRating ?? 0;
	const canComment = Boolean(user);

	const handlePlay = () => {
		if (isCurrentSong) togglePlay();
		else setCurrentSong(song);
	};

	const handleSubmitComment = async () => {
		const trimmedComment = comment.trim();
		if (!trimmedComment || !songId) return;
		await addSongComment(songId, trimmedComment);
		setComment("");
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md bg-zinc-900'>
				<div className='relative min-h-full'>
					<div className='absolute inset-0 bg-gradient-to-b from-emerald-900/55 via-zinc-900 to-zinc-950' />
					<div className='relative z-10 p-4 sm:p-6 lg:p-8'>
						<section className='grid gap-6 lg:grid-cols-[260px_1fr] lg:items-end'>
							<div className='relative w-full max-w-[260px]'>
								<MediaImage
									src={song.imageUrl}
									alt={song.title}
									className='aspect-square w-full rounded-md object-cover shadow-2xl'
								/>
								<SongActions song={song} />
							</div>

							<div className='min-w-0'>
								<p className='text-sm font-medium text-zinc-300'>Song</p>
								<h1 className='mt-2 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl'>
									{song.title}
								</h1>
								<p className='mt-3 truncate text-xl text-zinc-200'>{song.artist}</p>

								<div className='mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-300'>
									<span className='inline-flex items-center gap-1'>
										<Clock className='size-4' />
										{formatDuration(song.duration)}
									</span>
									<span className='inline-flex items-center gap-1'>
										<PlayCircle className='size-4' />
										{formatPlayCount(song.playCount)}
									</span>
									<span className='inline-flex items-center gap-1'>
										<Star className='size-4 fill-yellow-400 text-yellow-400' />
										{formatRating(rating.averageRating)}
									</span>
									<span className='inline-flex items-center gap-1'>
										<MessageCircle className='size-4' />
										{comments.length} comments
									</span>
								</div>

								<div className='mt-6 flex flex-wrap items-center gap-3'>
									<Button
										onClick={handlePlay}
										size='lg'
										className='rounded-full bg-green-500 text-black hover:bg-green-400'
									>
										{isCurrentSong && isPlaying ? <Pause className='size-5' /> : <Play className='size-5' />}
										{isCurrentSong && isPlaying ? "Pause" : "Play"}
									</Button>
									{song.albumId && (
										<Button
											asChild
											variant='outline'
											className='border-zinc-700 bg-zinc-900/60 text-white hover:bg-zinc-800 hover:text-white'
										>
											<Link to={`/albums/${song.albumId}`}>
												<Disc3 className='size-4' />
												Album
											</Link>
										</Button>
									)}
								</div>
							</div>
						</section>

						<section className='mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
							<div className='rounded-md bg-black/20 p-5 backdrop-blur'>
								<h2 className='mb-4 text-lg font-semibold text-white'>Details</h2>
								<div className='grid gap-4 sm:grid-cols-2'>
									<div className='space-y-1'>
										<p className='text-xs uppercase tracking-wide text-zinc-500'>Artist</p>
										<p className='text-zinc-100'>{song.artist}</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs uppercase tracking-wide text-zinc-500'>Album</p>
										<p className='text-zinc-100'>{song.albumTitle || "Single"}</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs uppercase tracking-wide text-zinc-500'>Release year</p>
										<p className='text-zinc-100'>{song.albumReleaseYear || "Unknown"}</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs uppercase tracking-wide text-zinc-500'>Created</p>
										<p className='inline-flex items-center gap-2 text-zinc-100'>
											<Calendar className='size-4 text-zinc-500' />
											{formatDate(song.createdAt)}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs uppercase tracking-wide text-zinc-500'>Updated</p>
										<p className='inline-flex items-center gap-2 text-zinc-100'>
											<Calendar className='size-4 text-zinc-500' />
											{formatDate(song.updatedAt)}
										</p>
									</div>
									<div className='space-y-1'>
										<p className='text-xs uppercase tracking-wide text-zinc-500'>Song ID</p>
										<p className='inline-flex max-w-full items-center gap-2 truncate text-zinc-100'>
											<Hash className='size-4 shrink-0 text-zinc-500' />
											<span className='truncate'>{song._id}</span>
										</p>
									</div>
								</div>

								<div className='mt-5 space-y-4'>
									<div>
										<p className='mb-2 inline-flex items-center gap-2 text-sm font-medium text-zinc-300'>
											<Tags className='size-4' />
											Genres
										</p>
										<div className='flex flex-wrap gap-2'>
											{song.genres.length ? (
												song.genres.map((genre) => (
													<span key={genre._id} className='rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200'>
														{genre.name}
													</span>
												))
											) : (
												<span className='text-sm text-zinc-500'>No genre</span>
											)}
										</div>
									</div>

									<div>
										<p className='mb-2 inline-flex items-center gap-2 text-sm font-medium text-zinc-300'>
											<Tags className='size-4' />
											Categories
										</p>
										<div className='flex flex-wrap gap-2'>
											{song.categories.length ? (
												song.categories.map((category) => (
													<span key={category._id} className='rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-200'>
														{category.name}
													</span>
												))
											) : (
												<span className='text-sm text-zinc-500'>No category</span>
											)}
										</div>
									</div>
								</div>
							</div>

							<div className='rounded-md bg-black/20 p-5 backdrop-blur'>
								<div className='mb-4 flex items-center justify-between gap-3'>
									<div>
										<h2 className='text-lg font-semibold text-white'>Ratings</h2>
										<p className='text-sm text-zinc-400'>
											{formatRating(rating.averageRating)} from {rating.ratingCount} ratings
										</p>
									</div>
									{rating.userRating && (
										<Button
											variant='ghost'
											size='sm'
											className='text-zinc-400 hover:bg-zinc-800 hover:text-white'
											onClick={() => songId && clearSongRating(songId)}
										>
											Clear
										</Button>
									)}
								</div>

								<div className='flex items-center gap-1'>
									{ratingChoices.map((value) => (
										<Button
											key={value}
											type='button'
											variant='ghost'
											size='icon'
											disabled={!user}
											className='size-10 text-zinc-500 hover:bg-zinc-800 hover:text-yellow-400 disabled:opacity-40'
											onMouseEnter={() => setHoverRating(value)}
											onMouseLeave={() => setHoverRating(null)}
											onClick={() => songId && rateSong(songId, value)}
										>
											<Star
												className={`size-6 ${
													value <= displayedRating ? "fill-yellow-400 text-yellow-400" : "text-zinc-500"
												}`}
											/>
										</Button>
									))}
								</div>
								{!user && <p className='mt-3 text-sm text-zinc-500'>Sign in to rate this song.</p>}
							</div>
						</section>

						<section className='mt-6 rounded-md bg-black/20 p-5 backdrop-blur'>
							<div className='mb-4 flex items-center justify-between gap-3'>
								<h2 className='text-lg font-semibold text-white'>Comments</h2>
								<span className='text-sm text-zinc-500'>{comments.length}</span>
							</div>

							<div className='space-y-3'>
								<textarea
									value={comment}
									onChange={(event) => setComment(event.target.value)}
									disabled={!canComment}
									maxLength={1000}
									placeholder={canComment ? "Write a comment" : "Sign in to comment"}
									className='min-h-24 w-full resize-none rounded-md border border-zinc-700 bg-zinc-950/70 p-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-60'
								/>
								<div className='flex items-center justify-between gap-3'>
									<span className='text-xs text-zinc-500'>{comment.trim().length}/1000</span>
									<Button
										onClick={handleSubmitComment}
										disabled={!canComment || !comment.trim()}
										className='bg-green-500 text-black hover:bg-green-400'
									>
										Comment
									</Button>
								</div>
							</div>

							<div className='mt-6 space-y-3'>
								{comments.length ? (
									comments.map((songComment) => {
										const canDelete = user?._id === songComment.user._id || user?.isAdmin;
										return (
											<div key={songComment._id} className='rounded-md bg-zinc-900/80 p-4'>
												<div className='flex items-start gap-3'>
													<Avatar className='size-10 border border-zinc-800'>
														<AvatarImage src={songComment.user.imageUrl} alt={songComment.user.fullName} />
														<AvatarFallback className='bg-zinc-800 text-sm text-zinc-200'>
															{songComment.user.fullName?.[0] || songComment.user.username?.[0] || "U"}
														</AvatarFallback>
													</Avatar>
													<div className='min-w-0 flex-1'>
														<div className='flex flex-wrap items-center justify-between gap-2'>
															<div>
																<p className='font-medium text-white'>{songComment.user.fullName}</p>
																<p className='text-xs text-zinc-500'>{formatDate(songComment.createdAt)}</p>
															</div>
															{canDelete && (
																<Button
																	variant='ghost'
																	size='icon'
																	className='size-8 text-zinc-500 hover:bg-zinc-800 hover:text-red-300'
																	onClick={() => songId && deleteSongComment(songId, songComment._id)}
																>
																	<Trash2 className='size-4' />
																</Button>
															)}
														</div>
														<p className='mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-200'>
															{songComment.content}
														</p>
													</div>
												</div>
											</div>
										);
									})
								) : (
									<p className='rounded-md bg-zinc-900/70 p-4 text-sm text-zinc-500'>No comments yet.</p>
								)}
							</div>
						</section>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default SongDetailPage;
