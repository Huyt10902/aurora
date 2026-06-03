import "dotenv/config";
import { pool } from "../lib/db.js";
import { AlbumRepository } from "../repositories/album.repository.js";
import { ArtistRepository } from "../repositories/artist.repository.js";
import { MediaAssetRepository } from "../repositories/media-asset.repository.js";
import { SongRepository } from "../repositories/song.repository.js";

const albumRepository = new AlbumRepository();
const artistRepository = new ArtistRepository();
const mediaAssetRepository = new MediaAssetRepository();
const songRepository = new SongRepository();

const albumSeeds = [
	{
		title: "Urban Nights",
		artist: "Various Artists",
		imageUrl: "/albums/1.jpg",
		releaseYear: 2024,
		songs: [
			["City Rain", "Urban Echo", "/cover-images/7.jpg", "/songs/7.mp3", 39],
			["Neon Lights", "Night Runners", "/cover-images/5.jpg", "/songs/5.mp3", 36],
			["Urban Jungle", "City Lights", "/cover-images/15.jpg", "/songs/15.mp3", 36],
			["Neon Dreams", "Cyber Pulse", "/cover-images/13.jpg", "/songs/13.mp3", 39],
		],
	},
	{
		title: "Coastal Dreaming",
		artist: "Various Artists",
		imageUrl: "/albums/2.jpg",
		releaseYear: 2024,
		songs: [
			["Summer Daze", "Coastal Kids", "/cover-images/4.jpg", "/songs/4.mp3", 24],
			["Ocean Waves", "Coastal Drift", "/cover-images/9.jpg", "/songs/9.mp3", 28],
			["Crystal Rain", "Echo Valley", "/cover-images/16.jpg", "/songs/16.mp3", 39],
			["Starlight", "Luna Bay", "/cover-images/10.jpg", "/songs/10.mp3", 30],
		],
	},
	{
		title: "Midnight Sessions",
		artist: "Various Artists",
		imageUrl: "/albums/3.jpg",
		releaseYear: 2024,
		songs: [
			["Stay With Me", "Sarah Mitchell", "/cover-images/1.jpg", "/songs/1.mp3", 46],
			["Midnight Drive", "The Wanderers", "/cover-images/2.jpg", "/songs/2.mp3", 41],
			["Moonlight Dance", "Silver Shadows", "/cover-images/14.jpg", "/songs/14.mp3", 27],
		],
	},
	{
		title: "Eastern Dreams",
		artist: "Various Artists",
		imageUrl: "/albums/4.jpg",
		releaseYear: 2024,
		songs: [
			["Lost in Tokyo", "Electric Dreams", "/cover-images/3.jpg", "/songs/3.mp3", 24],
			["Neon Tokyo", "Future Pulse", "/cover-images/17.jpg", "/songs/17.mp3", 39],
			["Purple Sunset", "Dream Valley", "/cover-images/12.jpg", "/songs/12.mp3", 17],
		],
	},
];

const seedAlbums = async () => {
	try {
		await pool.query("DELETE FROM album_songs");
		await pool.query("DELETE FROM playlist_songs");
		await pool.query("DELETE FROM user_liked_songs");
		await pool.query("DELETE FROM song_genres");
		await pool.query("DELETE FROM song_categories");
		await pool.query("DELETE FROM album_artists");
		await pool.query("DELETE FROM song_artists");
		await pool.query("DELETE FROM songs");
		await pool.query("DELETE FROM albums");

		for (const albumSeed of albumSeeds) {
			const [coverAsset, albumArtist] = await Promise.all([
				mediaAssetRepository.findOrCreate({ provider: "local", resourceType: "image", url: albumSeed.imageUrl }),
				artistRepository.findOrCreateByName(albumSeed.artist),
			]);

			const album = await albumRepository.create({
				title: albumSeed.title,
				releaseYear: albumSeed.releaseYear,
				coverAssetId: coverAsset.id,
			});
			await albumRepository.linkArtist({ albumId: album.id, artistId: albumArtist.id });

			for (const [index, songSeed] of albumSeed.songs.entries()) {
				const [title, artistName, imageUrl, audioUrl, duration] = songSeed;
				const [songCoverAsset, audioAsset, songArtist] = await Promise.all([
					mediaAssetRepository.findOrCreate({ provider: "local", resourceType: "image", url: imageUrl }),
					mediaAssetRepository.findOrCreate({ provider: "local", resourceType: "audio", url: audioUrl }),
					artistRepository.findOrCreateByName(artistName),
				]);

				const song = await songRepository.create({
					title,
					duration,
					audioAssetId: audioAsset.id,
					coverAssetId: songCoverAsset.id,
				});

				await songRepository.linkArtist({ songId: song.id, artistId: songArtist.id });
				await songRepository.linkAlbum({ albumId: album.id, songId: song.id, trackNumber: index + 1 });
			}
		}

		console.log("Albums seeded successfully!");
	} catch (error) {
		console.error("Error seeding albums:", error);
	} finally {
		await pool.end();
	}
};

seedAlbums();
