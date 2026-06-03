CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Basic entities
CREATE TABLE IF NOT EXISTS roles (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	code VARCHAR(30) NOT NULL UNIQUE,
	name VARCHAR(80) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artists (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(255) NOT NULL UNIQUE,
	bio TEXT,
	image_asset_id UUID,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS genres (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(120) NOT NULL UNIQUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(120) NOT NULL UNIQUE,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_plans (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(120) NOT NULL,
	description TEXT,
	price_amount INTEGER NOT NULL DEFAULT 0 CHECK (price_amount >= 0),
	currency VARCHAR(3) NOT NULL DEFAULT 'VND',
	billing_interval VARCHAR(20) NOT NULL DEFAULT 'none'
		CHECK (billing_interval IN ('none', 'month', 'year')),
	sort_order INTEGER NOT NULL DEFAULT 0,
	is_active BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_features (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	code VARCHAR(80) NOT NULL UNIQUE,
	name VARCHAR(120) NOT NULL,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	role_id UUID NOT NULL REFERENCES roles(id),
	username VARCHAR(40) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	full_name VARCHAR(120) NOT NULL,
	avatar_asset_id UUID,
	status VARCHAR(20) NOT NULL DEFAULT 'active',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- External object entities
CREATE TABLE IF NOT EXISTS media_assets (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	provider VARCHAR(40) NOT NULL,
	resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('image', 'audio', 'video', 'other')),
	url TEXT NOT NULL UNIQUE,
	public_id TEXT,
	original_name TEXT,
	mime_type TEXT,
	size_bytes BIGINT,
	metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_providers (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	code VARCHAR(50) NOT NULL UNIQUE,
	name VARCHAR(120) NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'fk_artists_image_asset'
	) THEN
		ALTER TABLE artists
			ADD CONSTRAINT fk_artists_image_asset
			FOREIGN KEY (image_asset_id) REFERENCES media_assets(id) ON DELETE SET NULL;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_avatar_asset'
	) THEN
		ALTER TABLE users
			ADD CONSTRAINT fk_users_avatar_asset
			FOREIGN KEY (avatar_asset_id) REFERENCES media_assets(id) ON DELETE SET NULL;
	END IF;
END $$;

-- Business entities
CREATE TABLE IF NOT EXISTS albums (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title VARCHAR(255) NOT NULL,
	cover_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
	release_year INTEGER NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS songs (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title VARCHAR(255) NOT NULL,
	audio_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
	cover_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
	duration INTEGER NOT NULL CHECK (duration >= 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlists (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title VARCHAR(255) NOT NULL,
	description TEXT,
	cover_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
	visibility VARCHAR(20) NOT NULL DEFAULT 'private',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
	provider_id UUID REFERENCES payment_providers(id) ON DELETE SET NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'trialing', 'active', 'past_due', 'canceled', 'expired')),
	started_at TIMESTAMPTZ,
	current_period_start TIMESTAMPTZ,
	current_period_end TIMESTAMPTZ,
	cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
	canceled_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_orders (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
	provider_id UUID REFERENCES payment_providers(id) ON DELETE SET NULL,
	user_subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
	amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),
	currency VARCHAR(3) NOT NULL DEFAULT 'VND',
	status VARCHAR(20) NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'canceled')),
	checkout_url TEXT,
	external_order_id TEXT,
	paid_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	receiver_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	content TEXT NOT NULL,
	read_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE messages
	ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS friendships (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	addressee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	status VARCHAR(20) NOT NULL DEFAULT 'pending'
		CHECK (status IN ('pending', 'accepted', 'rejected')),
	responded_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	CHECK (requester_user_id <> addressee_user_id)
);

CREATE TABLE IF NOT EXISTS user_blocks (
	blocker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (blocker_user_id, blocked_user_id),
	CHECK (blocker_user_id <> blocked_user_id)
);

CREATE TABLE IF NOT EXISTS user_song_plays (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID REFERENCES users(id) ON DELETE CASCADE,
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_song_plays
	ALTER COLUMN user_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS song_ratings (
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (user_id, song_id)
);

CREATE TABLE IF NOT EXISTS song_comments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	token_hash TEXT NOT NULL UNIQUE,
	expires_at TIMESTAMPTZ NOT NULL,
	revoked_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_provider_customers (
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	provider_id UUID NOT NULL REFERENCES payment_providers(id) ON DELETE CASCADE,
	external_customer_id TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (user_id, provider_id),
	UNIQUE (provider_id, external_customer_id)
);

CREATE TABLE IF NOT EXISTS payment_provider_subscriptions (
	user_subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
	provider_id UUID NOT NULL REFERENCES payment_providers(id) ON DELETE CASCADE,
	external_subscription_id TEXT NOT NULL,
	raw_status TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (user_subscription_id, provider_id),
	UNIQUE (provider_id, external_subscription_id)
);

CREATE TABLE IF NOT EXISTS payment_events (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	provider_id UUID NOT NULL REFERENCES payment_providers(id) ON DELETE CASCADE,
	event_type TEXT NOT NULL,
	external_event_id TEXT NOT NULL,
	payload JSONB NOT NULL DEFAULT '{}'::jsonb,
	processed_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (provider_id, external_event_id)
);

-- Relationship tables
CREATE TABLE IF NOT EXISTS album_artists (
	album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
	artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE RESTRICT,
	role VARCHAR(40) NOT NULL DEFAULT 'primary',
	sort_order INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (album_id, artist_id, role)
);

CREATE TABLE IF NOT EXISTS song_artists (
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE RESTRICT,
	role VARCHAR(40) NOT NULL DEFAULT 'primary',
	sort_order INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (song_id, artist_id, role)
);

CREATE TABLE IF NOT EXISTS album_songs (
	album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	track_number INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (album_id, song_id)
);

CREATE TABLE IF NOT EXISTS song_genres (
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE RESTRICT,
	PRIMARY KEY (song_id, genre_id)
);

CREATE TABLE IF NOT EXISTS song_categories (
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
	PRIMARY KEY (song_id, category_id)
);

CREATE TABLE IF NOT EXISTS playlist_songs (
	playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	position INTEGER NOT NULL DEFAULT 0,
	added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (playlist_id, song_id)
);

CREATE TABLE IF NOT EXISTS user_liked_songs (
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (user_id, song_id)
);

CREATE TABLE IF NOT EXISTS plan_features (
	plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
	feature_id UUID NOT NULL REFERENCES subscription_features(id) ON DELETE CASCADE,
	PRIMARY KEY (plan_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_album_songs_song_id ON album_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_song_artists_artist_id ON song_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_album_artists_artist_id ON album_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_song_categories_category_id ON song_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_messages_pair_created ON messages(sender_user_id, receiver_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON messages(receiver_user_id, read_at, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_pair_unique
	ON friendships (
		LEAST(requester_user_id, addressee_user_id),
		GREATEST(requester_user_id, addressee_user_id)
	);
CREATE INDEX IF NOT EXISTS idx_friendships_requester_status ON friendships(requester_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_status ON friendships(addressee_user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_user_id ON user_blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_user_song_plays_user_played ON user_song_plays(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_song_plays_song_id ON user_song_plays(song_id);
CREATE INDEX IF NOT EXISTS idx_song_ratings_song_id ON song_ratings(song_id);
CREATE INDEX IF NOT EXISTS idx_song_comments_song_created ON song_comments(song_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_song_comments_user_id ON song_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_created ON subscription_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_events_provider_type ON payment_events(provider_id, event_type);

INSERT INTO roles (code, name)
VALUES ('user', 'User'), ('admin', 'Administrator')
ON CONFLICT (code) DO NOTHING;

INSERT INTO subscription_plans (code, name, description, price_amount, currency, billing_interval, sort_order)
VALUES
	('free', 'Free', 'Basic listening with standard features.', 0, 'VND', 'none', 0),
	('premium_monthly', 'Premium Monthly', 'Monthly premium access for better music discovery.', 59000, 'VND', 'month', 1),
	('premium_yearly', 'Premium Yearly', 'Yearly premium access with a better long-term price.', 590000, 'VND', 'year', 2)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_amount = EXCLUDED.price_amount,
    currency = EXCLUDED.currency,
    billing_interval = EXCLUDED.billing_interval,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    updated_at = NOW();

INSERT INTO subscription_features (code, name, description)
VALUES
	('unlimited_playlists', 'Unlimited playlists', 'Create and manage unlimited personal playlists.'),
	('high_quality_audio', 'High quality audio', 'Unlock higher quality streaming options when available.'),
	('advanced_recommendations', 'Advanced recommendations', 'Use more listening signals for personalized recommendations.'),
	('premium_badge', 'Premium badge', 'Show premium status on the user profile.')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO plan_features (plan_id, feature_id)
SELECT plan.id, feature.id
FROM subscription_plans plan
CROSS JOIN subscription_features feature
WHERE plan.code IN ('premium_monthly', 'premium_yearly')
ON CONFLICT (plan_id, feature_id) DO NOTHING;

INSERT INTO payment_providers (code, name)
VALUES ('mock', 'Mock payment')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    is_active = true,
    updated_at = NOW();
