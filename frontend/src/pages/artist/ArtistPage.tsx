import MediaImage from "@/components/MediaImage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPlayCount } from "@/lib/format";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Disc3, Music2, Play, PlayCircle } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import SectionGrid from "../home/components/SectionGrid";

const ArtistPage = () => {
	const { artistId } = useParams();
	const { currentArtistDetail, error, fetchArtistById, isLoading } = useMusicStore();
	const { initializeQueue, playAlbum } = usePlayerStore();

	useEffect(() => {
		if (artistId) fetchArtistById(artistId);
	}, [artistId, fetchArtistById]);

	useEffect(() => {
		if (currentArtistDetail?.songs.length) {
			initializeQueue(currentArtistDetail.songs);
		}
	}, [currentArtistDetail?.songs, initializeQueue]);

	if (isLoading && !currentArtistDetail) {
		return <div className='h-full rounded-md bg-zinc-900 p-6 text-zinc-400'>Loading artist...</div>;
	}

	if (!currentArtistDetail || error) {
		return <div className='h-full rounded-md bg-zinc-900 p-6 text-zinc-400'>{error || "Artist not found"}</div>;
	}

	const { artist, songs, albums } = currentArtistDetail;

	const handlePlayAll = () => {
		if (songs.length) playAlbum(songs, 0);
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md bg-zinc-900'>
				<div className='relative min-h-full'>
					<div className='absolute inset-0 bg-gradient-to-b from-sky-900/55 via-zinc-900 to-zinc-950' />
					<div className='relative z-10 p-4 sm:p-6 lg:p-8'>
						<section className='grid gap-6 lg:grid-cols-[240px_1fr] lg:items-end'>
							<MediaImage
								src={artist.imageUrl}
								alt={artist.name}
								className='aspect-square w-full max-w-[240px] rounded-md object-cover shadow-2xl'
							/>

							<div className='min-w-0'>
								<p className='text-sm font-medium text-zinc-300'>Artist</p>
								<h1 className='mt-2 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl'>
									{artist.name}
								</h1>
								<div className='mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-300'>
									<span className='inline-flex items-center gap-1'>
										<Music2 className='size-4' />
										{artist.songCount} songs
									</span>
									<span className='inline-flex items-center gap-1'>
										<Disc3 className='size-4' />
										{artist.albumCount} albums
									</span>
								</div>
								{artist.bio && <p className='mt-4 max-w-3xl text-sm leading-6 text-zinc-300'>{artist.bio}</p>}

								<div className='mt-6'>
									<Button
										onClick={handlePlayAll}
										disabled={songs.length === 0}
										className='rounded-full bg-green-500 text-black hover:bg-green-400'
									>
										<Play className='size-5' />
										Play songs
									</Button>
								</div>
							</div>
						</section>

						<section className='mt-8'>
							<SectionGrid title='Songs' songs={songs} isLoading={isLoading} initialLimit={8} />
							{!isLoading && songs.length === 0 && (
								<p className='rounded-md bg-zinc-950/60 p-4 text-sm text-zinc-500'>No songs linked to this artist.</p>
							)}
						</section>

						{albums.length > 0 && (
							<section className='mt-8'>
								<h2 className='mb-4 text-xl font-bold'>Albums</h2>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
									{albums.map((album) => (
										<Link
											key={album._id}
											to={`/albums/${album._id}`}
											className='rounded-md bg-zinc-800/40 p-4 transition-colors hover:bg-zinc-700/40'
										>
											<MediaImage src={album.imageUrl} alt={album.title} className='mb-3 aspect-square w-full rounded-md object-cover' />
											<div className='truncate font-medium hover:text-green-400'>{album.title}</div>
											<div className='mt-1 flex items-center gap-1 text-sm text-zinc-400'>
												<PlayCircle className='size-3.5' />
												{album.songs.length ? `${album.songs.length} songs` : `${album.releaseYear}`}
											</div>
										</Link>
									))}
								</div>
							</section>
						)}

						{albums.length === 0 && (
							<section className='mt-8 rounded-md bg-zinc-950/60 p-4 text-sm text-zinc-500'>
								No albums linked to this artist.
							</section>
						)}

						{songs.length > 0 && (
							<div className='mt-6 text-sm text-zinc-500'>
								Total plays: {formatPlayCount(songs.reduce((total, song) => total + song.playCount, 0))}
							</div>
						)}
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default ArtistPage;
