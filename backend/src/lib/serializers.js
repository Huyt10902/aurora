const toIso = (value) => (value instanceof Date ? value.toISOString() : value);

export const serializeUser = (row) => {
	if (!row) return null;
	const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

	return {
		_id: row.id,
		username: row.username,
		email: row.email,
		fullName: row.full_name,
		imageUrl: row.image_url || "",
		role: row.role,
		isAdmin: row.role === "admin" || row.email === adminEmail,
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeSong = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		title: row.title,
		artist: row.artist,
		imageUrl: row.image_url || "",
		audioUrl: row.audio_url,
		duration: row.duration,
		albumId: row.album_id,
		albumTitle: row.album_title || "",
		albumReleaseYear: row.album_release_year || null,
		playCount: Number(row.play_count || 0),
		averageRating: Number(row.average_rating || 0),
		ratingCount: Number(row.rating_count || 0),
		commentCount: Number(row.comment_count || 0),
		genres: Array.isArray(row.genres) ? row.genres.map(serializeGenre) : [],
		categories: Array.isArray(row.categories) ? row.categories.map(serializeCategory) : [],
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeAlbum = (row, songs = row?.songs ?? []) => {
	if (!row) return null;

	return {
		_id: row.id,
		title: row.title,
		artist: row.artist,
		imageUrl: row.image_url,
		releaseYear: row.release_year,
		songs,
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeArtist = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		name: row.name,
		bio: row.bio || "",
		imageUrl: row.image_url || "",
		songCount: row.song_count || 0,
		albumCount: row.album_count || 0,
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializePlaylist = (row, songs = row?.songs ?? []) => {
	if (!row) return null;

	return {
		_id: row.id,
		title: row.title,
		description: row.description || "",
		visibility: row.visibility,
		imageUrl: row.image_url || "",
		songCount: row.song_count || songs.length || 0,
		songs,
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeMessage = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		senderId: row.sender_user_id,
		receiverId: row.receiver_user_id,
		content: row.content,
		readAt: toIso(row.read_at),
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeFriendship = (row) => {
	if (!row) return null;

	return {
		_id: row.friendship_id || row.id,
		requesterId: row.requester_user_id,
		addresseeId: row.addressee_user_id,
		status: row.friendship_status || row.status,
		user: row.username ? serializeUser(row) : null,
		respondedAt: toIso(row.responded_at),
		createdAt: toIso(row.friendship_created_at || row.created_at),
		updatedAt: toIso(row.friendship_updated_at || row.updated_at),
	};
};

export const serializeGenre = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		name: row.name,
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeCategory = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		name: row.name,
		description: row.description || "",
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeSongRatingSummary = (row) => ({
	averageRating: Number(row?.average_rating || 0),
	ratingCount: Number(row?.rating_count || 0),
	userRating: row?.user_rating ? Number(row.user_rating) : null,
});

export const serializeSongComment = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		songId: row.song_id,
		content: row.content,
		user: {
			_id: row.user_id,
			username: row.username,
			fullName: row.full_name,
			imageUrl: row.image_url || "",
		},
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

const parseJsonArray = (value) => {
	if (Array.isArray(value)) return value;
	if (!value) return [];

	try {
		const parsed = typeof value === "string" ? JSON.parse(value) : value;
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

export const serializeSubscriptionFeature = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		code: row.code,
		name: row.name,
		description: row.description || "",
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeSubscriptionPlan = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		code: row.code,
		name: row.name,
		description: row.description || "",
		priceAmount: Number(row.price_amount || 0),
		currency: row.currency,
		billingInterval: row.billing_interval,
		sortOrder: Number(row.sort_order || 0),
		isActive: Boolean(row.is_active),
		features: parseJsonArray(row.features).map(serializeSubscriptionFeature).filter(Boolean),
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};

export const serializeUserSubscription = (row) => {
	if (!row) return null;

	return {
		_id: row.subscription_id || row.id,
		userId: row.user_id,
		status: row.subscription_status || row.status,
		startedAt: toIso(row.started_at),
		currentPeriodStart: toIso(row.current_period_start),
		currentPeriodEnd: toIso(row.current_period_end),
		cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
		canceledAt: toIso(row.canceled_at),
		createdAt: toIso(row.subscription_created_at || row.created_at),
		updatedAt: toIso(row.subscription_updated_at || row.updated_at),
	};
};

export const serializeSubscriptionOrder = (row) => {
	if (!row) return null;

	return {
		_id: row.id,
		userId: row.user_id,
		planId: row.plan_id,
		userSubscriptionId: row.user_subscription_id,
		amount: Number(row.amount || 0),
		currency: row.currency,
		status: row.status,
		checkoutUrl: row.checkout_url || "",
		externalOrderId: row.external_order_id || "",
		paidAt: toIso(row.paid_at),
		createdAt: toIso(row.created_at),
		updatedAt: toIso(row.updated_at),
	};
};
