'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { CommentForm } from './comment-form';
import { toggleCommentLike } from '@/app/actions/likes';
import { deleteComment, getReplies, flagComment, type Comment, type ContentType } from '@/app/actions/comments';
import { useAuth } from '@/hooks/use-auth';

interface CommentCardProps {
  comment: Comment;
  contentType: ContentType;
  contentId: string;
  onDeleted: (commentId: string) => void;
  onUpdated: (comment: Comment) => void;
  onReplyCreated: (comment: Comment) => void;
  isReply?: boolean;
}

export function CommentCard({
  comment,
  contentType,
  contentId,
  onDeleted,
  onUpdated,
  onReplyCreated,
  isReply = false,
}: CommentCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [liked, setLiked] = useState(comment.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const canReply = comment.depth < 3 && !isReply;

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like comments');
      return;
    }

    // Optimistic update
    const previousLiked = liked;
    const previousCount = likeCount;
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    const result = await toggleCommentLike(comment.id);
    
    if (result.error) {
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      alert(result.error);
    } else if (result.likeCount !== undefined) {
      setLikeCount(result.likeCount);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteComment(comment.id);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      onDeleted(comment.id);
    }
  };

  const handleLoadReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoadingReplies(true);
    const result = await getReplies({ parentCommentId: comment.id });
    
    if (result.error) {
      alert(result.error);
    } else if (result.data) {
      setReplies(result.data);
      setShowReplies(true);
    }
    
    setLoadingReplies(false);
  };

  const handleReplyCreated = (newReply: Comment) => {
    setReplies(prev => [...prev, newReply]);
    setIsReplying(false);
    onReplyCreated(newReply);
  };

  const handleReplyDeleted = (replyId: string) => {
    setReplies(prev => prev.filter(r => r.id !== replyId));
  };

  const handleFlag = async (reason: string, details?: string) => {
    if (!user) {
      alert('Please sign in to report comments');
      return;
    }

    const result = await flagComment(
      comment.id,
      reason as 'spam' | 'offensive' | 'harassment' | 'misinformation' | 'other',
      details
    );

    if (result.error) {
      alert(result.error);
    } else {
      alert('Comment reported. Thank you for helping keep our community safe.');
      setShowFlagDialog(false);
    }
  };

  if (isDeleting) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-pulse">
        <p className="text-sm text-gray-500 dark:text-gray-400">Deleting comment...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <CommentForm
        contentType={contentType}
        contentId={contentId}
        existingComment={comment}
        onCommentCreated={(updated) => {
          onUpdated(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user.avatar_url ? (
            <Image
              src={comment.user.avatar_url}
              alt={comment.user.full_name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {comment.user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white">
              {comment.user.full_name}
            </span>
            
            {comment.is_pinned && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                📌 Pinned
              </span>
            )}
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            
            {comment.is_edited && (
              <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
            )}
          </div>

          {/* Body */}
          <div 
            className="mt-2 text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: comment.body_html || comment.body }}
          />

          {/* Actions */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                liked
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <svg
                className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
                fill={liked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{likeCount > 0 ? likeCount : 'Like'}</span>
            </button>

            {/* Reply Button */}
            {canReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Reply
              </button>
            )}

            {/* Edit Button */}
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Edit
              </button>
            )}

            {/* Delete Button */}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            )}

            {/* Flag Button */}
            {!isOwner && user && (
              <button
                onClick={() => setShowFlagDialog(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Report
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4">
              <CommentForm
                contentType={contentType}
                contentId={contentId}
                parentCommentId={comment.id}
                onCommentCreated={handleReplyCreated}
                onCancel={() => setIsReplying(false)}
                placeholder="Write a reply..."
              />
            </div>
          )}

          {/* Show Replies Button */}
          {comment.reply_count > 0 && (
            <button
              onClick={handleLoadReplies}
              className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              disabled={loadingReplies}
            >
              {loadingReplies ? (
                'Loading...'
              ) : showReplies ? (
                `Hide ${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}`
              ) : (
                `Show ${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}`
              )}
            </button>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  contentType={contentType}
                  contentId={contentId}
                  onDeleted={handleReplyDeleted}
                  onUpdated={onUpdated}
                  onReplyCreated={onReplyCreated}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flag Dialog */}
      {showFlagDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Comment
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleFlag(
                  formData.get('reason') as string,
                  formData.get('details') as string
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason
                  </label>
                  <select
                    name="reason"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="spam">Spam</option>
                    <option value="offensive">Offensive Content</option>
                    <option value="harassment">Harassment</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    name="details"
                    rows={3}
                    maxLength={500}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Provide more context..."
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFlagDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
