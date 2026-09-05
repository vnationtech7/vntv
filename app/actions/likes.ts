'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ContentType = 'article' | 'video' | 'episode';
export type ReactionType = 'like' | 'love' | 'insightful' | 'funny' | 'sad';

/**
 * Toggle like on content (article, video, or episode)
 */
export async function toggleLike(
  contentType: ContentType,
  contentId: string,
  reactionType: ReactionType = 'like'
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to like content' };
    }

    // Check if likes are enabled
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'likes_enabled')
      .single();

    if (settings && (settings as any).value === false) {
      return { error: 'Likes are currently disabled' };
    }

    // Check if user already liked this content
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', (existingLike as any).id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return { error: 'Failed to unlike content' };
      }

      // Get updated like count
      const { data: content } = await supabase
        .from(`${contentType}s`)
        .select('like_count')
        .eq('id', contentId)
        .single();

      revalidatePath(`/${contentType}s/${contentId}`);

      return {
        liked: false,
        likeCount: (content && (content as any).like_count) || 0,
      };
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          reaction_type: reactionType,
        } as any);

      if (insertError) {
        console.error('Error adding like:', insertError);
        return { error: 'Failed to like content' };
      }

      // Get updated like count
      const { data: content } = await supabase
        .from(`${contentType}s`)
        .select('like_count')
        .eq('id', contentId)
        .single();

      revalidatePath(`/${contentType}s/${contentId}`);

      return {
        liked: true,
        likeCount: (content && (content as any).like_count) || 0,
      };
    }
  } catch (error) {
    console.error('Error in toggleLike:', error);
    return { error: 'Failed to toggle like' };
  }
}

/**
 * Check if user has liked specific content
 */
export async function checkIfLiked(contentType: ContentType, contentId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { liked: false };
    }

    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();

    return { liked: !!like };
  } catch (error) {
    console.error('Error in checkIfLiked:', error);
    return { liked: false };
  }
}

/**
 * Toggle like on a comment
 */
export async function toggleCommentLike(commentId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to like comments' };
    }

    // Check if user already liked this comment
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('comment_id', commentId)
      .single();

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', (existingLike as any).id);

      if (deleteError) {
        console.error('Error removing comment like:', deleteError);
        return { error: 'Failed to unlike comment' };
      }

      // Get updated like count
      const { data: comment } = await supabase
        .from('comments')
        .select('like_count')
        .eq('id', commentId)
        .single();

      return {
        liked: false,
        likeCount: (comment && (comment as any).like_count) || 0,
      };
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          user_id: user.id,
          comment_id: commentId,
        } as any);

      if (insertError) {
        console.error('Error adding comment like:', insertError);
        return { error: 'Failed to like comment' };
      }

      // Get updated like count
      const { data: comment } = await supabase
        .from('comments')
        .select('like_count')
        .eq('id', commentId)
        .single();

      return {
        liked: true,
        likeCount: (comment && (comment as any).like_count) || 0,
      };
    }
  } catch (error) {
    console.error('Error in toggleCommentLike:', error);
    return { error: 'Failed to toggle comment like' };
  }
}

/**
 * Get user's liked content
 */
export async function getUserLikes(limit = 20, offset = 0) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in' };
    }

    const { data: likes, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user likes:', error);
      return { error: error.message };
    }

    return { data: likes };
  } catch (error) {
    console.error('Error in getUserLikes:', error);
    return { error: 'Failed to fetch user likes' };
  }
}

/**
 * Get like count for content
 */
export async function getLikeCount(contentType: ContentType, contentId: string) {
  try {
    const supabase = await createClient();

    const { data: content, error } = await supabase
      .from(`${contentType}s`)
      .select('like_count')
      .eq('id', contentId)
      .single();

    if (error) {
      console.error('Error fetching like count:', error);
      return { count: 0 };
    }

    return { count: (content && (content as any).like_count) || 0 };
  } catch (error) {
    console.error('Error in getLikeCount:', error);
    return { count: 0 };
  }
}
