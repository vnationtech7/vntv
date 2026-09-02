-- Fix Politics category name
-- Current: "Name: Politics"
-- Should be: "Politics"

-- Check current value
SELECT id, name, slug, description FROM categories WHERE slug = 'politics';

-- Fix the name
UPDATE categories 
SET name = 'Politics'
WHERE slug = 'politics';

-- Verify the fix
SELECT id, name, slug, description FROM categories WHERE slug = 'politics';
