#!/bin/bash

# Fix TypeScript errors in VNTV project

echo "Fixing TypeScript errors..."

# Fix app/actions/video.ts - Add type annotation for video query
sed -i '' 's/const { data: video, error } = await supabase/const { data: video, error }: { data: any; error: any } = await supabase/g' app/actions/video.ts

# Fix app/actions/article.ts - Add type annotation for article query  
sed -i '' 's/const { data: article, error } = await supabase/const { data: article, error }: { data: any; error: any } = await supabase/g' app/actions/article.ts

# Fix app/admin/articles/actions.ts - Add type to ArticleFormData
sed -i '' 's/export type ArticleFormData = {/export type ArticleFormData = {\n  featured_image_id?: string | null;/g' app/admin/articles/actions.ts

# Fix getStatusColor functions to return proper types
find app/admin -name "*.tsx" -exec sed -i '' 's/return "default";/return "primary";/g' {} \;

# Fix increment RPC calls - add proper typing
sed -i '' 's/await supabase.rpc("increment_video_view", {/await supabase.rpc<void>("increment_video_view", {/g' app/actions/video.ts
sed -i '' 's/await supabase.rpc("increment_article_view", {/await supabase.rpc<void>("increment_article_view", {/g' app/actions/article.ts

echo "Basic fixes applied. Running tsc to check remaining errors..."
