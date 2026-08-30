"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { DataTable } from "@/components/cms/data-table";
import { AuthorDialog } from "@/components/cms/author-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAuthors, deleteAuthor, type Author } from "./actions";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAuthors = async () => {
    setLoading(true);
    const { data, error } = await getAuthors({ includeInactive: true });
    if (data) {
      setAuthors(data);
      setFilteredAuthors(data);
    } else if (error) {
      console.error("Failed to load authors:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  // Filter authors based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAuthors(authors);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAuthors(
        authors.filter(
          (author) =>
            author.name.toLowerCase().includes(query) ||
            author.slug.toLowerCase().includes(query) ||
            (author.bio && author.bio.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, authors]);

  const handleCreate = () => {
    setEditingAuthor(null);
    setDialogOpen(true);
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteAuthor(id);

    if (error) {
      alert(`Failed to delete author: ${error}`);
    } else {
      await loadAuthors();
    }

    setDeletingId(null);
  };

  const handleDialogSuccess = async () => {
    await loadAuthors();
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as const,
      cell: (author: Author) => (
        <div>
          <div className="font-medium text-text-primary">{author.name}</div>
          <div className="text-xs text-text-tertiary">/{author.slug}</div>
        </div>
      ),
    },
    {
      header: "Bio",
      accessor: "bio" as const,
      cell: (author: Author) => (
        <div className="max-w-md truncate text-sm text-text-secondary">
          {author.bio || "—"}
        </div>
      ),
    },
    {
      header: "Social Links",
      accessor: "social_links" as const,
      cell: (author: Author) => {
        const linkCount = Object.keys(author.social_links || {}).length;
        return (
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            {linkCount > 0 ? (
              <>
                <ExternalLink className="h-3 w-3" />
                <span>{linkCount} link{linkCount > 1 ? "s" : ""}</span>
              </>
            ) : (
              "—"
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "is_active" as const,
      cell: (author: Author) => (
        <Badge variant={author.is_active ? "primary" : "secondary"}>
          {author.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as const,
      cell: (author: Author) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(author)}
            className="text-text-secondary hover:text-vntv-red"
            aria-label="Edit author"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(author.id)}
            disabled={deletingId === author.id}
            className="text-text-secondary hover:text-red-500 disabled:opacity-50"
            aria-label="Delete author"
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
        title="Authors"
        description="Manage content authors and contributors"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Author
          </Button>
        }
      />

      {/* Search */}
      <div className="mt-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search authors..."
          className="max-w-md"
        />
      </div>

      {/* Authors Table */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center text-text-secondary">
            Loading authors...
          </div>
        ) : filteredAuthors.length === 0 && searchQuery ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <p className="text-text-secondary">No authors match your search</p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <p className="text-text-secondary">No authors yet</p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Author
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAuthors}
            itemsPerPage={20}
          />
        )}
      </div>

      {/* Author Dialog */}
      <AuthorDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        author={editingAuthor}
      />
    </AdminLayout>
  );
}
