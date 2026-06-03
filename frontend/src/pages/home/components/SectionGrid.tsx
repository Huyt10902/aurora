import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import MediaImage from "@/components/MediaImage";
import PlayButton from "./PlayButton";
import SongActions from "@/components/SongActions";
import { formatPlayCount } from "@/lib/format";
import { PlayCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
	initialLimit?: number;
};
const SectionGrid = ({ songs, title, isLoading, initialLimit = 4 }: SectionGridProps) => {
	const [showAll, setShowAll] = useState(false);

	if (isLoading && songs.length === 0) return <SectionGridSkeleton />;

	const canToggle = songs.length > initialLimit;
	const visibleSongs = showAll ? songs : songs.slice(0, initialLimit);

	return (
		<div className='mb-8'>
			{(title || canToggle) && (
				<div className='flex items-center justify-between mb-4'>
					{title ? <h2 className='text-xl sm:text-2xl font-bold'>{title}</h2> : <div />}
					{canToggle && (
						<Button
							type='button'
							variant='link'
							className='text-sm text-zinc-400 hover:text-white'
							onClick={() => setShowAll((current) => !current)}
						>
							{showAll ? "Show less" : "Show all"}
						</Button>
					)}
				</div>
			)}

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{visibleSongs.map((song) => (
					<div
						key={song._id}
						className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer'
					>
						<div className='relative mb-4'>
							<Link to={`/songs/${song._id}`} className='block aspect-square rounded-md shadow-lg overflow-hidden'>
								<MediaImage
									src={song.imageUrl}
									alt={song.title}
									className='w-full h-full object-cover transition-transform duration-300 
									group-hover:scale-105'
								/>
							</Link>
							<SongActions song={song} />
							<PlayButton song={song} />
						</div>
						<Link to={`/songs/${song._id}`} className='block font-medium mb-2 truncate hover:text-green-400'>
							{song.title}
						</Link>
						<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
						<div className='mt-2 flex items-center gap-1 text-xs text-zinc-500'>
							<PlayCircle className='size-3.5' />
							<span>{formatPlayCount(song.playCount)}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
export default SectionGrid;
