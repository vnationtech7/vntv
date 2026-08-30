/**
 * Script to create the default admin author in Supabase
 * Run with: npx tsx scripts/create-admin-author.ts
 */

import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function fetchSupabase(endpoint: string, options: RequestInit = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase API error: ${response.status} - ${error}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function createAdminAuthor() {
  console.log('🔍 Looking for admin profile...');

  // Get the admin profile
  const profiles = await fetchSupabase('profiles?email=eq.vnationtech7@gmail.com&select=id,email');

  if (!profiles || profiles.length === 0) {
    console.error('❌ Admin profile not found for vnationtech7@gmail.com');
    console.error('Please make sure you are signed in with this account first.');
    return;
  }

  const profile = profiles[0];
  console.log(`✅ Found admin profile: ${profile.email}`);

  // Check if admin author already exists
  const existingAuthors = await fetchSupabase(`authors?profile_id=eq.${profile.id}&select=id,name,slug`);

  if (existingAuthors && existingAuthors.length > 0) {
    const existingAuthor = existingAuthors[0];
    console.log(`ℹ️  Admin author already exists: ${existingAuthor.name} (${existingAuthor.slug})`);
    console.log(`   Author ID: ${existingAuthor.id}`);
    return;
  }

  // Create the admin author
  console.log('📝 Creating admin author...');
  const newAuthor = {
    profile_id: profile.id,
    name: 'VNTV Admin',
    slug: 'vntv-admin',
    bio: 'Editorial staff and administration team at VNTV - Africa. Our Stories. Our Way.',
    is_active: true,
    social_links: {},
  };

  const authors = await fetchSupabase('authors', {
    method: 'POST',
    body: JSON.stringify(newAuthor),
  });

  if (!authors || authors.length === 0) {
    console.error('❌ Error creating admin author');
    return;
  }

  const author = authors[0];
  console.log('✅ Admin author created successfully!');
  console.log(`   Name: ${author.name}`);
  console.log(`   Slug: ${author.slug}`);
  console.log(`   ID: ${author.id}`);
  console.log('\n✨ You can now select "VNTV Admin" as the author when creating articles!');
}

createAdminAuthor()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
