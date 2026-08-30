"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { DataTable } from "@/components/cms/data-table";
import { TagDialog } from "@/components/cms/tag-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTags, deleteTag, bulkCreateTags, type Tag } from "./actions";
import { Pencil, Trash2, Plus, Tags } from "lucide-react";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const loadTags = async () => {
    setLoading(true);
    const { data, error } = await getTags();
    if (data) {
      setTags(data);
      setFilteredTags(data);
    } else if (error) {
      console.error("Failed to load tags:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  // Filter tags based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTags(tags);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTags(
        tags.filter(
          (tag) =>
            tag.name.toLowerCase().includes(query) ||
            tag.slug.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, tags]);

  const handleCreate = () => {
    setEditingTag(null);
    setDialogOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteTag(id);

    if (error) {
      alert(`Failed to delete tag: ${error}`);
    } else {
      await loadTags();
    }

    setDeletingId(null);
  };

  const handleDialogSuccess = async () => {
    await loadTags();
  };

  const handleBulkCreate = async () => {
    if (!bulkInput.trim()) {
      setBulkError("Please enter at least one tag");
      return;
    }

    setBulkLoading(true);
    setBulkError(null);

    const { data, error } = await bulkCreateTags(bulkInput);

    if (error) {
      setBulkError(error);
      setBulkLoading(false);
      return;
    }

    // Success
    setBulkInput("");
    setBulkMode(false);
    await loadTags();
    setBulkLoading(false);

    if (data) {
      alert(`Successfully created ${data.length} tag${data.length > 1 ? "s" : ""}`);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as const,
      cell: (tag: Tag) => (
        <div>
          <div className="font-medium text-text-primary">{tag.name}</div>
          <div className="text-xs text-text-tertiary">/{tag.slug}</div>
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "created_at" as const,
      cell: (tag: Tag) => (
        <div className="text-sm text-text-secondary">
          {new Date(tag.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as const,
      cell: (tag: Tag) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(tag)}
            className="text-text-secondary hover:text-vntv-red"
            aria-label="Edit tag"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(tag.id)}
            disabled={deletingId === tag.id}
            className="text-text-secondary hover:text-red-500 disabled:opacity-50"
            aria-label="Delete tag"
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
        title="Tags"
        description="Manage content tags for organizing articles"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkMode(!bulkMode)}
            >
              <Tags className="mr-2 h-4 w-4" />
              {bulkMode ? "Single Mode" : "Bulk Create"}
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tag
            </Button>
          </div>
        }
      />

      {/* Bulk Create Mode */}
      {bulkMode && (
        <div className="mt-6 rounded-lg border border-border bg-background-panel p-4">
          <h3 className="mb-2 font-semibold text-text-primary">
            Bulk Create Tags
          </h3>
          <p className="mb-4 text-sm text-text-secondary">
            Enter multiple tags separated by commas. Slugs will be generated
            automatically.
          </p>

          {bulkError && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              {bulkError}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="e.g., Breaking News, Technology, Sports, Politics"
              className="flex-1"
            />
            <Button onClick={handleBulkCreate} disabled={bulkLoading}>
              {bulkLoading ? "Creating..." : "Create All"}
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mt-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="max-w-md"
        />
      </div>

      {/* Tags Table */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center text-text-secondary">
            Loading tags...
          </div>
        ) : filteredTags.length === 0 && searchQuery ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <p className="text-text-secondary">No tags match your search</p>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <p className="text-text-secondary">No tags yet</p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Tag
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredTags} itemsPerPage={20} />
        )}
      </div>

      {/* Tag Dialog */}
      <TagDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        tag={editingTag}
      />
    </AdminLayout>
  );
}
