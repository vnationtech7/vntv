'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import {
  getPendingComments,
  getFlaggedComments,
  moderateComment,
  togglePinComment,
  type Comment,
} from '@/app/actions/comments';

type Tab = 'pending' | 'flagged';

export function ModerationQueue() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [activeTab]);

  const loadComments = async () => {
    setLoading(true);
    
    if (activeTab === 'pending') {
      const result = await getPendingComments();
      if (result.data) {
        setPendingComments(result.data);
      }
    } else {
      const result = await getFlaggedComments();
      if (result.data) {
        setFlaggedComments(result.data);
      }
    }
    
    setLoading(false);
  };

  const handleModerate = async (
    commentId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    setModerating(commentId);
    
    const result = await moderateComment({
      commentId,
      status,
      moderationReason: reason,
    });

    if (result.error) {
      alert(result.error);
    } else {
      // Remove from list
      setPendingComments(prev => prev.filter(c => c.id !== commentId));
      setFlaggedComments(prev => prev.filter(c => c.id !== commentId));
    }
    
    setModerating(null);
  };

  const handlePin = async (commentId: string, isPinned: boolean) => {
    const result = await togglePinComment(commentId, isPinned);
    
    if (result.error) {
      alert(result.error);
    } else {
      // Update in list
      const updateComment = (comment: Comment) =>
        comment.id === commentId ? { ...comment, is_pinned: isPinned } : comment;
      
      setPendingComments(prev => prev.map(updateComment));
      setFlaggedComments(prev => prev.map(updateComment));
    }
  };

  const comments = activeTab === 'pending' ? pendingComments : flaggedComments;

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Pending Review
            {pendingComments.length > 0 && (
              <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-0.5 px-2 rounded-full text-xs font-semibold">
                {pendingComments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'flagged'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Flagged Comments
            {flaggedComments.length > 0 && (
              <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 py-0.5 px-2 rounded-full text-xs font-semibold">
                {flaggedComments.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && comments.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            All caught up!
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {activeTab === 'pending'
              ? 'No comments pending review'
              : 'No flagged comments to review'}
          </p>
        </div>
      )}

      {/* Comments List */}
      {!loading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              {/* Comment Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.user.avatar_url ? (
                    <Image
                      src={comment.user.avatar_url}
                      alt={comment.user.full_name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {comment.user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.user.full_name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {/* Content Type & ID */}
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    On {comment.content_type}: {comment.content_id.slice(0, 8)}...
                  </div>
                </div>

                {/* Flags Badge */}
                {activeTab === 'flagged' && comment.flag_count > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                    🚩 {comment.flag_count} {comment.flag_count === 1 ? 'flag' : 'flags'}
                  </span>
                )}
              </div>

              {/* Comment Body */}
              <div 
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: comment.body_html || comment.body }}
              />

              {/* Engagement Stats */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>❤️ {comment.like_count} likes</span>
                {comment.reply_count > 0 && (
                  <span>💬 {comment.reply_count} replies</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3">
                {/* Approve */}
                <button
                  onClick={() => handleModerate(comment.id, 'approved')}
                  disabled={moderating === comment.id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {moderating === comment.id ? 'Processing...' : '✓ Approve'}
                </button>

                {/* Reject */}
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason (optional):');
                    handleModerate(comment.id, 'rejected', reason || undefined);
                  }}
                  disabled={moderating === comment.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  ✗ Reject
                </button>

                {/* Pin/Unpin */}
                <button
                  onClick={() => handlePin(comment.id, !comment.is_pinned)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  {comment.is_pinned ? '📌 Unpin' : '📌 Pin'}
                </button>

                {/* View Content */}
                <a
                  href={`/${comment.content_type}s/${comment.content_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto px-4 py-2 text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  View Content →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
