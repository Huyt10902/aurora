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
import { useMusicStore } from "@/stores/useMusicStore";
import { Album } from "@/types";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

const EditAlbumDialog = ({ album }: { album: Album }) => {
	const { isLoading, updateAlbum } = useMusicStore();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		title: album.title,
		artist: album.artist,
		releaseYear: String(album.releaseYear),
	});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = async () => {
		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("artist", form.artist);
		formData.append("releaseYear", form.releaseYear);
		if (imageFile) formData.append("imageFile", imageFile);

		await updateAlbum(album._id, formData);
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
					<DialogTitle>Edit Album</DialogTitle>
					<DialogDescription>Update album information and artwork.</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
					<Input value={form.artist} onChange={(event) => setForm({ ...form, artist: event.target.value })} />
					<Input
						type='number'
						min='1900'
						value={form.releaseYear}
						onChange={(event) => setForm({ ...form, releaseYear: event.target.value })}
					/>
					<input
						ref={imageInputRef}
						type='file'
						accept='image/*'
						hidden
						onChange={(event) => setImageFile(event.target.files?.[0] || null)}
					/>
					<Button variant='outline' onClick={() => imageInputRef.current?.click()} className='w-full'>
						{imageFile ? imageFile.name.slice(0, 28) : "Replace artwork"}
					</Button>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)}>Cancel</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditAlbumDialog;
