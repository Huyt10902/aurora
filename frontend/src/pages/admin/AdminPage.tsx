import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import { Album, FolderTree, Music, Tags } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import CategoriesTabContent from "./components/CategoriesTabContent";
import GenresTabContent from "./components/GenresTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";

const AdminPage = () => {
	const { isAdmin, isLoading } = useAuthStore();

	const { fetchAlbums, fetchCategories, fetchGenres, fetchSongs, fetchStats } = useMusicStore();

	useEffect(() => {
		if (!isAdmin) return;
		fetchAlbums();
		fetchCategories();
		fetchGenres();
		fetchSongs();
		fetchStats();
	}, [fetchAlbums, fetchCategories, fetchGenres, fetchSongs, fetchStats, isAdmin]);

	if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

	return (
		<div
			className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900
   to-black text-zinc-100 p-8'
		>
			<Header />

			<DashboardStats />

			<Tabs defaultValue='songs' className='space-y-6'>
				<TabsList className='p-1 bg-zinc-800/50'>
					<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
						<Music className='mr-2 size-4' />
						Songs
					</TabsTrigger>
					<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
						<Album className='mr-2 size-4' />
						Albums
					</TabsTrigger>
					<TabsTrigger value='genres' className='data-[state=active]:bg-zinc-700'>
						<Tags className='mr-2 size-4' />
						Genres
					</TabsTrigger>
					<TabsTrigger value='categories' className='data-[state=active]:bg-zinc-700'>
						<FolderTree className='mr-2 size-4' />
						Categories
					</TabsTrigger>
				</TabsList>

				<TabsContent value='songs'>
					<SongsTabContent />
				</TabsContent>
				<TabsContent value='albums'>
					<AlbumsTabContent />
				</TabsContent>
				<TabsContent value='genres'>
					<GenresTabContent />
				</TabsContent>
				<TabsContent value='categories'>
					<CategoriesTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
};
export default AdminPage;
