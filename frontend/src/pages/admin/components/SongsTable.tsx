import MediaImage from "@/components/MediaImage";
import { Button } from "@/components/ui/button";
import { formatPlayCount } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, PlayCircle, Trash2 } from "lucide-react";
import ClassifySongDialog from "./ClassifySongDialog";
import EditSongDialog from "./EditSongDialog";

const SongsTable = () => {
	const { songs, isLoading, error, deleteSong } = useMusicStore();

	if (isLoading && songs.length === 0) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading songs...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-red-400'>{error}</div>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Title</TableHead>
					<TableHead>Artist</TableHead>
					<TableHead>Genres</TableHead>
					<TableHead>Categories</TableHead>
					<TableHead>Plays</TableHead>
					<TableHead>Release Date</TableHead>
					<TableHead className='text-right'>Actions</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{songs.map((song) => (
					<TableRow key={song._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<MediaImage src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{song.title}</TableCell>
						<TableCell>{song.artist}</TableCell>
						<TableCell>
							<div className='flex flex-wrap gap-1'>
								{song.genres.length > 0 ? (
									song.genres.map((genre) => (
										<span key={genre._id} className='rounded-full bg-sky-500/10 px-2 py-1 text-xs text-sky-300'>
											{genre.name}
										</span>
									))
								) : (
									<span className='text-sm text-zinc-500'>Unclassified</span>
								)}
							</div>
						</TableCell>
						<TableCell>
							<div className='flex flex-wrap gap-1'>
								{song.categories.length > 0 ? (
									<>
										{song.categories.map((category) => (
											<span key={category._id} className='rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-300'>
												{category.name}
											</span>
										))}
										<ClassifySongDialog
											song={song}
											triggerLabel='Sua'
											triggerClassName='h-7 px-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-400/10'
										/>
									</>
								) : (
									<ClassifySongDialog
										song={song}
										triggerLabel='Them danh muc'
										triggerClassName='h-7 px-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-400/10'
									/>
								)}
							</div>
						</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<PlayCircle className='h-4 w-4' />
								{formatPlayCount(song.playCount)}
							</span>
						</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{song.createdAt.split("T")[0]}
							</span>
						</TableCell>

						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<EditSongDialog song={song} />
								<ClassifySongDialog song={song} triggerLabel='Phan loai' />
								<Button
									variant={"ghost"}
									size={"sm"}
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
									onClick={() => deleteSong(song._id)}
								>
									<Trash2 className='size-4' />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
export default SongsTable;
