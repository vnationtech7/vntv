// @ts-nocheck
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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
} from "lucide-react";

export const metadata = {
  title: "Dashboard - VNTV CMS",
  description: "VNTV Content Management System",
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch dashboard stats
  const [articlesResult, categoriesResult, tagsResult, authorsResult] =
    await Promise.all([
      supabase.from("articles").select("id, status", { count: "exact" }),
      supabase.from("categories").select("id", { count: "exact" }),
      supabase.from("tags").select("id", { count: "exact" }),
      supabase.from("authors").select("id", { count: "exact" }),
    ]);

  const totalArticles = articlesResult.count || 0;
  const draftArticles =
    articlesResult.data?.filter((a) => a.status === "draft").length || 0;
  const reviewArticles =
    articlesResult.data?.filter((a) => a.status === "review").length || 0;
  const publishedArticles =
    articlesResult.data?.filter((a) => a.status === "published").length || 0;

  const totalCategories = categoriesResult.count || 0;
  const totalTags = tagsResult.count || 0;
  const totalAuthors = authorsResult.count || 0;

  const stats = [
    {
      label: "Total Articles",
      value: totalArticles,
      icon: FileText,
      color: "text-blue-500",
      href: "/admin/articles",
    },
    {
      label: "Draft Articles",
      value: draftArticles,
      icon: Clock,
      color: "text-yellow-500",
      href: "/admin/articles",
    },
    {
      label: "In Review",
      value: reviewArticles,
      icon: AlertCircle,
      color: "text-orange-500",
      href: "/admin/articles",
    },
    {
      label: "Published",
      value: publishedArticles,
      icon: CheckCircle,
      color: "text-green-500",
      href: "/admin/articles",
    },
    {
      label: "Categories",
      value: totalCategories,
      icon: Folder,
      color: "text-purple-500",
      href: "/admin/categories",
    },
    {
      label: "Tags",
      value: totalTags,
      icon: Grid,
      color: "text-pink-500",
      href: "/admin/tags",
    },
    {
      label: "Authors",
      value: totalAuthors,
      icon: Users,
      color: "text-indigo-500",
      href: "/admin/authors",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">
            Welcome back! Here's what's happening with your content.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <Card className="cursor-pointer p-6 transition-all hover:border-vntv-red hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-text-tertiary">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-text-primary">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`rounded-lg bg-background-panel-2 p-3 ${stat.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Editorial Workflow */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-text-primary">
            Editorial Workflow
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/articles">
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

            <Link href="/admin/articles">
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

            <Link href="/admin/articles">
              <Card className="cursor-pointer p-6 transition-all hover:border-vntv-red">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      Published ({publishedArticles})
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Live on the site
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/admin/articles/new"
              label="New Article"
              icon={FileText}
            />
            <QuickAction
              href="/admin/categories"
              label="Manage Categories"
              icon={Folder}
            />
            <QuickAction
              href="/admin/tags"
              label="Manage Tags"
              icon={Grid}
            />
            <QuickAction
              href="/admin/authors"
              label="Manage Authors"
              icon={Users}
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
