-- =====================================================
-- RSS INGESTION CRON JOB
-- Runs every 4 hours to fetch RSS feeds
-- =====================================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the RSS ingestion API
CREATE OR REPLACE FUNCTION trigger_rss_ingestion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_status INT;
  response_body TEXT;
  api_url TEXT;
  service_key TEXT;
BEGIN
  -- Get environment variables
  -- Note: In production, use your actual Supabase project URL
  api_url := current_setting('app.settings.project_url', true) || '/api/rss/ingest';
  service_key := current_setting('app.settings.service_role_key', true);

  -- If settings are not configured, use fallback
  IF api_url IS NULL OR api_url = '/api/rss/ingest' THEN
    -- This will be replaced with actual project URL in production
    api_url := 'http://localhost:3000/api/rss/ingest';
  END IF;

  -- Make HTTP request to ingestion endpoint
  -- Using pg_net extension for HTTP requests
  BEGIN
    SELECT 
      net.http_post(
        url := api_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(service_key, '')
        ),
        body := '{}'::jsonb
      ) INTO response_status;

    -- Log the result
    RAISE NOTICE 'RSS ingestion triggered. Status: %', response_status;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'RSS ingestion request failed: %', SQLERRM;
  END;
END;
$$;

-- Schedule the cron job to run every 4 hours
-- Cron expression: 0 */4 * * * (at minute 0 of every 4th hour)
SELECT cron.schedule(
  'rss-feed-ingestion',           -- Job name
  '0 */4 * * *',                  -- Cron expression: every 4 hours
  $$SELECT trigger_rss_ingestion();$$
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION trigger_rss_ingestion() TO postgres;

-- =====================================================
-- ALTERNATIVE: Direct database-based ingestion
-- (Use if HTTP calls are not available)
-- =====================================================

-- Create a function for direct RSS ingestion from database
CREATE OR REPLACE FUNCTION ingest_rss_feeds_direct()
RETURNS TABLE(
  feed_id UUID,
  feed_name TEXT,
  status TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  feed_record RECORD;
BEGIN
  -- This is a placeholder for direct database ingestion
  -- The actual RSS fetching should be done via the API route
  -- since database functions cannot make external HTTP requests easily
  
  -- Return feeds that need processing
  RETURN QUERY
  SELECT 
    id::UUID as feed_id,
    name::TEXT as feed_name,
    'pending'::TEXT as status,
    'Use API endpoint for actual ingestion'::TEXT as message
  FROM rss_feeds
  WHERE is_enabled = true
  ORDER BY last_fetched_at NULLS FIRST
  LIMIT 10;
END;
$$;

-- =====================================================
-- MONITORING & MAINTENANCE
-- =====================================================

-- View to monitor cron job status
CREATE OR REPLACE VIEW rss_cron_status AS
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
WHERE jobname = 'rss-feed-ingestion';

-- Function to manually trigger ingestion (for testing)
CREATE OR REPLACE FUNCTION manual_rss_trigger()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM trigger_rss_ingestion();
  RETURN 'RSS ingestion triggered successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant permissions
GRANT SELECT ON rss_cron_status TO authenticated;
GRANT EXECUTE ON FUNCTION manual_rss_trigger() TO authenticated;

-- =====================================================
-- NOTES FOR DEPLOYMENT
-- =====================================================
-- 
-- 1. After deploying, set these Supabase project settings:
--    - app.settings.project_url = 'https://your-project.vercel.app'
--    - app.settings.service_role_key = 'your-service-role-key'
--
-- 2. To set these in Supabase:
--    ALTER DATABASE postgres SET app.settings.project_url = 'https://your-domain.com';
--    ALTER DATABASE postgres SET app.settings.service_role_key = 'your-key';
--
-- 3. To view cron jobs:
--    SELECT * FROM cron.job;
--
-- 4. To manually trigger (for testing):
--    SELECT manual_rss_trigger();
--
-- 5. To disable the cron job:
--    SELECT cron.unschedule('rss-feed-ingestion');
--
-- 6. To re-enable with different schedule:
--    SELECT cron.unschedule('rss-feed-ingestion');
--    SELECT cron.schedule('rss-feed-ingestion', '0 */4 * * *', 
--      $$SELECT trigger_rss_ingestion();$$);
--
