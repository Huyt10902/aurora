import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Tags, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

const GenresTabContent = () => {
	const { genres, createGenre, deleteGenre, isLoading } = useMusicStore();
	const [name, setName] = useState("");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		await createGenre(name);
		setName("");
	};

	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Tags className='size-5 text-sky-400' />
					Genres
				</CardTitle>
				<CardDescription>Manage song classification labels</CardDescription>
			</CardHeader>
			<CardContent className='space-y-5'>
				<form onSubmit={handleSubmit} className='flex gap-3'>
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder='Add a genre'
						className='bg-zinc-900 border-zinc-700'
					/>
					<Button type='submit' disabled={isLoading || !name.trim()} className='bg-sky-500 hover:bg-sky-600 text-white'>
						<Plus className='size-4 mr-2' />
						Add
					</Button>
				</form>

				<div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
					{genres.map((genre) => (
						<div key={genre._id} className='flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2'>
							<span className='font-medium'>{genre.name}</span>
							<Button
								variant='ghost'
								size='icon'
								className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
								onClick={() => deleteGenre(genre._id)}
							>
								<Trash2 className='size-4' />
							</Button>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default GenresTabContent;
