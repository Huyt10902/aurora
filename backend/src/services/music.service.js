import { serializeAlbum, serializeArtist, serializeSong } from "../lib/serializers.js";

export class MusicService {
	constructor({ songRepository, albumRepository, artistRepository }) {
		this.songRepository = songRepository;
		this.albumRepository = albumRepository;
		this.artistRepository = artistRepository;
	}

	async getAllSongs(filters = {}) {
		const hasFilters = filters.query || filters.genreId || filters.categoryId;
		const songs = hasFilters
			? await this.songRepository.findWithFilters(filters)
			: await this.songRepository.findAll();
		return songs.map(serializeSong);
	}

	async searchCatalog({ query = "", genreId = null, categoryId = null }) {
		const [songs, albums, artists] = await Promise.all([
			this.songRepository.findWithFilters({ query, genreId, categoryId }),
			query ? this.albumRepository.findByTerm(query) : this.albumRepository.findAll(),
			this.artistRepository.search({ term: query, genreId, categoryId }),
		]);

		return {
			songs: songs.map(serializeSong),
			albums: albums.map((album) => serializeAlbum(album, album.song_ids || [])),
			artists: artists.map(serializeArtist),
		};
	}

	async getRandomSongs(limit) {
		const songs = await this.songRepository.findRandom(limit);
		return songs.map(serializeSong);
	}

	async getTrendingSongs(limit) {
		const songs = await this.songRepository.findTrending(limit);
		return songs.map(serializeSong);
	}

	async getAllAlbums() {
		const albums = await this.albumRepository.findAll();
		return albums.map((album) => serializeAlbum(album, album.song_ids || []));
	}

	async getAlbumById(albumId) {
		const album = await this.albumRepository.findById(albumId);
		if (!album) return null;

		const songs = await this.songRepository.findByAlbumId(albumId);
		return serializeAlbum(album, songs.map(serializeSong));
	}

	async getArtistById(artistId) {
		const artist = await this.artistRepository.findById(artistId);
		if (!artist) return null;

		const [songs, albums] = await Promise.all([
			this.songRepository.findByArtistId(artistId),
			this.albumRepository.findByArtistId(artistId),
		]);

		return {
			artist: serializeArtist(artist),
			songs: songs.map(serializeSong),
			albums: albums.map((album) => serializeAlbum(album, album.song_ids || [])),
		};
	}
}
