/**
 * Script to check Supabase Storage bucket configuration
 * Run with: npx tsx scripts/check-storage.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://natnvyrukhheaaksfaug.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ No Supabase key found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorageBuckets() {
  console.log('🔍 Checking Supabase Storage buckets...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

  try {
    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      console.log('\n💡 This might mean:');
      console.log('   1. Your API key doesn\'t have storage permissions');
      console.log('   2. Storage is not enabled in your Supabase project');
      console.log('   3. Network connectivity issue\n');
      return;
    }

    console.log(`✅ Found ${buckets?.length || 0} bucket(s)\n`);

    // Check for required buckets
    const requiredBuckets = ['media', 'videos'];
    const existingBucketNames = buckets?.map(b => b.name) || [];

    console.log('📦 Required buckets status:\n');

    for (const bucketName of requiredBuckets) {
      const exists = existingBucketNames.includes(bucketName);
      const bucket = buckets?.find(b => b.name === bucketName);

      if (exists && bucket) {
        console.log(`✅ ${bucketName}`);
        console.log(`   - Public: ${bucket.public ? '✅ Yes' : '❌ No (should be public)'}`);
        console.log(`   - ID: ${bucket.id}`);
        console.log(`   - Created: ${bucket.created_at}`);
        
        if (bucket.file_size_limit) {
          const limitMB = bucket.file_size_limit / (1024 * 1024);
          console.log(`   - File size limit: ${limitMB}MB`);
        }
        
        if (bucket.allowed_mime_types && bucket.allowed_mime_types.length > 0) {
          console.log(`   - Allowed types: ${bucket.allowed_mime_types.join(', ')}`);
        }
        console.log('');
      } else {
        console.log(`❌ ${bucketName} - NOT FOUND`);
        console.log(`   → Need to create this bucket\n`);
      }
    }

    // Provide instructions if buckets are missing
    const missingBuckets = requiredBuckets.filter(name => !existingBucketNames.includes(name));

    if (missingBuckets.length > 0) {
      console.log('\n🛠️  ACTION REQUIRED:\n');
      console.log(`Missing buckets: ${missingBuckets.join(', ')}\n`);
      console.log('Create them using one of these methods:\n');
      console.log('1. Supabase Dashboard (Recommended):');
      console.log(`   → Go to: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}`);
      console.log('   → Navigate to Storage → New bucket');
      console.log('   → Create buckets with these names: ' + missingBuckets.join(', '));
      console.log('   → Enable "Public bucket" for each\n');
      console.log('2. SQL Editor:');
      console.log('   → See STORAGE_SETUP.md for SQL commands\n');
    } else {
      console.log('\n✅ All required buckets exist!\n');
      
      // Check if buckets are public
      const nonPublicBuckets = buckets?.filter(b => 
        requiredBuckets.includes(b.name) && !b.public
      );

      if (nonPublicBuckets && nonPublicBuckets.length > 0) {
        console.log('⚠️  WARNING: Some buckets are not public:');
        nonPublicBuckets.forEach(b => console.log(`   - ${b.name}`));
        console.log('\n   Images won\'t be accessible publicly.');
        console.log('   Enable "Public bucket" in Supabase Dashboard.\n');
      }
    }

    // Test upload permissions (optional)
    console.log('🧪 Testing upload permissions...\n');
    
    for (const bucketName of existingBucketNames.filter(name => requiredBuckets.includes(name))) {
      try {
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = 'Test file for permission check';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(testFileName, testContent, {
            contentType: 'text/plain',
            upsert: false
          });

        if (uploadError) {
          console.log(`❌ ${bucketName}: Cannot upload (${uploadError.message})`);
        } else {
          console.log(`✅ ${bucketName}: Upload successful`);
          
          // Clean up test file
          await supabase.storage.from(bucketName).remove([testFileName]);
          console.log(`   ✓ Test file cleaned up`);
        }
      } catch (err) {
        console.log(`❌ ${bucketName}: Upload test failed`);
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the check
checkStorageBuckets().then(() => {
  console.log('\n✨ Storage check complete\n');
});
