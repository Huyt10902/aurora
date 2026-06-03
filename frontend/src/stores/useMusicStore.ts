import { axiosInstance } from "@/lib/axios";
import { Album, ArtistDetail, Category, Genre, Playlist, SearchResults, Song, SongDetail, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

const replaceSong = (songs: Song[], updatedSong: Song) =>
	songs.map((song) => (song._id === updatedSong._id ? updatedSong : song));

const replaceSongInAlbum = (album: Album | null, updatedSong: Song) =>
	album
		? {
				...album,
				songs: replaceSong(album.songs || [], updatedSong),
			}
		: album;

const replaceSongInPlaylist = (playlist: Playlist | null, updatedSong: Song) =>
	playlist
		? {
				...playlist,
				songs: replaceSong(playlist.songs || [], updatedSong),
			}
		: playlist;

interface MusicStore {
	songs: Song[];
	allSongs: Song[];
	searchResults: Song[];
	catalogResults: SearchResults;
	albums: Album[];
	likedSongs: Song[];
	likedSongIds: Set<string>;
	recentlyPlayedSongs: Song[];
	recommendedSongs: Song[];
	playlists: Playlist[];
	currentPlaylist: Playlist | null;
	genres: Genre[];
	categories: Category[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	currentArtistDetail: ArtistDetail | null;
	currentSongDetail: SongDetail | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	stats: Stats;

	searchSongs: (query: string, filters?: { genreId?: string; categoryId?: string }) => Promise<void>;
	searchCatalog: (params: { query?: string; genreId?: string; categoryId?: string }) => Promise<void>;
	clearSearch: () => void;
	fetchLikedSongs: () => Promise<void>;
	fetchLikedSongIds: () => Promise<void>;
	toggleLikeSong: (songId: string) => Promise<void>;
	recordSongPlay: (songId: string) => Promise<void>;
	fetchRecentlyPlayed: () => Promise<void>;
	fetchRecommendations: () => Promise<void>;
	fetchSongById: (id: string) => Promise<void>;
	rateSong: (songId: string, rating: number) => Promise<void>;
	clearSongRating: (songId: string) => Promise<void>;
	addSongComment: (songId: string, content: string) => Promise<void>;
	deleteSongComment: (songId: string, commentId: string) => Promise<void>;
	fetchPlaylists: () => Promise<void>;
	fetchPlaylistById: (id: string) => Promise<void>;
	createPlaylist: (title: string, description?: string) => Promise<Playlist | null>;
	updatePlaylist: (id: string, data: { title?: string; description?: string }) => Promise<void>;
	deletePlaylist: (id: string) => Promise<void>;
	addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
	reorderPlaylistSongs: (playlistId: string, songIds: string[]) => Promise<void>;
	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchArtistById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchAllSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	fetchGenres: () => Promise<void>;
	fetchCategories: () => Promise<void>;
	fetchSearchFilters: () => Promise<void>;
	createGenre: (name: string) => Promise<void>;
	createCategory: (name: string, description?: string) => Promise<Category | null>;
	deleteGenre: (id: string) => Promise<void>;
	deleteCategory: (id: string) => Promise<void>;
	updateSongClassification: (songId: string, genreIds: string[], categoryIds: string[]) => Promise<Song | null>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	updateSong: (id: string, formData: FormData) => Promise<void>;
	updateAlbum: (id: string, formData: FormData) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
	albums: [],
	searchResults: [],
	catalogResults: { songs: [], albums: [], artists: [] },
	songs: [],
	allSongs: [],
	likedSongs: [],
	likedSongIds: new Set(),
	recentlyPlayedSongs: [],
	recommendedSongs: [],
	playlists: [],
	currentPlaylist: null,
	genres: [],
	categories: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	currentArtistDetail: null,
	currentSongDetail: null,
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
		totalPlays: 0,
	},

	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
				allSongs: state.allSongs.filter((song) => song._id !== id),
				likedSongs: state.likedSongs.filter((song) => song._id !== id),
				searchResults: state.searchResults.filter((song) => song._id !== id),
				catalogResults: {
					...state.catalogResults,
					songs: state.catalogResults.songs.filter((song) => song._id !== id),
				},
			}));
			toast.success("Song deleted successfully");
		} catch {
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	updateSong: async (id, formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/songs/${id}`, formData);
			set((state) => ({
				songs: state.songs.map((song) => (song._id === id ? response.data : song)),
				allSongs: replaceSong(state.allSongs, response.data),
				likedSongs: state.likedSongs.map((song) => (song._id === id ? response.data : song)),
				searchResults: state.searchResults.map((song) => (song._id === id ? response.data : song)),
				catalogResults: {
					...state.catalogResults,
					songs: state.catalogResults.songs.map((song) => (song._id === id ? response.data : song)),
				},
			}));
			toast.success("Song updated successfully");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update song");
		} finally {
			set({ isLoading: false });
		}
	},

	updateAlbum: async (id, formData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/albums/${id}`, formData);
			set((state) => ({
				albums: state.albums.map((album) => (album._id === id ? response.data : album)),
				catalogResults: {
					...state.catalogResults,
					albums: state.catalogResults.albums.map((album) => (album._id === id ? response.data : album)),
				},
			}));
			toast.success("Album updated successfully");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update album");
		} finally {
			set({ isLoading: false });
		}
	},

	fetchLikedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/library/liked");
			set({
				likedSongs: response.data,
				likedSongIds: new Set(response.data.map((song: Song) => song._id)),
			});
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchLikedSongIds: async () => {
		try {
			const response = await axiosInstance.get("/library/liked/ids");
			set({ likedSongIds: new Set(response.data) });
		} catch {
			set({ likedSongIds: new Set() });
		}
	},

	toggleLikeSong: async (songId) => {
		const isLiked = get().likedSongIds.has(songId);
		try {
			if (isLiked) {
				await axiosInstance.delete(`/library/liked/${songId}`);
				set((state) => {
					const nextIds = new Set(state.likedSongIds);
					nextIds.delete(songId);
					return {
						likedSongIds: nextIds,
						likedSongs: state.likedSongs.filter((song) => song._id !== songId),
					};
				});
			} else {
				const response = await axiosInstance.put(`/library/liked/${songId}`);
				set((state) => {
					const nextIds = new Set(state.likedSongIds);
					nextIds.add(songId);
					return {
						likedSongIds: nextIds,
						likedSongs: state.likedSongs.some((song) => song._id === songId)
							? state.likedSongs
							: [response.data, ...state.likedSongs],
					};
				});
			}
			get().fetchRecommendations();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update library");
		}
	},

	recordSongPlay: async (songId) => {
		try {
			const response = await axiosInstance.post(`/listening/plays/${songId}`);
			set((state) => ({
				songs: replaceSong(state.songs, response.data),
				allSongs: replaceSong(state.allSongs, response.data),
				searchResults: replaceSong(state.searchResults, response.data),
				likedSongs: replaceSong(state.likedSongs, response.data),
				featuredSongs: replaceSong(state.featuredSongs, response.data),
				madeForYouSongs: replaceSong(state.madeForYouSongs, response.data),
				trendingSongs: replaceSong(state.trendingSongs, response.data),
				recommendedSongs: replaceSong(state.recommendedSongs, response.data),
				currentAlbum: replaceSongInAlbum(state.currentAlbum, response.data),
				currentPlaylist: replaceSongInPlaylist(state.currentPlaylist, response.data),
				currentSongDetail:
					state.currentSongDetail?.song._id === songId
						? { ...state.currentSongDetail, song: response.data }
						: state.currentSongDetail,
				stats: {
					...state.stats,
					totalPlays: state.stats.totalPlays + 1,
				},
				catalogResults: {
					...state.catalogResults,
					songs: replaceSong(state.catalogResults.songs, response.data),
				},
				recentlyPlayedSongs: [
					response.data,
					...state.recentlyPlayedSongs.filter((song) => song._id !== songId),
				].slice(0, 20),
			}));
			if (localStorage.getItem("accessToken")) {
				get().fetchRecommendations();
			}
		} catch {
			// Listening history is a personal enhancement, so playback should keep going if it fails.
		}
	},

	fetchSongById: async (id) => {
		set((state) => ({
			isLoading: true,
			error: null,
			currentSongDetail: state.currentSongDetail?.song._id === id ? state.currentSongDetail : null,
		}));
		try {
			const response = await axiosInstance.get(`/songs/${id}`);
			const detail = response.data as SongDetail;
			set((state) => ({
				currentSongDetail: detail,
				songs: replaceSong(state.songs, detail.song),
				allSongs: replaceSong(state.allSongs, detail.song),
				searchResults: replaceSong(state.searchResults, detail.song),
				likedSongs: replaceSong(state.likedSongs, detail.song),
				featuredSongs: replaceSong(state.featuredSongs, detail.song),
				madeForYouSongs: replaceSong(state.madeForYouSongs, detail.song),
				trendingSongs: replaceSong(state.trendingSongs, detail.song),
				recommendedSongs: replaceSong(state.recommendedSongs, detail.song),
				currentAlbum: replaceSongInAlbum(state.currentAlbum, detail.song),
				currentPlaylist: replaceSongInPlaylist(state.currentPlaylist, detail.song),
				catalogResults: {
					...state.catalogResults,
					songs: replaceSong(state.catalogResults.songs, detail.song),
				},
			}));
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message, currentSongDetail: null });
		} finally {
			set({ isLoading: false });
		}
	},

	rateSong: async (songId, rating) => {
		try {
			const response = await axiosInstance.put(`/songs/${songId}/rating`, { rating });
			const detail = response.data as SongDetail;
			set((state) => ({
				currentSongDetail: detail,
				songs: replaceSong(state.songs, detail.song),
				allSongs: replaceSong(state.allSongs, detail.song),
				searchResults: replaceSong(state.searchResults, detail.song),
				likedSongs: replaceSong(state.likedSongs, detail.song),
				featuredSongs: replaceSong(state.featuredSongs, detail.song),
				madeForYouSongs: replaceSong(state.madeForYouSongs, detail.song),
				trendingSongs: replaceSong(state.trendingSongs, detail.song),
				recommendedSongs: replaceSong(state.recommendedSongs, detail.song),
				currentAlbum: replaceSongInAlbum(state.currentAlbum, detail.song),
				currentPlaylist: replaceSongInPlaylist(state.currentPlaylist, detail.song),
				catalogResults: {
					...state.catalogResults,
					songs: replaceSong(state.catalogResults.songs, detail.song),
				},
			}));
			toast.success("Rating saved");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to rate song");
		}
	},

	clearSongRating: async (songId) => {
		try {
			const response = await axiosInstance.delete(`/songs/${songId}/rating`);
			const detail = response.data as SongDetail;
			set((state) => ({
				currentSongDetail: detail,
				songs: replaceSong(state.songs, detail.song),
				allSongs: replaceSong(state.allSongs, detail.song),
				searchResults: replaceSong(state.searchResults, detail.song),
				likedSongs: replaceSong(state.likedSongs, detail.song),
				featuredSongs: replaceSong(state.featuredSongs, detail.song),
				madeForYouSongs: replaceSong(state.madeForYouSongs, detail.song),
				trendingSongs: replaceSong(state.trendingSongs, detail.song),
				recommendedSongs: replaceSong(state.recommendedSongs, detail.song),
				currentAlbum: replaceSongInAlbum(state.currentAlbum, detail.song),
				currentPlaylist: replaceSongInPlaylist(state.currentPlaylist, detail.song),
				catalogResults: {
					...state.catalogResults,
					songs: replaceSong(state.catalogResults.songs, detail.song),
				},
			}));
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to clear rating");
		}
	},

	addSongComment: async (songId, content) => {
		try {
			const response = await axiosInstance.post(`/songs/${songId}/comments`, { content });
			const detail = response.data as SongDetail;
			set((state) => ({
				currentSongDetail: detail,
				songs: replaceSong(state.songs, detail.song),
				allSongs: replaceSong(state.allSongs, detail.song),
				searchResults: replaceSong(state.searchResults, detail.song),
				likedSongs: replaceSong(state.likedSongs, detail.song),
				featuredSongs: replaceSong(state.featuredSongs, detail.song),
				madeForYouSongs: replaceSong(state.madeForYouSongs, detail.song),
				trendingSongs: replaceSong(state.trendingSongs, detail.song),
				recommendedSongs: replaceSong(state.recommendedSongs, detail.song),
				currentAlbum: replaceSongInAlbum(state.currentAlbum, detail.song),
				currentPlaylist: replaceSongInPlaylist(state.currentPlaylist, detail.song),
				catalogResults: {
					...state.catalogResults,
					songs: replaceSong(state.catalogResults.songs, detail.song),
				},
			}));
			toast.success("Comment added");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to add comment");
		}
	},

	deleteSongComment: async (songId, commentId) => {
		try {
			const response = await axiosInstance.delete(`/songs/${songId}/comments/${commentId}`);
			const detail = response.data as SongDetail;
			set((state) => ({
				currentSongDetail: detail,
				songs: replaceSong(state.songs, detail.song),
				allSongs: replaceSong(state.allSongs, detail.song),
				searchResults: replaceSong(state.searchResults, detail.song),
				likedSongs: replaceSong(state.likedSongs, detail.song),
				featuredSongs: replaceSong(state.featuredSongs, detail.song),
				madeForYouSongs: replaceSong(state.madeForYouSongs, detail.song),
				trendingSongs: replaceSong(state.trendingSongs, detail.song),
				recommendedSongs: replaceSong(state.recommendedSongs, detail.song),
				currentAlbum: replaceSongInAlbum(state.currentAlbum, detail.song),
				currentPlaylist: replaceSongInPlaylist(state.currentPlaylist, detail.song),
				catalogResults: {
					...state.catalogResults,
					songs: replaceSong(state.catalogResults.songs, detail.song),
				},
			}));
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete comment");
		}
	},

	fetchRecentlyPlayed: async () => {
		try {
			const response = await axiosInstance.get("/listening/recent");
			set({ recentlyPlayedSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		}
	},

	fetchRecommendations: async () => {
		try {
			const response = await axiosInstance.get("/listening/recommendations");
			set({ recommendedSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		}
	},

	fetchPlaylists: async () => {
		set({ error: null });
		try {
			const response = await axiosInstance.get("/playlists");
			set({ playlists: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		}
	},

	fetchPlaylistById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/playlists/${id}`);
			set({ currentPlaylist: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message, currentPlaylist: null });
		} finally {
			set({ isLoading: false });
		}
	},

	createPlaylist: async (title, description = "") => {
		const trimmedTitle = title.trim();
		if (!trimmedTitle) return null;
		try {
			const response = await axiosInstance.post("/playlists", {
				title: trimmedTitle,
				description,
			});
			set((state) => ({ playlists: [response.data, ...state.playlists] }));
			toast.success("Playlist created");
			return response.data;
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to create playlist");
			return null;
		}
	},

	updatePlaylist: async (id, data) => {
		try {
			const response = await axiosInstance.put(`/playlists/${id}`, data);
			set((state) => ({
				currentPlaylist: state.currentPlaylist?._id === id ? response.data : state.currentPlaylist,
				playlists: state.playlists.map((playlist) => (playlist._id === id ? response.data : playlist)),
			}));
			toast.success("Playlist updated");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update playlist");
		}
	},

	deletePlaylist: async (id) => {
		try {
			await axiosInstance.delete(`/playlists/${id}`);
			set((state) => ({
				currentPlaylist: state.currentPlaylist?._id === id ? null : state.currentPlaylist,
				playlists: state.playlists.filter((playlist) => playlist._id !== id),
			}));
			toast.success("Playlist deleted");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete playlist");
		}
	},

	addSongToPlaylist: async (playlistId, songId) => {
		try {
			const response = await axiosInstance.put(`/playlists/${playlistId}/songs/${songId}`);
			set((state) => ({
				currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist,
				playlists: state.playlists.map((playlist) =>
					playlist._id === playlistId ? { ...playlist, songCount: response.data.songs.length } : playlist,
				),
			}));
			toast.success("Added to playlist");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to add song");
		}
	},

	removeSongFromPlaylist: async (playlistId, songId) => {
		try {
			const response = await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			set((state) => ({
				currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist,
				playlists: state.playlists.map((playlist) =>
					playlist._id === playlistId ? { ...playlist, songCount: response.data.songs.length } : playlist,
				),
			}));
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to remove song");
		}
	},

	reorderPlaylistSongs: async (playlistId, songIds) => {
		try {
			const response = await axiosInstance.put(`/playlists/${playlistId}/songs`, { songIds });
			set((state) => ({
				currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist,
			}));
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to reorder playlist");
		}
	},

	fetchGenres: async () => {
		set({ error: null });
		try {
			const response = await axiosInstance.get("/admin/genres");
			set({ genres: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		}
	},

	fetchCategories: async () => {
		set({ error: null });
		try {
			const response = await axiosInstance.get("/admin/categories");
			set({ categories: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		}
	},

	fetchSearchFilters: async () => {
		try {
			const response = await axiosInstance.get("/search/filters");
			set({ genres: response.data.genres, categories: response.data.categories });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		}
	},

	createGenre: async (name) => {
		const trimmedName = name.trim();
		if (!trimmedName) return;

		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/admin/genres", { name: trimmedName });
			set((state) => {
				const exists = state.genres.some((genre) => genre._id === response.data._id);
				return { genres: exists ? state.genres : [...state.genres, response.data].sort((a, b) => a.name.localeCompare(b.name)) };
			});
			toast.success("Genre saved successfully");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to save genre");
		} finally {
			set({ isLoading: false });
		}
	},

	createCategory: async (name, description = "") => {
		const trimmedName = name.trim();
		if (!trimmedName) return null;

		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/admin/categories", { name: trimmedName, description });
			set((state) => {
				const exists = state.categories.some((category) => category._id === response.data._id);
				return {
					categories: exists
						? state.categories
								.map((category) => (category._id === response.data._id ? response.data : category))
								.sort((a, b) => a.name.localeCompare(b.name))
						: [...state.categories, response.data].sort((a, b) => a.name.localeCompare(b.name)),
				};
			});
			toast.success("Category saved successfully");
			return response.data;
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to save category");
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	deleteGenre: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/genres/${id}`);
			set((state) => ({
				genres: state.genres.filter((genre) => genre._id !== id),
				songs: state.songs.map((song) => ({
					...song,
					genres: song.genres.filter((genre) => genre._id !== id),
				})),
				allSongs: state.allSongs.map((song) => ({
					...song,
					genres: song.genres.filter((genre) => genre._id !== id),
				})),
			}));
			toast.success("Genre deleted successfully");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete genre");
		} finally {
			set({ isLoading: false });
		}
	},

	deleteCategory: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/categories/${id}`);
			set((state) => ({
				categories: state.categories.filter((category) => category._id !== id),
				songs: state.songs.map((song) => ({
					...song,
					categories: song.categories.filter((category) => category._id !== id),
				})),
				allSongs: state.allSongs.map((song) => ({
					...song,
					categories: song.categories.filter((category) => category._id !== id),
				})),
			}));
			toast.success("Category deleted successfully");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to delete category");
		} finally {
			set({ isLoading: false });
		}
	},

	updateSongClassification: async (songId, genreIds, categoryIds) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/songs/${songId}/classification`, {
				genreIds,
				categoryIds,
			});
			set((state) => ({
				songs: replaceSong(state.songs, response.data),
				allSongs: replaceSong(state.allSongs, response.data),
				searchResults: replaceSong(state.searchResults, response.data),
				likedSongs: replaceSong(state.likedSongs, response.data),
				featuredSongs: replaceSong(state.featuredSongs, response.data),
				madeForYouSongs: replaceSong(state.madeForYouSongs, response.data),
				trendingSongs: replaceSong(state.trendingSongs, response.data),
				recommendedSongs: replaceSong(state.recommendedSongs, response.data),
				currentAlbum: replaceSongInAlbum(state.currentAlbum, response.data),
				currentPlaylist: replaceSongInPlaylist(state.currentPlaylist, response.data),
				currentSongDetail:
					state.currentSongDetail?.song._id === songId
						? { ...state.currentSongDetail, song: response.data }
						: state.currentSongDetail,
				catalogResults: {
					...state.catalogResults,
					songs: replaceSong(state.catalogResults.songs, response.data),
				},
			}));
			toast.success("Song classification updated successfully");
			return response.data;
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update song classification");
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	searchSongs: async (query, filters = {}) => {
		set({ isLoading: true, error: null });
		try {
			const trimmedQuery = query.trim();
			if (!trimmedQuery && !filters.genreId && !filters.categoryId) {
				set({ searchResults: [] });
				return;
			}

			const params = new URLSearchParams();
			if (trimmedQuery) params.set("q", trimmedQuery);
			if (filters.genreId) params.set("genreId", filters.genreId);
			if (filters.categoryId) params.set("categoryId", filters.categoryId);
			const response = await axiosInstance.get(`/songs?${params.toString()}`);
			set({ searchResults: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
			set({ searchResults: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	searchCatalog: async ({ query = "", genreId, categoryId }) => {
		set({ isLoading: true, error: null });
		try {
			const params = new URLSearchParams();
			if (query.trim()) params.set("q", query.trim());
			if (genreId) params.set("genreId", genreId);
			if (categoryId) params.set("categoryId", categoryId);

			const response = await axiosInstance.get(`/search?${params.toString()}`);
			set({ catalogResults: response.data, searchResults: response.data.songs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
			set({ catalogResults: { songs: [], albums: [], artists: [] }, searchResults: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	clearSearch: () => {
		set({ searchResults: [], catalogResults: { songs: [], albums: [], artists: [] } });
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAllSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/search");
			set({ allSongs: response.data.songs });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchArtistById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/artists/${id}`);
			set({ currentArtistDetail: response.data });
		} catch (error: any) {
			set({
				currentArtistDetail: null,
				error: error.response?.data?.message || error.message,
			});
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || error.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));
