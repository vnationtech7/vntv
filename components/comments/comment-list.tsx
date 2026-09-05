'use client';

import { CommentCard } from './comment-card';
import type { Comment, ContentType } from '@/app/actions/comments';

interface CommentListProps {
  comments: Comment[];
  contentType: ContentType;
  contentId: string;
  onCommentDeleted: (commentId: string) => void;
  onCommentUpdated: (comment: Comment) => void;
  onReplyCreated: (comment: Comment) => void;
}

export function CommentList({
  comments,
  contentType,
  contentId,
  onCommentDeleted,
  onCommentUpdated,
  onReplyCreated,
}: CommentListProps) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          contentType={contentType}
          contentId={contentId}
          onDeleted={onCommentDeleted}
          onUpdated={onCommentUpdated}
          onReplyCreated={onReplyCreated}
        />
      ))}
    </div>
  );
}
