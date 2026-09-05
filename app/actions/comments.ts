'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ContentType = 'article' | 'video' | 'episode';
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'deleted';
export type CommentSortOrder = 'newest' | 'oldest' | 'most_liked';

export interface Comment {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_id: string;
  body: string;
  body_html: string | null;
  parent_comment_id: string | null;
  reply_count: number;
  depth: number;
  like_count: number;
  flag_count: number;
  status: CommentStatus;
  is_pinned: boolean;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  user_has_liked?: boolean;
}

interface GetCommentsParams {
  contentType: ContentType;
  contentId: string;
  sortOrder?: CommentSortOrder;
  limit?: number;
  offset?: number;
}

interface GetRepliesParams {
  parentCommentId: string;
  limit?: number;
  offset?: number;
}

interface CreateCommentParams {
  contentType: ContentType;
  contentId: string;
  body: string;
  parentCommentId?: string;
}

interface UpdateCommentParams {
  commentId: string;
  body: string;
}

interface ModerateCommentParams {
  commentId: string;
  status: CommentStatus;
  moderationReason?: string;
  moderationNote?: string;
}

/**
 * Get comments for a specific content item
 */
export async function getComments({
  contentType,
  contentId,
  sortOrder = 'newest',
  limit = 20,
  offset = 0,
}: GetCommentsParams) {
  try {
    const supabase = await createClient();
    
    // Get current user to check if they liked comments
    const { data: { user } } = await supabase.auth.getUser();

    // Build query for top-level comments only
    let query = supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .is('parent_comment_id', null)
      .eq('status', 'approved');

    // Apply sorting
    switch (sortOrder) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_liked':
        query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return { error: error.message };
    }

    // If user is logged in, check which comments they've liked
    if (user && comments && comments.length > 0) {
      const commentIds = comments.map((c: any) => c.id);
      const { data: userLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);

      const likedCommentIds = new Set(userLikes?.map((l: any) => l.comment_id) || []);

      return {
        data: comments.map((comment: any) => ({
          ...comment,
          user_has_liked: likedCommentIds.has(comment.id),
        })) as Comment[],
      };
    }

    return { data: (comments || []) as Comment[] };
  } catch (error) {
    console.error('Error in getComments:', error);
    return { error: 'Failed to fetch comments' };
  }
}

/**
 * Get replies for a specific comment
 */
export async function getReplies({
  parentCommentId,
  limit = 10,
  offset = 0,
}: GetRepliesParams) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    const { data: replies, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('parent_comment_id', parentCommentId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching replies:', error);
      return { error: error.message };
    }

    // Check which replies user has liked
    if (user && replies && replies.length > 0) {
      const replyIds = replies.map((r: any) => r.id);
      const { data: userLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', replyIds);

      const likedReplyIds = new Set(userLikes?.map((l: any) => l.comment_id) || []);

      return {
        data: replies.map((reply: any) => ({
          ...reply,
          user_has_liked: likedReplyIds.has(reply.id),
        })) as Comment[],
      };
    }

    return { data: (replies || []) as Comment[] };
  } catch (error) {
    console.error('Error in getReplies:', error);
    return { error: 'Failed to fetch replies' };
  }
}

/**
 * Create a new comment
 */
export async function createComment({
  contentType,
  contentId,
  body,
  parentCommentId,
}: CreateCommentParams) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to comment' };
    }

    // Validate comment length
    if (!body || body.trim().length === 0) {
      return { error: 'Comment cannot be empty' };
    }

    if (body.length > 2000) {
      return { error: 'Comment is too long (max 2000 characters)' };
    }

    // Check if comments are enabled
    const { data: settings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'comments_enabled')
      .single();

    if (settings && (settings as any).value === false) {
      return { error: 'Comments are currently disabled' };
    }

    // Check email verification requirement
    const { data: emailVerifySettings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'require_email_verified_to_comment')
      .single();

    if (emailVerifySettings && (emailVerifySettings as any).value === true) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', user.id)
        .single();

      if (profile && !(profile as any).email_verified) {
        return { error: 'Please verify your email address to comment' };
      }
    }

    // Calculate depth for threaded comments
    let depth = 0;
    if (parentCommentId) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('depth')
        .eq('id', parentCommentId)
        .single();

      if (!parentComment) {
        return { error: 'Parent comment not found' };
      }

      depth = (parentComment as any).depth + 1;

      if (depth > 3) {
        return { error: 'Maximum reply depth reached' };
      }
    }

    // Check auto-approval setting
    const { data: autoApproveSettings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'auto_approve_comments')
      .single();

    const status = (autoApproveSettings && (autoApproveSettings as any).value === true) ? 'approved' : 'pending';

    // Simple sanitization (convert to plain text HTML)
    const bodyHtml = body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        content_type: contentType,
        content_id: contentId,
        user_id: user.id,
        body: body.trim(),
        body_html: bodyHtml,
        parent_comment_id: parentCommentId || null,
        depth,
        status,
      } as any)
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return { error: 'Failed to create comment' };
    }

    // Revalidate the content page
    revalidatePath(`/${contentType}s/${contentId}`);

    return { 
      data: comment as Comment,
      message: status === 'pending' 
        ? 'Comment submitted for moderation' 
        : 'Comment posted successfully'
    };
  } catch (error) {
    console.error('Error in createComment:', error);
    return { error: 'Failed to create comment' };
  }
}

/**
 * Update a comment (user can edit their own within time window)
 */
export async function updateComment({ commentId, body }: UpdateCommentParams) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to edit comments' };
    }

    // Validate comment length
    if (!body || body.trim().length === 0) {
      return { error: 'Comment cannot be empty' };
    }

    if (body.length > 2000) {
      return { error: 'Comment is too long (max 2000 characters)' };
    }

    // Get edit window from settings
    const { data: editWindowSettings } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'comment_edit_window_minutes')
      .single();

    const editWindowMinutes = (editWindowSettings && (editWindowSettings as any).value) || 15;

    // Simple sanitization
    const bodyHtml = body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    // Update comment (RLS will check ownership and time window)
    const result = await (supabase as any)
      .from('comments')
      .update({
        body: body.trim(),
        body_html: bodyHtml,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .eq('user_id', user.id)
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();
    
    const { data: comment, error } = result;

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: `Edit window expired (${editWindowMinutes} minutes)` };
      }
      console.error('Error updating comment:', error);
      return { error: 'Failed to update comment' };
    }

    return { data: comment as Comment };
  } catch (error) {
    console.error('Error in updateComment:', error);
    return { error: 'Failed to update comment' };
  }
}

/**
 * Delete a comment (user can delete their own)
 */
export async function deleteComment(commentId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to delete comments' };
    }

    // Delete comment (RLS will check ownership)
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting comment:', error);
      return { error: 'Failed to delete comment' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return { error: 'Failed to delete comment' };
  }
}

/**
 * Moderate a comment (admin/editor only)
 */
export async function moderateComment({
  commentId,
  status,
  moderationReason,
  moderationNote,
}: ModerateCommentParams) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to moderate comments' };
    }

    // Update comment (RLS will check role)
    const result = await (supabase as any)
      .from('comments')
      .update({
        status,
        moderated_by: user.id,
        moderation_reason: moderationReason || null,
        moderation_note: moderationNote || null,
      })
      .eq('id', commentId)
      .select()
      .single();
    
    const { data: comment, error } = result;

    if (error) {
      console.error('Error moderating comment:', error);
      return { error: 'Failed to moderate comment' };
    }

    revalidatePath('/admin/moderation');

    return { data: comment };
  } catch (error) {
    console.error('Error in moderateComment:', error);
    return { error: 'Failed to moderate comment' };
  }
}

/**
 * Pin/unpin a comment (admin/editor only)
 */
export async function togglePinComment(commentId: string, isPinned: boolean) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'Unauthorized' };
    }

    const result = await (supabase as any)
      .from('comments')
      .update({ is_pinned: isPinned })
      .eq('id', commentId);
    
    const { error } = result;

    if (error) {
      console.error('Error toggling pin:', error);
      return { error: 'Failed to pin/unpin comment' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in togglePinComment:', error);
    return { error: 'Failed to pin/unpin comment' };
  }
}

/**
 * Flag a comment
 */
export async function flagComment(
  commentId: string,
  reason: 'spam' | 'offensive' | 'harassment' | 'misinformation' | 'other',
  details?: string
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to flag comments' };
    }

    // Insert flag
    const { error } = await supabase
      .from('comment_flags')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        reason,
        details: details || null,
      } as any);

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { error: 'You have already flagged this comment' };
      }
      console.error('Error flagging comment:', error);
      return { error: 'Failed to flag comment' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in flagComment:', error);
    return { error: 'Failed to flag comment' };
  }
}

/**
 * Get pending comments for moderation (admin/editor only)
 */
export async function getPendingComments(limit = 50, offset = 0) {
  try {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching pending comments:', error);
      return { error: error.message };
    }

    return { data: comments as Comment[] };
  } catch (error) {
    console.error('Error in getPendingComments:', error);
    return { error: 'Failed to fetch pending comments' };
  }
}

/**
 * Get flagged comments for review (admin/editor only)
 */
export async function getFlaggedComments(limit = 50, offset = 0) {
  try {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .gt('flag_count', 0)
      .order('flag_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching flagged comments:', error);
      return { error: error.message };
    }

    return { data: comments as Comment[] };
  } catch (error) {
    console.error('Error in getFlaggedComments:', error);
    return { error: 'Failed to fetch flagged comments' };
  }
}
