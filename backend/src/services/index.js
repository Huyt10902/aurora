import { AlbumRepository } from "../repositories/album.repository.js";
import { ArtistRepository } from "../repositories/artist.repository.js";
import { CategoryRepository } from "../repositories/category.repository.js";
import { BlockRepository } from "../repositories/block.repository.js";
import { FriendshipRepository } from "../repositories/friendship.repository.js";
import { LibraryRepository } from "../repositories/library.repository.js";
import { ListeningHistoryRepository } from "../repositories/listening-history.repository.js";
import { MediaAssetRepository } from "../repositories/media-asset.repository.js";
import { PlaylistRepository } from "../repositories/playlist.repository.js";
import { GenreRepository } from "../repositories/genre.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { RoleRepository } from "../repositories/role.repository.js";
import { SongRepository } from "../repositories/song.repository.js";
import { SongEngagementRepository } from "../repositories/song-engagement.repository.js";
import { StatsRepository } from "../repositories/stats.repository.js";
import { SubscriptionRepository } from "../repositories/subscription.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AdminService } from "./admin.service.js";
import { AuthService } from "./auth.service.js";
import { CategoryService } from "./category.service.js";
import { ChatService } from "./chat.service.js";
import { FriendService } from "./friend.service.js";
import { GenreService } from "./genre.service.js";
import { LibraryService } from "./library.service.js";
import { ListeningService } from "./listening.service.js";
import { MusicService } from "./music.service.js";
import { PlaylistService } from "./playlist.service.js";
import { SongEngagementService } from "./song-engagement.service.js";
import { StatsService } from "./stats.service.js";
import { SubscriptionService } from "./subscription.service.js";
import { UserService } from "./user.service.js";

const repositories = {
	albumRepository: new AlbumRepository(),
	artistRepository: new ArtistRepository(),
	blockRepository: new BlockRepository(),
	categoryRepository: new CategoryRepository(),
	friendshipRepository: new FriendshipRepository(),
	libraryRepository: new LibraryRepository(),
	listeningHistoryRepository: new ListeningHistoryRepository(),
	mediaAssetRepository: new MediaAssetRepository(),
	playlistRepository: new PlaylistRepository(),
	genreRepository: new GenreRepository(),
	messageRepository: new MessageRepository(),
	refreshTokenRepository: new RefreshTokenRepository(),
	roleRepository: new RoleRepository(),
	songEngagementRepository: new SongEngagementRepository(),
	songRepository: new SongRepository(),
	statsRepository: new StatsRepository(),
	subscriptionRepository: new SubscriptionRepository(),
	userRepository: new UserRepository(),
};

export const services = {
	adminService: new AdminService(repositories),
	authService: new AuthService(repositories),
	categoryService: new CategoryService(repositories),
	chatService: new ChatService(repositories),
	friendService: new FriendService(repositories),
	genreService: new GenreService(repositories),
	libraryService: new LibraryService(repositories),
	listeningService: new ListeningService(repositories),
	musicService: new MusicService(repositories),
	playlistService: new PlaylistService(repositories),
	songEngagementService: new SongEngagementService(repositories),
	statsService: new StatsService(repositories),
	subscriptionService: new SubscriptionService(repositories),
	userService: new UserService(repositories),
};
