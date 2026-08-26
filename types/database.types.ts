export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database enums
export type ArticleStatus = 
  | 'draft'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'archived'

export type VideoType = 
  | 'news'
  | 'breaking'
  | 'interview'
  | 'documentary'
  | 'short'
  | 'original'
  | 'standalone'

export type VideoSourceType =
  | 'upload'
  | 'youtube'
  | 'external'

export type VideoOrientation =
  | 'horizontal'
  | 'vertical'

export type ContentType =
  | 'article'
  | 'video'
  | 'programme'
  | 'episode'

export type MediaType =
  | 'image'
  | 'video'
  | 'document'

export type UserRole =
  | 'super_admin'
  | 'editor'
  | 'reporter'
  | 'video_editor'
  | 'advertising_manager'

// This will be generated from Supabase schema after migrations
export interface Database {
  public: {
    Tables: {
      // Tables will be defined after migrations
      [key: string]: any
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      article_status: ArticleStatus
      video_type: VideoType
      video_source_type: VideoSourceType
      video_orientation: VideoOrientation
      content_type: ContentType
      media_type: MediaType
      user_role: UserRole
    }
  }
}
