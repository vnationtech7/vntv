// Extended Supabase types for new tables
// This file provides basic type definitions for the comments & likes tables
// until you run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

declare module '@supabase/supabase-js' {
  interface Database {
    public: {
      Tables: {
        comments: {
          Row: {
            id: string;
            content_type: 'article' | 'video' | 'episode';
            content_id: string;
            user_id: string;
            body: string;
            body_html: string | null;
            parent_comment_id: string | null;
            reply_count: number;
            depth: number;
            like_count: number;
            flag_count: number;
            status: 'pending' | 'approved' | 'rejected' | 'deleted';
            is_pinned: boolean;
            is_edited: boolean;
            edited_at: string | null;
            moderated_by: string | null;
            moderation_reason: string | null;
            moderation_note: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: Partial<Database['public']['Tables']['comments']['Row']>;
          Update: Partial<Database['public']['Tables']['comments']['Row']>;
        };
        likes: {
          Row: {
            id: string;
            content_type: 'article' | 'video' | 'episode';
            content_id: string;
            user_id: string;
            reaction_type: 'like' | 'love' | 'insightful' | 'funny' | 'sad';
            created_at: string;
          };
          Insert: Partial<Database['public']['Tables']['likes']['Row']>;
          Update: Partial<Database['public']['Tables']['likes']['Row']>;
        };
        comment_likes: {
          Row: {
            id: string;
            comment_id: string;
            user_id: string;
            created_at: string;
          };
          Insert: Partial<Database['public']['Tables']['comment_likes']['Row']>;
          Update: Partial<Database['public']['Tables']['comment_likes']['Row']>;
        };
        comment_flags: {
          Row: {
            id: string;
            comment_id: string;
            user_id: string;
            reason: 'spam' | 'offensive' | 'harassment' | 'misinformation' | 'other';
            details: string | null;
            status: 'pending' | 'reviewed' | 'dismissed';
            reviewed_by: string | null;
            reviewed_at: string | null;
            review_note: string | null;
            created_at: string;
          };
          Insert: Partial<Database['public']['Tables']['comment_flags']['Row']>;
          Update: Partial<Database['public']['Tables']['comment_flags']['Row']>;
        };
      };
    };
  }
}

export {};
