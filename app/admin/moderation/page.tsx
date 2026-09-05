import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ModerationQueue } from '@/components/admin/moderation-queue';

export const metadata = {
  title: 'Comment Moderation | VNTV Admin',
  description: 'Moderate user comments and review flagged content',
};

export default async function ModerationPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user has moderation permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'editor'].includes((profile as any).role)) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Comment Moderation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and moderate user comments, manage flags, and maintain community standards.
          </p>
        </div>

        {/* Moderation Queue */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
            </div>
          }
        >
          <ModerationQueue />
        </Suspense>
      </div>
    </div>
  );
}
