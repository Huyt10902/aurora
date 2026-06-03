import { services } from "../services/index.js";

export const getPlaylists = async (req, res, next) => {
	try {
		res.status(200).json(await services.playlistService.getPlaylists(req.user._id));
	} catch (error) {
		next(error);
	}
};

export const getPlaylistById = async (req, res, next) => {
	try {
		res.status(200).json(
			await services.playlistService.getPlaylist({
				userId: req.user._id,
				playlistId: req.params.playlistId,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const createPlaylist = async (req, res, next) => {
	try {
		res.status(201).json(
			await services.playlistService.createPlaylist({
				userId: req.user._id,
				...req.body,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const updatePlaylist = async (req, res, next) => {
	try {
		res.status(200).json(
			await services.playlistService.updatePlaylist({
				userId: req.user._id,
				playlistId: req.params.playlistId,
				...req.body,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const deletePlaylist = async (req, res, next) => {
	try {
		await services.playlistService.deletePlaylist({
			userId: req.user._id,
			playlistId: req.params.playlistId,
		});
		res.status(200).json({ message: "Playlist deleted successfully" });
	} catch (error) {
		next(error);
	}
};

export const addSongToPlaylist = async (req, res, next) => {
	try {
		res.status(200).json(
			await services.playlistService.addSong({
				userId: req.user._id,
				playlistId: req.params.playlistId,
				songId: req.params.songId,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const removeSongFromPlaylist = async (req, res, next) => {
	try {
		res.status(200).json(
			await services.playlistService.removeSong({
				userId: req.user._id,
				playlistId: req.params.playlistId,
				songId: req.params.songId,
			}),
		);
	} catch (error) {
		next(error);
	}
};

export const reorderPlaylistSongs = async (req, res, next) => {
	try {
		res.status(200).json(
			await services.playlistService.reorderSongs({
				userId: req.user._id,
				playlistId: req.params.playlistId,
				songIds: req.body.songIds,
			}),
		);
	} catch (error) {
		next(error);
	}
};
