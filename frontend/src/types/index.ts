export interface Song {
	_id: string;
	title: string;
	artist: string;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	playCount: number;
	averageRating: number;
	ratingCount: number;
	commentCount: number;
	genres: Genre[];
	categories: Category[];
	albumTitle: string;
	albumReleaseYear: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface Album {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	songs: Song[];
}

export interface Artist {
	_id: string;
	name: string;
	bio: string;
	imageUrl: string;
	songCount: number;
	albumCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface Playlist {
	_id: string;
	title: string;
	description: string;
	visibility: "private" | "public" | string;
	imageUrl: string;
	songCount: number;
	songs: Song[];
	createdAt: string;
	updatedAt: string;
}

export interface SearchResults {
	songs: Song[];
	albums: Album[];
	artists: Artist[];
}

export interface ArtistDetail {
	artist: Artist;
	songs: Song[];
	albums: Album[];
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
	totalPlays: number;
}

export interface Genre {
	_id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface Category {
	_id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface SongRatingSummary {
	averageRating: number;
	ratingCount: number;
	userRating: number | null;
}

export interface SongCommentUser {
	_id: string;
	username: string;
	fullName: string;
	imageUrl: string;
}

export interface SongComment {
	_id: string;
	songId: string;
	content: string;
	user: SongCommentUser;
	createdAt: string;
	updatedAt: string;
}

export interface SongDetail {
	song: Song;
	rating: SongRatingSummary;
	comments: SongComment[];
}

export interface SubscriptionFeature {
	_id: string;
	code: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export interface SubscriptionPlan {
	_id: string;
	code: string;
	name: string;
	description: string;
	priceAmount: number;
	currency: string;
	billingInterval: "none" | "month" | "year" | string;
	sortOrder: number;
	isActive: boolean;
	features: SubscriptionFeature[];
	createdAt: string;
	updatedAt: string;
}

export interface UserSubscription {
	_id: string;
	userId: string;
	status: "pending" | "trialing" | "active" | "past_due" | "canceled" | "expired";
	startedAt: string | null;
	currentPeriodStart: string | null;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
	canceledAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SubscriptionStatus {
	plan: SubscriptionPlan | null;
	subscription: UserSubscription | null;
	isPremium: boolean;
	features: SubscriptionFeature[];
}

export interface SubscriptionOrder {
	_id: string;
	userId: string;
	planId: string;
	userSubscriptionId: string | null;
	amount: number;
	currency: string;
	status: "pending" | "paid" | "failed" | "expired" | "canceled";
	checkoutUrl: string;
	externalOrderId: string;
	paidAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	readAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Friendship {
	_id: string;
	requesterId: string;
	addresseeId: string;
	status: "pending" | "accepted" | "rejected";
	user: User;
	respondedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface FriendsOverview {
	friends: Friendship[];
	incomingRequests: Friendship[];
	outgoingRequests: Friendship[];
	suggestions: User[];
}

export interface User {
	_id: string;
	username: string;
	email: string;
	fullName: string;
	imageUrl: string;
	role: "user" | "admin";
	isAdmin: boolean;
}
