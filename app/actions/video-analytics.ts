// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type VideoAnalyticsEvent = {
  id: string;
  video_id: string;
  event_type: string; // 'start', 'progress_25', 'progress_50', 'progress_75', 'complete', 'gate_shown', 'gate_authenticated'
  event_data: Record<string, any> | null;
  created_at: string;
  user_id: string | null;
  session_id: string | null;
};

/**
 * Track video analytics event
 */
export async function trackVideoEvent(
  videoId: string,
  eventType: string,
  eventData?: Record<string, any>
) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Get or create session ID from cookie
    let sessionId = cookieStore.get('video_session_id')?.value;
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      cookieStore.set('video_session_id', sessionId, {
        maxAge: 60 * 60 * 24, // 24 hours
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    // Insert analytics event
    const { error } = await supabase
      .from('video_analytics')
      .insert({
        video_id: videoId,
        event_type: eventType,
        event_data: eventData || null,
        user_id: user?.id || null,
        session_id: sessionId,
      });

    if (error) {
      console.error('Error tracking video event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Error tracking video event:', err);
    return { success: false, error: 'Failed to track event' };
  }
}

/**
 * Track video view (increment view count)
 */
export async function trackVideoView(videoId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  try {
    // Check if user has already viewed this video (using cookie to prevent duplicate counts)
    const viewedKey = `video_viewed_${videoId}`;
    const hasViewed = cookieStore.get(viewedKey);

    console.log('[VIDEO ANALYTICS] trackVideoView:', {
      videoId,
      hasViewed: !!hasViewed,
      timestamp: new Date().toISOString()
    });

    if (hasViewed) {
      // Already counted this view
      console.log('[VIDEO ANALYTICS] View already counted (cookie exists)');
      return { success: true, counted: false };
    }

    // Increment view count using RPC function
    const { error } = await supabase.rpc('increment_video_view', {
      video_id: videoId,
    });

    if (error) {
      console.error('[VIDEO ANALYTICS] Error incrementing video view:', error);
      return { success: false, counted: false, error: error.message };
    }

    console.log('[VIDEO ANALYTICS] View counted successfully');

    // Set cookie to prevent duplicate counting (expires in 24 hours)
    cookieStore.set(viewedKey, '1', {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    });

    // Also track as analytics event
    await trackVideoEvent(videoId, 'view', {
      timestamp: Date.now(),
    });

    return { success: true, counted: true };
  } catch (err) {
    console.error('[VIDEO ANALYTICS] Exception tracking video view:', err);
    return { success: false, counted: false, error: String(err) };
  }
}

/**
 * Get video analytics summary
 */
export async function getVideoAnalytics(videoId: string) {
  const supabase = await createClient();

  try {
    // Get event counts by type
    const { data: events, error } = await supabase
      .from('video_analytics')
      .select('event_type')
      .eq('video_id', videoId);

    if (error) {
      console.error('Error fetching video analytics:', error);
      return { data: null, error: error.message };
    }

    // Count events by type
    const analytics = {
      total_views: 0,
      starts: 0,
      progress_25: 0,
      progress_50: 0,
      progress_75: 0,
      completions: 0,
      gates_shown: 0,
      gates_authenticated: 0,
    };

    events?.forEach((event) => {
      switch (event.event_type) {
        case 'view':
          analytics.total_views++;
          break;
        case 'start':
          analytics.starts++;
          break;
        case 'progress_25':
          analytics.progress_25++;
          break;
        case 'progress_50':
          analytics.progress_50++;
          break;
        case 'progress_75':
          analytics.progress_75++;
          break;
        case 'complete':
          analytics.completions++;
          break;
        case 'gate_shown':
          analytics.gates_shown++;
          break;
        case 'gate_authenticated':
          analytics.gates_authenticated++;
          break;
      }
    });

    // Calculate engagement metrics
    const engagement = {
      ...analytics,
      completion_rate: analytics.starts > 0 
        ? ((analytics.completions / analytics.starts) * 100).toFixed(2) 
        : '0.00',
      gate_conversion_rate: analytics.gates_shown > 0
        ? ((analytics.gates_authenticated / analytics.gates_shown) * 100).toFixed(2)
        : '0.00',
    };

    return { data: engagement, error: null };
  } catch (err) {
    console.error('Error fetching video analytics:', err);
    return { data: null, error: 'Failed to fetch analytics' };
  }
}
