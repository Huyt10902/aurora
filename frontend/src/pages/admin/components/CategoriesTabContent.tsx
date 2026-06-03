import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMusicStore } from "@/stores/useMusicStore";
import { FolderTree, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";

const CategoriesTabContent = () => {
	const { categories, createCategory, deleteCategory, isLoading } = useMusicStore();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const savedCategory = await createCategory(name, description);
		if (savedCategory) {
			setName("");
			setDescription("");
		}
	};

	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<FolderTree className='size-5 text-amber-400' />
					Categories
				</CardTitle>
				<CardDescription>Manage song topic classifications</CardDescription>
			</CardHeader>
			<CardContent className='space-y-5'>
				<form onSubmit={handleSubmit} className='grid gap-3 md:grid-cols-[1fr_1.4fr_auto]'>
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder='Category name'
						className='bg-zinc-900 border-zinc-700'
					/>
					<Input
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder='Description'
						className='bg-zinc-900 border-zinc-700'
					/>
					<Button type='submit' disabled={isLoading || !name.trim()} className='bg-amber-500 hover:bg-amber-600 text-black'>
						<Plus className='size-4 mr-2' />
						Add
					</Button>
				</form>

				<div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
					{categories.map((category) => (
						<div key={category._id} className='flex items-start justify-between gap-3 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2'>
							<div className='min-w-0'>
								<div className='font-medium'>{category.name}</div>
								{category.description && <div className='truncate text-sm text-zinc-400'>{category.description}</div>}
							</div>
							<Button
								variant='ghost'
								size='icon'
								className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
								onClick={() => deleteCategory(category._id)}
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

export default CategoriesTabContent;
