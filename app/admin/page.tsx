// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAnyStaffRole } from "@/lib/auth/server-authorization";
import { AdminLayout } from "@/components/cms/admin-layout";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Video,
  Users,
  Folder,
  Grid,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  PlayCircle,
  Rss,
  Image as ImageIcon,
  TrendingUp,
  UserPlus,
  Film,
} from "lucide-react";

export const metadata = {
  title: "Dashboard - VNTV CMS",
  description: "VNTV Content Management System",
};

export default async function AdminDashboard() {
  // Require any staff role to access dashboard
  await requireAnyStaffRole();

  const supabase = await createClient();

  // Fetch comprehensive dashboard stats
  const [
    articlesResult,
    videosResult,
    rssItemsResult,
    rssFeedsResult,
    categoriesResult,
    tagsResult,
    authorsResult,
    usersResult,
    mediaResult,
    originalsResult,
  ] = await Promise.all([
    supabase.from("articles").select("id, status, view_count", { count: "exact" }),
    supabase.from("videos").select("id, status, video_type, view_count", { count: "exact" }),
    supabase.from("rss_items").select("id, status", { count: "exact" }),
    supabase.from("rss_feeds").select("id, enabled", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("tags").select("id", { count: "exact" }),
    supabase.from("authors").select("id", { count: "exact" }),
    supabase.from("user_profiles").select("id, created_at", { count: "exact" }),
    supabase.from("media_assets").select("id, mime_type", { count: "exact" }),
    supabase.from("originals").select("id, status", { count: "exact" }),
  ]);

  // Articles stats
  const totalArticles = articlesResult.count || 0;
  const draftArticles = articlesResult.data?.filter((a) => a.status === "draft").length || 0;
  const reviewArticles = articlesResult.data?.filter((a) => a.status === "review").length || 0;
  const publishedArticles = articlesResult.data?.filter((a) => a.status === "published").length || 0;
  const totalArticleViews = articlesResult.data?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;

  // Videos stats
  const totalVideos = videosResult.count || 0;
  const publishedVideos = videosResult.data?.filter((v) => v.status === "published").length || 0;
  const shortsCount = videosResult.data?.filter((v) => v.video_type === "short").length || 0;
  const totalVideoViews = videosResult.data?.reduce((sum, v) => sum + (v.view_count || 0), 0) || 0;

  // RSS stats
  const totalRssItems = rssItemsResult.count || 0;
  const approvedRssItems = rssItemsResult.data?.filter((r) => r.status === "approved").length || 0;
  const pendingRssItems = rssItemsResult.data?.filter((r) => r.status === "pending").length || 0;
  const totalRssFeeds = rssFeedsResult.count || 0;
  const enabledRssFeeds = rssFeedsResult.data?.filter((f) => f.enabled).length || 0;

  // Content stats
  const totalCategories = categoriesResult.count || 0;
  const totalTags = tagsResult.count || 0;
  const totalAuthors = authorsResult.count || 0;
  const totalUsers = usersResult.count || 0;
  const totalMedia = mediaResult.count || 0;
  const totalOriginals = originalsResult.count || 0;
  const publishedOriginals = originalsResult.data?.filter((o) => o.status === "published").length || 0;

  // Calculate new users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = usersResult.data?.filter(
    (u) => new Date(u.created_at) >= thirtyDaysAgo
  ).length || 0;

  // Media breakdown
  const imageCount = mediaResult.data?.filter((m) => m.mime_type?.startsWith("image/")).length || 0;
  const videoCount = mediaResult.data?.filter((m) => m.mime_type?.startsWith("video/")).length || 0;

  const overviewStats = [
    {
      label: "Total Content",
      value: totalArticles + totalVideos + totalOriginals,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Articles, Videos & Originals",
    },
    {
      label: "Total Views",
      value: (totalArticleViews + totalVideoViews).toLocaleString(),
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Combined content views",
    },
    {
      label: "Active Users",
      value: totalUsers,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: `+${newUsers} this month`,
    },
    {
      label: "Media Assets",
      value: totalMedia,
      icon: ImageIcon,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      description: `${imageCount} images, ${videoCount} videos`,
    },
  ];

  const contentStats = [
    {
      label: "Articles",
      total: totalArticles,
      published: publishedArticles,
      draft: draftArticles,
      review: reviewArticles,
      icon: FileText,
      color: "text-blue-500",
      href: "/admin/articles",
    },
    {
      label: "Videos",
      total: totalVideos,
      published: publishedVideos,
      shorts: shortsCount,
      views: totalVideoViews,
      icon: Video,
      color: "text-red-500",
      href: "/admin/videos",
    },
    {
      label: "RSS Feeds",
      total: totalRssItems,
      approved: approvedRssItems,
      pending: pendingRssItems,
      feeds: enabledRssFeeds,
      icon: Rss,
      color: "text-orange-500",
      href: "/admin/rss",
    },
    {
      label: "Originals",
      total: totalOriginals,
      published: publishedOriginals,
      icon: Film,
      color: "text-purple-500",
      href: "/admin/originals",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">
            Welcome back! Here's an overview of your content platform.
          </p>
        </div>

        {/* Overview Stats - 4 Big Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-text-tertiary">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-text-primary">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`rounded-lg ${stat.bgColor} p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Content Stats - Detailed Breakdown */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-text-primary">
            Content Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contentStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} href={stat.href}>
                  <Card className="cursor-pointer p-6 transition-all hover:border-vntv-red hover:shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-text-primary">
                        {stat.label}
                      </h3>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Total</span>
                        <span className="font-bold text-text-primary">
                          {stat.total}
                        </span>
                      </div>
                      {stat.published !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            Published
                          </span>
                          <span className="font-semibold text-green-500">
                            {stat.published}
                          </span>
                        </div>
                      )}
                      {stat.draft !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Draft</span>
                          <span className="font-semibold text-yellow-500">
                            {stat.draft}
                          </span>
                        </div>
                      )}
                      {stat.review !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            Review
                          </span>
                          <span className="font-semibold text-orange-500">
                            {stat.review}
                          </span>
                        </div>
                      )}
                      {stat.shorts !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            Shorts
                          </span>
                          <span className="font-semibold text-purple-500">
                            {stat.shorts}
                          </span>
                        </div>
                      )}
                      {stat.views !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Views</span>
                          <span className="font-semibold text-blue-500">
                            {stat.views.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {stat.approved !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            Approved
                          </span>
                          <span className="font-semibold text-green-500">
                            {stat.approved}
                          </span>
                        </div>
                      )}
                      {stat.pending !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            Pending
                          </span>
                          <span className="font-semibold text-yellow-500">
                            {stat.pending}
                          </span>
                        </div>
                      )}
                      {stat.feeds !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            Active Feeds
                          </span>
                          <span className="font-semibold text-green-500">
                            {stat.feeds}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Stats */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-text-primary">
            System Resources
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">Categories</h3>
                <Folder className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-text-primary">{totalCategories}</p>
              <Link
                href="/admin/categories"
                className="mt-2 text-sm text-vntv-red hover:underline"
              >
                Manage →
              </Link>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">Tags</h3>
                <Grid className="h-5 w-5 text-pink-500" />
              </div>
              <p className="text-3xl font-bold text-text-primary">{totalTags}</p>
              <Link
                href="/admin/tags"
                className="mt-2 text-sm text-vntv-red hover:underline"
              >
                Manage →
              </Link>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">Authors</h3>
                <Users className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-text-primary">{totalAuthors}</p>
              <Link
                href="/admin/authors"
                className="mt-2 text-sm text-vntv-red hover:underline"
              >
                Manage →
              </Link>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">RSS Feeds</h3>
                <Rss className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {enabledRssFeeds}/{totalRssFeeds}
              </p>
              <Link
                href="/admin/rss"
                className="mt-2 text-sm text-vntv-red hover:underline"
              >
                Manage →
              </Link>
            </Card>
          </div>
        </div>

        {/* Editorial Workflow */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-text-primary">
            Editorial Workflow
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/articles?status=draft">
              <Card className="cursor-pointer p-6 transition-all hover:border-vntv-red">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      Drafts ({draftArticles})
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Articles in progress
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/articles?status=review">
              <Card className="cursor-pointer p-6 transition-all hover:border-vntv-red">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      Review Queue ({reviewArticles})
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Needs editorial review
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/rss/items?status=pending">
              <Card className="cursor-pointer p-6 transition-all hover:border-vntv-red">
                <div className="flex items-center gap-3">
                  <Rss className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      RSS Pending ({pendingRssItems})
                    </h3>
                    <p className="text-sm text-text-secondary">
                      RSS items to review
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-text-primary">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <QuickAction
              href="/admin/articles/new"
              label="New Article"
              icon={FileText}
            />
            <QuickAction
              href="/admin/videos/new"
              label="Upload Video"
              icon={Video}
            />
            <QuickAction
              href="/admin/programmes"
              label="New Original"
              icon={Film}
            />
            <QuickAction href="/admin/media" label="Media Library" icon={ImageIcon} />
            <QuickAction
              href="/admin/rss/items"
              label="Review RSS"
              icon={Rss}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: any;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border bg-background-panel p-4 transition-colors hover:border-vntv-red hover:bg-background-panel-2"
    >
      <div className="rounded-lg bg-vntv-red/10 p-2 text-vntv-red">
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium text-text-primary">{label}</span>
    </Link>
  );
}
