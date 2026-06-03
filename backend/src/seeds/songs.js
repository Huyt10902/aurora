import "dotenv/config";
import { pool } from "../lib/db.js";
import { ArtistRepository } from "../repositories/artist.repository.js";
import { MediaAssetRepository } from "../repositories/media-asset.repository.js";
import { SongRepository } from "../repositories/song.repository.js";

const mediaAssetRepository = new MediaAssetRepository();
const artistRepository = new ArtistRepository();
const songRepository = new SongRepository();

const songs = [
	["Stay With Me", "Sarah Mitchell", "/cover-images/1.jpg", "/songs/1.mp3", 46],
	["Midnight Drive", "The Wanderers", "/cover-images/2.jpg", "/songs/2.mp3", 41],
	["Lost in Tokyo", "Electric Dreams", "/cover-images/3.jpg", "/songs/3.mp3", 24],
	["Summer Daze", "Coastal Kids", "/cover-images/4.jpg", "/songs/4.mp3", 24],
	["Neon Lights", "Night Runners", "/cover-images/5.jpg", "/songs/5.mp3", 36],
	["Mountain High", "The Wild Ones", "/cover-images/6.jpg", "/songs/6.mp3", 40],
	["City Rain", "Urban Echo", "/cover-images/7.jpg", "/songs/7.mp3", 39],
	["Desert Wind", "Sahara Sons", "/cover-images/8.jpg", "/songs/8.mp3", 28],
	["Ocean Waves", "Coastal Drift", "/cover-images/9.jpg", "/songs/9.mp3", 28],
	["Starlight", "Luna Bay", "/cover-images/10.jpg", "/songs/10.mp3", 30],
	["Winter Dreams", "Arctic Pulse", "/cover-images/11.jpg", "/songs/11.mp3", 29],
	["Purple Sunset", "Dream Valley", "/cover-images/12.jpg", "/songs/12.mp3", 17],
	["Neon Dreams", "Cyber Pulse", "/cover-images/13.jpg", "/songs/13.mp3", 39],
	["Moonlight Dance", "Silver Shadows", "/cover-images/14.jpg", "/songs/14.mp3", 27],
	["Urban Jungle", "City Lights", "/cover-images/15.jpg", "/songs/15.mp3", 36],
	["Crystal Rain", "Echo Valley", "/cover-images/16.jpg", "/songs/16.mp3", 39],
	["Neon Tokyo", "Future Pulse", "/cover-images/17.jpg", "/songs/17.mp3", 39],
	["Midnight Blues", "Jazz Cats", "/cover-images/18.jpg", "/songs/18.mp3", 29],
];

const seedSongs = async () => {
	try {
		await pool.query("DELETE FROM album_songs");
		await pool.query("DELETE FROM playlist_songs");
		await pool.query("DELETE FROM user_liked_songs");
		await pool.query("DELETE FROM song_genres");
		await pool.query("DELETE FROM song_categories");
		await pool.query("DELETE FROM song_artists");
		await pool.query("DELETE FROM songs");

		for (const [title, artistName, imageUrl, audioUrl, duration] of songs) {
			const [coverAsset, audioAsset, artist] = await Promise.all([
				mediaAssetRepository.findOrCreate({ provider: "local", resourceType: "image", url: imageUrl }),
				mediaAssetRepository.findOrCreate({ provider: "local", resourceType: "audio", url: audioUrl }),
				artistRepository.findOrCreateByName(artistName),
			]);

			const song = await songRepository.create({
				title,
				duration,
				audioAssetId: audioAsset.id,
				coverAssetId: coverAsset.id,
			});

			await songRepository.linkArtist({ songId: song.id, artistId: artist.id });
		}

		console.log("Songs seeded successfully!");
	} catch (error) {
		console.error("Error seeding songs:", error);
	} finally {
		await pool.end();
	}
};

seedSongs();
