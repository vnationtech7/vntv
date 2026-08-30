-- First, get the profile ID for vnationtech7@gmail.com
DO $$
DECLARE
  admin_profile_id UUID;
  admin_author_id UUID;
BEGIN
  -- Get the profile ID
  SELECT id INTO admin_profile_id
  FROM profiles
  WHERE email = 'vnationtech7@gmail.com'
  LIMIT 1;

  -- Only proceed if profile exists
  IF admin_profile_id IS NOT NULL THEN
    -- Check if admin author already exists
    SELECT id INTO admin_author_id
    FROM authors
    WHERE profile_id = admin_profile_id
    LIMIT 1;

    -- Create admin author if it doesn't exist
    IF admin_author_id IS NULL THEN
      INSERT INTO authors (
        profile_id,
        name,
        slug,
        bio,
        is_active,
        social_links
      ) VALUES (
        admin_profile_id,
        'VNTV Admin',
        'vntv-admin',
        'Editorial staff and administration team at VNTV - Africa. Our Stories. Our Way.',
        true,
        '{}'::jsonb
      )
      RETURNING id INTO admin_author_id;

      RAISE NOTICE 'Created admin author with ID: %', admin_author_id;
    ELSE
      RAISE NOTICE 'Admin author already exists with ID: %', admin_author_id;
    END IF;
  ELSE
    RAISE NOTICE 'Profile not found for vnationtech7@gmail.com';
  END IF;
END $$;

-- Show the created author
SELECT 
  a.id,
  a.name,
  a.slug,
  p.email,
  a.is_active
FROM authors a
JOIN profiles p ON a.profile_id = p.id
WHERE p.email = 'vnationtech7@gmail.com';
