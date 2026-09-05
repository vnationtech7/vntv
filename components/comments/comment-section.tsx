'use client';

import { useState, useEffect } from 'react';
import { CommentList } from './comment-list';
import { CommentForm } from './comment-form';
import { getComments, type Comment, type ContentType, type CommentSortOrder } from '@/app/actions/comments';

interface CommentSectionProps {
  contentType: ContentType;
  contentId: string;
  initialCommentCount?: number;
}

export function CommentSection({ contentType, contentId, initialCommentCount = 0 }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>('newest');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const loadComments = async (resetOffset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = resetOffset ? 0 : offset;
      
      const result = await getComments({
        contentType,
        contentId,
        sortOrder,
        limit,
        offset: currentOffset,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        if (resetOffset) {
          setComments(result.data);
          setOffset(result.data.length);
        } else {
          setComments(prev => [...prev, ...result.data!]);
          setOffset(prev => prev + result.data!.length);
        }
        
        setHasMore(result.data.length === limit);
        
        // Update comment count if we have fresh data
        if (resetOffset && result.data.length > 0) {
          setCommentCount(result.data.length);
        }
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentType, contentId, sortOrder]);

  const handleCommentCreated = (newComment: Comment) => {
    // Add new comment to the top if it's approved
    if (newComment.status === 'approved') {
      setComments(prev => [newComment, ...prev]);
      setCommentCount(prev => prev + 1);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setCommentCount(prev => Math.max(0, prev - 1));
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev => 
      prev.map(c => c.id === updatedComment.id ? updatedComment : c)
    );
  };

  const handleLoadMore = () => {
    loadComments(false);
  };

  return (
    <section className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comments {commentCount > 0 && (
              <span className="text-gray-500 dark:text-gray-400">({commentCount})</span>
            )}
          </h2>

          {/* Sort Controls */}
          {comments.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="sort-order" className="text-sm text-gray-600 dark:text-gray-400">
                Sort by:
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as CommentSortOrder)}
                className="text-sm border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_liked">Most Liked</option>
              </select>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="mb-8">
          <CommentForm
            contentType={contentType}
            contentId={contentId}
            onCommentCreated={handleCommentCreated}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && comments.length === 0 && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments List */}
        {!loading && comments.length === 0 && !error && (
          <div className="text-center py-12">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}

        {comments.length > 0 && (
          <CommentList
            comments={comments}
            contentType={contentType}
            contentId={contentId}
            onCommentDeleted={handleCommentDeleted}
            onCommentUpdated={handleCommentUpdated}
            onReplyCreated={handleCommentCreated}
          />
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Load More Comments
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loading && comments.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        )}
      </div>
    </section>
  );
}
