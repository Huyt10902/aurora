import { useMusicStore } from "@/stores/useMusicStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import MediaImage from "@/components/MediaImage";
import PlayButton from "./PlayButton";
import { formatPlayCount } from "@/lib/format";
import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const FeaturedSection = () => {
	const { isLoading, featuredSongs, error } = useMusicStore();

	if (isLoading && featuredSongs.length === 0) return <FeaturedGridSkeleton />;

	if (error) return <p className='text-red-500 mb-4 text-lg'>{error}</p>;

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
			{featuredSongs.map((song) => (
				<div
					key={song._id}
					className='flex items-center bg-zinc-800/50 rounded-md overflow-hidden
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
				>
					<Link to={`/songs/${song._id}`} className='flex-shrink-0'>
						<MediaImage
							src={song.imageUrl}
							alt={song.title}
							className='w-16 sm:w-20 h-16 sm:h-20 object-cover flex-shrink-0'
						/>
					</Link>
					<div className='min-w-0 flex-1 p-4 pr-14'>
						<Link to={`/songs/${song._id}`} className='block font-medium truncate hover:text-green-400'>
							{song.title}
						</Link>
						<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
						<div className='mt-1 flex items-center gap-1 text-xs text-zinc-500'>
							<PlayCircle className='size-3.5' />
							<span>{formatPlayCount(song.playCount)}</span>
						</div>
					</div>
					<PlayButton song={song} />
				</div>
			))}
		</div>
	);
};
export default FeaturedSection;
