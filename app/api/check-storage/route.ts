import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        buckets: []
      });
    }

    const requiredBuckets = ['media', 'videos'];
    const existingBucketNames = buckets?.map(b => b.name) || [];
    
    const status = requiredBuckets.map(name => {
      const bucket = buckets?.find(b => b.name === name);
      return {
        name,
        exists: existingBucketNames.includes(name),
        public: bucket?.public || false,
        id: bucket?.id || null,
        created_at: bucket?.created_at || null
      };
    });

    return NextResponse.json({
      success: true,
      buckets: buckets?.map(b => ({
        name: b.name,
        public: b.public,
        id: b.id,
        created_at: b.created_at
      })) || [],
      requiredBuckets: status,
      missingBuckets: status.filter(b => !b.exists).map(b => b.name)
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      buckets: []
    });
  }
}
