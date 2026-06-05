import { deleteFromStorage, uploadToStorage } from "../lib/minio.js";
import { serializeAlbum, serializeSong } from "../lib/serializers.js";

export class AdminService {
  constructor({
    songRepository,
    albumRepository,
    artistRepository,
    categoryRepository,
    genreRepository,
    mediaAssetRepository,
  }) {
    this.songRepository = songRepository;
    this.albumRepository = albumRepository;
    this.artistRepository = artistRepository;
    this.categoryRepository = categoryRepository;
    this.genreRepository = genreRepository;
    this.mediaAssetRepository = mediaAssetRepository;
  }

  async createSong({ title, artist, duration, albumId, audioFile, imageFile }) {
    const normalizedTitle = String(title || "").trim();
    const normalizedArtist = String(artist || "").trim();
    const normalizedDuration = Number(duration);

    if (!audioFile || !imageFile) {
      const error = new Error("Please upload all files");
      error.status = 400;
      throw error;
    }
    if (
      !normalizedTitle ||
      !normalizedArtist ||
      !Number.isInteger(normalizedDuration) ||
      normalizedDuration < 0
    ) {
      const error = new Error(
        "Title, artist, and a valid duration are required",
      );
      error.status = 400;
      throw error;
    }

    const [audioUpload, imageUpload] = await Promise.all([
      this.uploadMedia(audioFile, "songs/audio"),
      this.uploadMedia(imageFile, "songs/images"),
    ]);

    const [audioAsset, coverAsset, artistEntity] = await Promise.all([
      this.mediaAssetRepository.findOrCreate({
        provider: audioUpload.provider,
        resourceType: audioUpload.resourceType,
        url: audioUpload.url,
        publicId: audioUpload.publicId,
        originalName: audioFile.name,
        mimeType: audioFile.mimetype,
        sizeBytes: audioFile.size,
        metadata: audioUpload.metadata,
      }),
      this.mediaAssetRepository.findOrCreate({
        provider: imageUpload.provider,
        resourceType: imageUpload.resourceType,
        url: imageUpload.url,
        publicId: imageUpload.publicId,
        originalName: imageFile.name,
        mimeType: imageFile.mimetype,
        sizeBytes: imageFile.size,
        metadata: imageUpload.metadata,
      }),
      this.artistRepository.findOrCreateByName(normalizedArtist),
    ]);

    const song = await this.songRepository.create({
      title: normalizedTitle,
      duration: normalizedDuration,
      audioAssetId: audioAsset.id,
      coverAssetId: coverAsset.id,
    });

    await this.songRepository.linkArtist({
      songId: song.id,
      artistId: artistEntity.id,
    });
    if (albumId) {
      await this.songRepository.linkAlbum({ albumId, songId: song.id });
    }

    const createdSong = await this.songRepository.findById(song.id);
    return serializeSong(createdSong);
  }

  async deleteSong(id) {
    const assets = await this.songRepository.findAssetsById(id);
    const deletedSong = await this.songRepository.delete(id);
    if (!deletedSong) return null;

    await this.deleteMediaAssets([
      { assetId: assets?.audio_asset_id, publicId: assets?.audio_public_id },
      { assetId: assets?.cover_asset_id, publicId: assets?.cover_public_id },
    ]);

    return deletedSong;
  }

  async updateSong({ id, title, artist, duration, albumId, audioFile, imageFile }) {
    const existingSong = await this.songRepository.findAssetsById(id);
    if (!existingSong) {
      const error = new Error("Song not found");
      error.status = 404;
      throw error;
    }

    const normalizedTitle = title === undefined ? null : String(title || "").trim();
    const normalizedArtist = artist === undefined ? null : String(artist || "").trim();
    const normalizedDuration =
      duration === undefined || duration === null || duration === ""
        ? null
        : Number(duration);

    if (normalizedTitle !== null && !normalizedTitle) {
      const error = new Error("Song title is required");
      error.status = 400;
      throw error;
    }
    if (normalizedArtist !== null && !normalizedArtist) {
      const error = new Error("Artist is required");
      error.status = 400;
      throw error;
    }
    if (
      normalizedDuration !== null &&
      (!Number.isInteger(normalizedDuration) || normalizedDuration < 0)
    ) {
      const error = new Error("A valid duration is required");
      error.status = 400;
      throw error;
    }

    const [audioUpload, imageUpload] = await Promise.all([
      audioFile ? this.uploadMedia(audioFile, "songs/audio") : null,
      imageFile ? this.uploadMedia(imageFile, "songs/images") : null,
    ]);

    const [audioAsset, coverAsset, artistEntity] = await Promise.all([
      audioUpload
        ? this.mediaAssetRepository.findOrCreate({
            provider: audioUpload.provider,
            resourceType: audioUpload.resourceType,
            url: audioUpload.url,
            publicId: audioUpload.publicId,
            originalName: audioFile.name,
            mimeType: audioFile.mimetype,
            sizeBytes: audioFile.size,
            metadata: audioUpload.metadata,
          })
        : null,
      imageUpload
        ? this.mediaAssetRepository.findOrCreate({
            provider: imageUpload.provider,
            resourceType: imageUpload.resourceType,
            url: imageUpload.url,
            publicId: imageUpload.publicId,
            originalName: imageFile.name,
            mimeType: imageFile.mimetype,
            sizeBytes: imageFile.size,
            metadata: imageUpload.metadata,
          })
        : null,
      normalizedArtist
        ? this.artistRepository.findOrCreateByName(normalizedArtist)
        : null,
    ]);

    await this.songRepository.update({
      id,
      title: normalizedTitle,
      duration: normalizedDuration,
      audioAssetId: audioAsset?.id || null,
      coverAssetId: coverAsset?.id || null,
    });

    if (artistEntity) {
      await this.songRepository.replaceArtists({
        songId: id,
        artistId: artistEntity.id,
      });
    }
    if (albumId !== undefined) {
      await this.songRepository.replaceAlbum({
        songId: id,
        albumId: albumId && albumId !== "none" ? albumId : null,
      });
    }

    await this.deleteMediaAssets([
      audioAsset
        ? {
            assetId: existingSong.audio_asset_id,
            publicId: existingSong.audio_public_id,
          }
        : null,
      coverAsset
        ? {
            assetId: existingSong.cover_asset_id,
            publicId: existingSong.cover_public_id,
          }
        : null,
    ]);

    const updatedSong = await this.songRepository.findById(id);
    return serializeSong(updatedSong);
  }

  async classifySong({ songId, genreIds = [], categoryIds = [] }) {
    if (!Array.isArray(genreIds) || !Array.isArray(categoryIds)) {
      const error = new Error("genreIds and categoryIds must be arrays");
      error.status = 400;
      throw error;
    }

    const song = await this.songRepository.findById(songId);
    if (!song) {
      const error = new Error("Song not found");
      error.status = 404;
      throw error;
    }

    const uniqueGenreIds = [...new Set(genreIds.filter(Boolean))];
    const uniqueCategoryIds = [...new Set(categoryIds.filter(Boolean))];

    for (const genreId of uniqueGenreIds) {
      const genre = await this.genreRepository.findById(genreId);
      if (!genre) {
        const error = new Error("Genre not found");
        error.status = 404;
        throw error;
      }
    }

    for (const categoryId of uniqueCategoryIds) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        const error = new Error("Category not found");
        error.status = 404;
        throw error;
      }
    }

    await this.songRepository.replaceGenres(songId, uniqueGenreIds);
    await this.songRepository.replaceCategories(songId, uniqueCategoryIds);

    const updatedSong = await this.songRepository.findById(songId);
    return serializeSong(updatedSong);
  }

  async createAlbum({ title, artist, releaseYear, imageFile }) {
    const normalizedTitle = String(title || "").trim();
    const normalizedArtist = String(artist || "").trim();
    const normalizedReleaseYear = Number(releaseYear);

    if (!imageFile) {
      const error = new Error("Please upload an album image");
      error.status = 400;
      throw error;
    }
    if (
      !normalizedTitle ||
      !normalizedArtist ||
      !Number.isInteger(normalizedReleaseYear)
    ) {
      const error = new Error(
        "Title, artist, and a valid release year are required",
      );
      error.status = 400;
      throw error;
    }

    const imageUpload = await this.uploadMedia(imageFile, "albums/images");
    const [coverAsset, artistEntity] = await Promise.all([
      this.mediaAssetRepository.findOrCreate({
        provider: imageUpload.provider,
        resourceType: imageUpload.resourceType,
        url: imageUpload.url,
        publicId: imageUpload.publicId,
        originalName: imageFile.name,
        mimeType: imageFile.mimetype,
        sizeBytes: imageFile.size,
        metadata: imageUpload.metadata,
      }),
      this.artistRepository.findOrCreateByName(normalizedArtist),
    ]);

    const album = await this.albumRepository.create({
      title: normalizedTitle,
      releaseYear: normalizedReleaseYear,
      coverAssetId: coverAsset.id,
    });

    await this.albumRepository.linkArtist({
      albumId: album.id,
      artistId: artistEntity.id,
    });
    return serializeAlbum(
      { ...album, image_url: coverAsset.url, artist: artistEntity.name },
      [],
    );
  }

  async deleteAlbum(id) {
    const assets = await this.albumRepository.findAssetsById(id);
    const deletedAlbum = await this.albumRepository.delete(id);
    if (!deletedAlbum) return null;

    await this.deleteMediaAssets([
      { assetId: assets?.cover_asset_id, publicId: assets?.cover_public_id },
    ]);

    return deletedAlbum;
  }

  async updateAlbum({ id, title, artist, releaseYear, imageFile }) {
    const existingAlbum = await this.albumRepository.findAssetsById(id);
    if (!existingAlbum) {
      const error = new Error("Album not found");
      error.status = 404;
      throw error;
    }

    const normalizedTitle = title === undefined ? null : String(title || "").trim();
    const normalizedArtist = artist === undefined ? null : String(artist || "").trim();
    const normalizedReleaseYear =
      releaseYear === undefined || releaseYear === null || releaseYear === ""
        ? null
        : Number(releaseYear);

    if (normalizedTitle !== null && !normalizedTitle) {
      const error = new Error("Album title is required");
      error.status = 400;
      throw error;
    }
    if (normalizedArtist !== null && !normalizedArtist) {
      const error = new Error("Artist is required");
      error.status = 400;
      throw error;
    }
    if (
      normalizedReleaseYear !== null &&
      !Number.isInteger(normalizedReleaseYear)
    ) {
      const error = new Error("A valid release year is required");
      error.status = 400;
      throw error;
    }

    const imageUpload = imageFile
      ? await this.uploadMedia(imageFile, "albums/images")
      : null;
    const [coverAsset, artistEntity] = await Promise.all([
      imageUpload
        ? this.mediaAssetRepository.findOrCreate({
            provider: imageUpload.provider,
            resourceType: imageUpload.resourceType,
            url: imageUpload.url,
            publicId: imageUpload.publicId,
            originalName: imageFile.name,
            mimeType: imageFile.mimetype,
            sizeBytes: imageFile.size,
            metadata: imageUpload.metadata,
          })
        : null,
      normalizedArtist
        ? this.artistRepository.findOrCreateByName(normalizedArtist)
        : null,
    ]);

    await this.albumRepository.update({
      id,
      title: normalizedTitle,
      releaseYear: normalizedReleaseYear,
      coverAssetId: coverAsset?.id || null,
    });

    if (artistEntity) {
      await this.albumRepository.replaceArtists({
        albumId: id,
        artistId: artistEntity.id,
      });
    }

    if (coverAsset) {
      await this.deleteMediaAssets([
        {
          assetId: existingAlbum.cover_asset_id,
          publicId: existingAlbum.cover_public_id,
        },
      ]);
    }

    const updatedAlbum = await this.albumRepository.findById(id);
    return serializeAlbum(updatedAlbum, updatedAlbum.song_ids || []);
  }

  async uploadMedia(file, folder) {
    return await uploadToStorage(file, folder);
  }

  async deleteMediaAssets(assets) {
    for (const asset of assets.filter(Boolean)) {
      if (asset.assetId) {
        const deletedAsset = await this.mediaAssetRepository.deleteIfUnreferenced(asset.assetId);
        if (deletedAsset?.public_id) {
          await deleteFromStorage({ publicId: deletedAsset.public_id });
        }
      } else if (asset.publicId) {
        await deleteFromStorage({ publicId: asset.publicId });
      }
    }
  }
}

  async getSettings() {
    const { SettingsRepository } = await import("../repositories/settings.repository.js");
    const settingsRepository = new SettingsRepository();
    const rows = await settingsRepository.findAll();
    
    // Convert to key-value object
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value === 'true';
    }
    
    return settings;
  }

  async updateSettings({ settings, userId }) {
    const { SettingsRepository } = await import("../repositories/settings.repository.js");
    const settingsRepository = new SettingsRepository();
    
    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      updates.push(
        settingsRepository.upsert({
          key,
          value: String(value),
          userId,
        })
      );
    }
    
    await Promise.all(updates);
    
    return this.getSettings();
  }
}
