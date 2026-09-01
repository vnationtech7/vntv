-- Newsletter Enhancements Migration
-- Add unsubscribe_token and preferences columns to newsletter_subscribers

-- Add unsubscribe_token for secure one-click unsubscribe links
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE;

-- Add preferences JSONB for future newsletter customization
-- Example: {"frequency": "daily", "topics": ["ghana", "politics"], "format": "html"}
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add index for unsubscribe_token lookups
CREATE INDEX IF NOT EXISTS newsletter_subscribers_unsubscribe_token_idx 
ON newsletter_subscribers(unsubscribe_token) 
WHERE unsubscribe_token IS NOT NULL;

-- Add index for verification_token lookups
CREATE INDEX IF NOT EXISTS newsletter_subscribers_verification_token_idx 
ON newsletter_subscribers(verification_token) 
WHERE verification_token IS NOT NULL;

-- Add index for active subscribers
CREATE INDEX IF NOT EXISTS newsletter_subscribers_is_active_idx 
ON newsletter_subscribers(is_active) 
WHERE is_active = true;

-- Add comment
COMMENT ON COLUMN newsletter_subscribers.unsubscribe_token IS 'Secure token for one-click unsubscribe links';
COMMENT ON COLUMN newsletter_subscribers.preferences IS 'Subscriber preferences (frequency, topics, format)';
