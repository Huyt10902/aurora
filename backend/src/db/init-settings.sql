-- Create app_settings table for global app configuration
CREATE TABLE IF NOT EXISTS app_settings (
	key VARCHAR(100) PRIMARY KEY,
	value TEXT NOT NULL,
	description TEXT,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO app_settings (key, value, description)
VALUES ('rick_roll_mode', 'false', 'Enable Rick Roll easter egg for non-subscribers')
ON CONFLICT (key) DO NOTHING;
