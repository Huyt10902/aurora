import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Song } from "@/types";
import { useMusicStore } from "@/stores/useMusicStore";
import { Tags } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";

type ClassifySongDialogProps = {
	song: Song;
	triggerLabel?: string;
	triggerClassName?: string;
};

const ClassifySongDialog = ({ song, triggerLabel = "Phan loai", triggerClassName = "" }: ClassifySongDialogProps) => {
	const {
		categories,
		fetchCategories,
		fetchGenres,
		genres,
		isLoading,
		updateSongClassification,
	} = useMusicStore();
	const [open, setOpen] = useState(false);
	const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
	const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

	useEffect(() => {
		if (!open) return;
		setSelectedGenreIds(song.genres.map((genre) => genre._id));
		setSelectedCategoryIds(song.categories.map((category) => category._id));
		if (genres.length === 0) fetchGenres();
		if (categories.length === 0) fetchCategories();
	}, [categories.length, fetchCategories, fetchGenres, genres.length, open, song.categories, song.genres]);

	const toggleGenre = (genreId: string) => {
		setSelectedGenreIds((current) =>
			current.includes(genreId) ? current.filter((id) => id !== genreId) : [...current, genreId]
		);
	};

	const toggleCategory = (categoryId: string) => {
		setSelectedCategoryIds((current) =>
			current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]
		);
	};

	const handleSave = async () => {
		const updatedSong = await updateSongClassification(song._id, selectedGenreIds, selectedCategoryIds);
		if (updatedSong) setOpen(false);
	};

	const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setOpen(true);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				aria-label='Sua phan loai bai hat'
				onClick={handleOpen}
				className={`text-sky-300 hover:text-sky-200 hover:bg-sky-400/10 ${triggerClassName}`}
			>
				<Tags className='size-4' />
				<span>{triggerLabel}</span>
			</Button>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[85vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Sua phan loai bai hat</DialogTitle>
					<DialogDescription>{song.title}</DialogDescription>
				</DialogHeader>

				<div className='grid gap-4 py-2'>
					<div className='space-y-2'>
						<div className='text-sm font-medium text-zinc-200'>The loai</div>
						{genres.length === 0 ? (
							<div className='text-sm text-zinc-400'>Tao the loai truoc trong tab Genres.</div>
						) : (
							genres.map((genre) => (
								<label
									key={genre._id}
									className='flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 cursor-pointer'
								>
									<input
										type='checkbox'
										checked={selectedGenreIds.includes(genre._id)}
										onChange={() => toggleGenre(genre._id)}
										className='size-4 accent-sky-500'
									/>
									<span>{genre.name}</span>
								</label>
							))
						)}
					</div>

					<div className='space-y-2'>
						<div className='text-sm font-medium text-zinc-200'>Danh muc / Chu de</div>
						{categories.length === 0 ? (
							<div className='text-sm text-zinc-400'>Tao danh muc truoc trong tab Categories.</div>
						) : (
							categories.map((category) => (
								<label
									key={category._id}
									className='flex items-center gap-3 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 cursor-pointer'
								>
									<input
										type='checkbox'
										checked={selectedCategoryIds.includes(category._id)}
										onChange={() => toggleCategory(category._id)}
										className='size-4 accent-amber-500'
									/>
									<span>{category.name}</span>
								</label>
							))
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)}>
						Huy
					</Button>
					<Button onClick={handleSave} disabled={isLoading}>
						Luu phan loai
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ClassifySongDialog;
