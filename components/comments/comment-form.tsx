'use client';

import { useState } from 'react';
import { createComment, updateComment, type Comment, type ContentType } from '@/app/actions/comments';
import { useAuth } from '@/hooks/use-auth';

interface CommentFormProps {
  contentType: ContentType;
  contentId: string;
  parentCommentId?: string;
  existingComment?: Comment;
  onCommentCreated: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  contentType,
  contentId,
  parentCommentId,
  existingComment,
  onCommentCreated,
  onCancel,
  placeholder = 'Share your thoughts...',
}: CommentFormProps) {
  const { user } = useAuth();
  const [body, setBody] = useState(existingComment?.body || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 2000;
  const isEditing = !!existingComment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in to comment');
      return;
    }

    if (!body.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (body.length > maxLength) {
      setError(`Comment is too long (max ${maxLength} characters)`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let result;
      
      if (isEditing) {
        result = await updateComment({
          commentId: existingComment.id,
          body: body.trim(),
        });
      } else {
        result = await createComment({
          contentType,
          contentId,
          body: body.trim(),
          parentCommentId,
        });
      }

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        onCommentCreated(result.data);
        setBody('');
        
        // Show success message if pending moderation
        if (result.message && result.data.status === 'pending') {
          alert(result.message);
        }
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please{' '}
          <a href="/auth/signin" className="text-red-600 dark:text-red-400 hover:underline">
            sign in
          </a>{' '}
          to comment
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Textarea */}
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={4}
          maxLength={maxLength}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          disabled={submitting}
        />
        
        {/* Character Counter */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${
            body.length > maxLength * 0.9
              ? 'text-red-600 dark:text-red-400 font-semibold'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {body.length} / {maxLength}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !body.trim() || body.length > maxLength}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {isEditing ? 'Updating...' : 'Posting...'}
            </span>
          ) : (
            <span>{isEditing ? 'Update Comment' : 'Post Comment'}</span>
          )}
        </button>

        {(isEditing || onCancel) && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
