-- Add missing foreign key constraint from advertisements to sponsorships
-- This fixes the "Could not find a relationship" error

ALTER TABLE advertisements
ADD CONSTRAINT advertisements_sponsor_id_fkey 
FOREIGN KEY (sponsor_id) 
REFERENCES sponsorships(id) 
ON DELETE SET NULL;

-- Add comment for clarity
COMMENT ON COLUMN advertisements.sponsor_id IS 'Reference to sponsorships table for sponsored advertisements';
