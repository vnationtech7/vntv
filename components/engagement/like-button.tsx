'use client';

import { useState } from 'react';
import { toggleLike, type ContentType } from '@/app/actions/likes';
import { useAuth } from '@/hooks/use-auth';

interface LikeButtonProps {
  contentType: ContentType;
  contentId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LikeButton({
  contentType,
  contentId,
  initialLiked = false,
  initialLikeCount = 0,
  showCount = true,
  size = 'md',
  className = '',
}: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = async () => {
    if (!user) {
      alert('Please sign in to like content');
      return;
    }

    // Optimistic update
    const previousLiked = liked;
    const previousCount = likeCount;
    
    setLiked(!liked);
    setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);
    setIsAnimating(true);

    setTimeout(() => setIsAnimating(false), 600);

    const result = await toggleLike(contentType, contentId);

    if (result.error) {
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      alert(result.error);
    } else if (result.likeCount !== undefined) {
      // Update with actual count from server
      setLiked(result.liked!);
      setLikeCount(result.likeCount);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 transition-all ${
        liked
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
      } ${className}`}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      {/* Heart Icon */}
      <svg
        className={`${sizeClasses[size]} transition-all ${
          isAnimating ? 'scale-125' : 'scale-100'
        }`}
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>

      {/* Count */}
      {showCount && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          {likeCount > 0 ? likeCount.toLocaleString() : 'Like'}
        </span>
      )}
    </button>
  );
}
