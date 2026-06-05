import Topbar from "@/components/Topbar";
import MediaImage from "@/components/MediaImage";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useMemo, useState } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		searchCatalog,
		clearSearch,
		allSongs,
		catalogResults,
		categories,
		fetchAllSongs,
		fetchLikedSongIds,
		fetchPlaylists,
		fetchRecentlyPlayed,
		fetchRecommendations,
		fetchSearchFilters,
		genres,
		isLoading,
		recentlyPlayedSongs,
		recommendedSongs,
		searchResults,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
	} = useMusicStore();

	const [searchQuery, setSearchQuery] = useState("");
	const [allSongsQuery, setAllSongsQuery] = useState("");
	const [genreId, setGenreId] = useState("all");
	const [categoryId, setCategoryId] = useState("all");
	const { user } = useAuthStore();
	const { isPremium } = useSubscriptionStore();
	const navigate = useNavigate();

	const hasSearchResults = useMemo(
		() => searchQuery.trim().length > 0 || genreId !== "all" || categoryId !== "all",
		[categoryId, genreId, searchQuery],
	);

	const { initializeQueue } = usePlayerStore();

	const filteredAllSongs = useMemo(() => {
		const query = allSongsQuery.trim().toLowerCase();
		if (!query) return allSongs;

		return allSongs.filter(
			(song) =>
				song.title.toLowerCase().includes(query) ||
				song.artist.toLowerCase().includes(query),
		);
	}, [allSongs, allSongsQuery]);

	useEffect(() => {
		fetchAllSongs();
		fetchFeaturedSongs();
		fetchMadeForYouSongs();
		fetchTrendingSongs();
		fetchSearchFilters();
		if (user) {
			fetchLikedSongIds();
			fetchPlaylists();
			fetchRecentlyPlayed();
			fetchRecommendations();
		}
	}, [fetchAllSongs, fetchFeaturedSongs, fetchLikedSongIds, fetchMadeForYouSongs, fetchPlaylists, fetchRecentlyPlayed, fetchRecommendations, fetchSearchFilters, fetchTrendingSongs, user]);

	useEffect(() => {
		if (allSongs.length > 0) {
			initializeQueue(allSongs);
			return;
		}

		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
			const queuedSongs = [...featuredSongs, ...recentlyPlayedSongs, ...recommendedSongs, ...madeForYouSongs, ...trendingSongs];
			initializeQueue(queuedSongs);
		}
	}, [allSongs, initializeQueue, madeForYouSongs, recentlyPlayedSongs, recommendedSongs, trendingSongs, featuredSongs]);

	const handleSearch = async () => {
		const query = searchQuery.trim();
		const selectedGenreId = genreId === "all" ? undefined : genreId;
		const selectedCategoryId = categoryId === "all" ? undefined : categoryId;
		if (!query && !selectedGenreId && !selectedCategoryId) {
			clearSearch();
			return;
		}
		await searchCatalog({ query, genreId: selectedGenreId, categoryId: selectedCategoryId });
	};

	const handleClearSearch = () => {
		setSearchQuery("");
		setGenreId("all");
		setCategoryId("all");
		clearSearch();
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					{user && !isPremium && (
						<div className='mb-6 bg-gradient-to-r from-green-600 to-green-500 p-4 rounded-lg shadow-lg'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<Crown className='w-8 h-8 text-yellow-300' />
									<div>
										<h3 className='font-bold text-lg'>Upgrade to Premium to Play Music</h3>
										<p className='text-sm text-white/90'>Subscribe now to unlock unlimited music streaming</p>
									</div>
								</div>
								<Button
									onClick={() => navigate("/subscription")}
									className='bg-yellow-400 hover:bg-yellow-500 text-black font-bold'
								>
									Subscribe Now
								</Button>
							</div>
						</div>
					)}
					<h1 className='text-2xl sm:text-3xl font-bold mb-6'>Good afternoon</h1>
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center mb-6'>
						<div className='flex-1'>
							<Input
								placeholder='Search songs by title or artist'
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") handleSearch();
								}}
							/>
						</div>
						<Select value={genreId} onValueChange={setGenreId}>
							<SelectTrigger className='sm:w-[180px] bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Genre' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='all'>All genres</SelectItem>
								{genres.map((genre) => (
									<SelectItem key={genre._id} value={genre._id}>
										{genre.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={categoryId} onValueChange={setCategoryId}>
							<SelectTrigger className='sm:w-[180px] bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Category' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='all'>All categories</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category._id} value={category._id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className='flex gap-2'>
							<Button onClick={handleSearch}>Search</Button>
							<Button variant='ghost' onClick={handleClearSearch}>
								Clear
							</Button>
						</div>
					</div>

					{hasSearchResults ? (
						<div className='space-y-8'>
							<SectionGrid title={searchQuery.trim() ? `Search results for "${searchQuery.trim()}"` : "Filtered songs"} songs={searchResults} isLoading={isLoading} />
							{!isLoading && searchResults.length === 0 && (
								<p className='text-sm text-zinc-400'>No songs found for that query.</p>
							)}
							{catalogResults.albums.length > 0 && (
								<div>
									<h2 className='text-xl font-bold mb-4'>Albums</h2>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
										{catalogResults.albums.map((album) => (
											<Link key={album._id} to={`/albums/${album._id}`} className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-colors'>
												<MediaImage src={album.imageUrl} alt={album.title} className='aspect-square w-full rounded-md object-cover mb-3' />
												<div className='font-medium truncate'>{album.title}</div>
												<div className='text-sm text-zinc-400 truncate'>{album.artist}</div>
											</Link>
										))}
									</div>
								</div>
							)}
							{catalogResults.artists.length > 0 && (
								<div>
									<h2 className='text-xl font-bold mb-4'>Artists</h2>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
										{catalogResults.artists.map((artist) => (
											<Link key={artist._id} to={`/artists/${artist._id}`} className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-colors'>
												<MediaImage src={artist.imageUrl} alt={artist.name} className='mb-3 aspect-square w-full rounded-md object-cover' />
												<div className='font-medium truncate hover:text-green-400'>{artist.name}</div>
												<div className='text-sm text-zinc-400'>{artist.songCount} songs - {artist.albumCount} albums</div>
											</Link>
										))}
									</div>
								</div>
							)}
						</div>
					) : (
						<>
							<FeaturedSection />

							<div className='space-y-8'>
								<section>
									<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
										<div>
											<h2 className='text-xl sm:text-2xl font-bold'>All Songs</h2>
											<p className='text-sm text-zinc-400'>Browse the full music library</p>
										</div>
										<Input
											value={allSongsQuery}
											onChange={(event) => setAllSongsQuery(event.target.value)}
											placeholder='Search all songs'
											className='sm:max-w-xs bg-zinc-800 border-zinc-700'
										/>
									</div>
									<SectionGrid title='' songs={filteredAllSongs} isLoading={isLoading} initialLimit={8} />
									{!isLoading && filteredAllSongs.length === 0 && (
										<p className='text-sm text-zinc-400'>No songs found.</p>
									)}
								</section>
								{user && recentlyPlayedSongs.length > 0 && (
									<SectionGrid title='Recently Played' songs={recentlyPlayedSongs} isLoading={isLoading} />
								)}
								{user && recommendedSongs.length > 0 && (
									<SectionGrid title='Recommended For You' songs={recommendedSongs} isLoading={isLoading} />
								)}
								<SectionGrid title='Made For You' songs={madeForYouSongs} isLoading={isLoading} />
								<SectionGrid title='Trending' songs={trendingSongs} isLoading={isLoading} />
							</div>
						</>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};
export default HomePage;
