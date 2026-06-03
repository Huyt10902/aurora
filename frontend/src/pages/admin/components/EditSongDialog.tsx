import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { Pencil } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

const EditSongDialog = ({ song }: { song: Song }) => {
	const { albums, isLoading, updateSong } = useMusicStore();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		title: song.title,
		artist: song.artist,
		duration: String(song.duration),
		albumId: song.albumId || "none",
	});
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const audioInputRef = useRef<HTMLInputElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const readDuration = (file: File) =>
		new Promise<number>((resolve, reject) => {
			const audio = document.createElement("audio");
			const url = URL.createObjectURL(file);
			audio.preload = "metadata";
			audio.onloadedmetadata = () => {
				const duration = Math.round(audio.duration);
				URL.revokeObjectURL(url);
				if (Number.isFinite(duration) && duration > 0) {
					resolve(duration);
					return;
				}
				reject();
			};
			audio.onerror = () => {
				URL.revokeObjectURL(url);
				reject();
			};
			audio.src = url;
		});

	const handleAudioSelect = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setAudioFile(file);
		try {
			const duration = await readDuration(file);
			setForm((prev) => ({ ...prev, duration: String(duration) }));
		} catch {
			// Keep current duration if metadata cannot be read.
		}
	};

	const handleSubmit = async () => {
		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("artist", form.artist);
		formData.append("duration", form.duration);
		formData.append("albumId", form.albumId);
		if (audioFile) formData.append("audioFile", audioFile);
		if (imageFile) formData.append("imageFile", imageFile);

		await updateSong(song._id, formData);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='ghost' size='sm'>
					<Pencil className='size-4' />
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>Edit Song</DialogTitle>
					<DialogDescription>Update song metadata and replace media files.</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
					<Input value={form.artist} onChange={(event) => setForm({ ...form, artist: event.target.value })} />
					<Input type='number' min='0' value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} />
					<Select value={form.albumId} onValueChange={(value) => setForm({ ...form, albumId: value })}>
						<SelectTrigger className='bg-zinc-800 border-zinc-700'>
							<SelectValue placeholder='Album' />
						</SelectTrigger>
						<SelectContent className='bg-zinc-800 border-zinc-700'>
							<SelectItem value='none'>No Album</SelectItem>
							{albums.map((album) => (
								<SelectItem key={album._id} value={album._id}>
									{album.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<input ref={audioInputRef} type='file' accept='audio/*' hidden onChange={handleAudioSelect} />
					<input ref={imageInputRef} type='file' accept='image/*' hidden onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
					<div className='flex gap-2'>
						<Button variant='outline' onClick={() => audioInputRef.current?.click()} className='flex-1'>
							{audioFile ? audioFile.name.slice(0, 22) : "Replace audio"}
						</Button>
						<Button variant='outline' onClick={() => imageInputRef.current?.click()} className='flex-1'>
							{imageFile ? imageFile.name.slice(0, 22) : "Replace image"}
						</Button>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)}>Cancel</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditSongDialog;
