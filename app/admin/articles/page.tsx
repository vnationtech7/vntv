"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { DataTable } from "@/components/cms/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  getArticles,
  deleteArticle,
  updateArticleStatus,
  type Article,
  type ArticleStatus,
} from "./actions";
import { getMediaAsset, type MediaAsset } from "../media/actions";
import { Pencil, Trash2, Plus, Image as ImageIcon } from "lucide-react";

type ArticleWithImage = Article & {
  featured_image?: MediaAsset | null;
};

const STATUS_COLORS: Record<ArticleStatus, string> = {
  draft: "secondary",
  review: "default",
  approved: "default",
  scheduled: "default",
  published: "default",
  rejected: "secondary",
  archived: "secondary",
};

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleWithImage[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">("all");

  const loadArticles = async () => {
    setLoading(true);
    const { data, error } = await getArticles();
    if (data) {
      // Load featured images for articles that have them
      const articlesWithImages = await Promise.all(
        data.map(async (article) => {
          if (article.featured_image_id) {
            const { data: media } = await getMediaAsset(article.featured_image_id);
            return { ...article, featured_image: media };
          }
          return { ...article, featured_image: null };
        })
      );
      setArticles(articlesWithImages);
      setFilteredArticles(articlesWithImages);
    } else if (error) {
      console.error("Failed to load articles:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Filter articles
  useEffect(() => {
    let filtered = articles;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((article) => article.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.slug.toLowerCase().includes(query) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  }, [searchQuery, statusFilter, articles]);

  const handleCreate = () => {
    router.push("/admin/articles/new");
  };

  const handleEdit = (article: ArticleWithImage) => {
    router.push(`/admin/articles/${article.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteArticle(id);

    if (error) {
      alert(`Failed to delete article: ${error}`);
    } else {
      await loadArticles();
    }

    setDeletingId(null);
  };

  const handleStatusChange = async (
    id: string,
    status: ArticleStatus,
    articleTitle: string
  ) => {
    const statusLabels: Record<ArticleStatus, string> = {
      draft: "Draft",
      review: "In Review",
      approved: "Approved",
      scheduled: "Scheduled",
      published: "Published",
      rejected: "Rejected",
      archived: "Archived",
    };

    if (
      !confirm(
        `Change "${articleTitle}" status to ${statusLabels[status]}?`
      )
    ) {
      return;
    }

    const { error } = await updateArticleStatus(id, status);

    if (error) {
      alert(`Failed to update status: ${error}`);
    } else {
      await loadArticles();
    }
  };

  const columns = [
    {
      header: "Image",
      accessor: "featured_image_id" as const,
      cell: (article: ArticleWithImage) => (
        <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-background-secondary">
          {article.featured_image ? (
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${article.featured_image.storage_path}`}
              alt={article.featured_image.alt_text || article.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-text-tertiary" />
          )}
        </div>
      ),
    },
    {
      header: "Title",
      accessor: "title" as const,
      cell: (article: ArticleWithImage) => (
        <div className="min-w-0 max-w-md">
          <div className="truncate font-medium text-text-primary line-clamp-2">
            {article.title}
          </div>
          <div className="truncate text-xs text-text-tertiary">/{article.slug}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status" as const,
      cell: (article: ArticleWithImage) => (
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_COLORS[article.status] as any}>
            {article.status}
          </Badge>
          <select
            value={article.status}
            onChange={(e) =>
              handleStatusChange(
                article.id,
                e.target.value as ArticleStatus,
                article.title
              )
            }
            className="rounded border border-border bg-background px-2 py-1 text-xs text-text-primary hover:bg-background-panel-2"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      ),
    },
    {
      header: "Flags",
      accessor: "is_breaking" as const,
      cell: (article: ArticleWithImage) => (
        <div className="flex gap-1">
          {article.is_breaking && (
            <Badge variant="primary" className="text-xs">
              Breaking
            </Badge>
          )}
          {article.is_featured && (
            <Badge variant="primary" className="text-xs">
              Featured
            </Badge>
          )}
          {article.is_exclusive && (
            <Badge variant="primary" className="text-xs">
              Exclusive
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "created_at" as const,
      cell: (article: ArticleWithImage) => (
        <div className="text-sm text-text-secondary">
          {new Date(article.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as const,
      cell: (article: ArticleWithImage) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(article)}
            className="text-text-secondary hover:text-vntv-red"
            aria-label="Edit article"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(article.id)}
            disabled={deletingId === article.id}
            className="text-text-secondary hover:text-red-500 disabled:opacity-50"
            aria-label="Delete article"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Articles"
        description="Manage your news articles and content"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Button>
        }
      />

      {/* Filters */}
      <div className="mt-6 flex gap-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Articles Table */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center text-text-secondary">
            Loading articles...
          </div>
        ) : filteredArticles.length === 0 && (searchQuery || statusFilter !== "all") ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <p className="text-text-secondary">No articles match your filters</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <p className="text-text-secondary">No articles yet</p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Article
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredArticles}
            itemsPerPage={20}
          />
        )}
      </div>
    </AdminLayout>
  );
}
