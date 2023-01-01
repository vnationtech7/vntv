"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { DataTable } from "@/components/cms/data-table";
import { CategoryDialog } from "@/components/cms/category-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequireEditor } from "@/components/auth/require-role-client";
import {
  getCategories,
  deleteCategory,
  type Category,
} from "./actions";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function CategoriesPage() {
  return (
    <RequireEditor>
      <CategoriesPageContent />
    </RequireEditor>
  );
}

function CategoriesPageContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    const { data, error } = await getCategories({ includeInactive: true });
    if (data) {
      setCategories(data);
    } else if (error) {
      console.error("Failed to load categories:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteCategory(id);
    
    if (error) {
      alert(`Failed to delete category: ${error}`);
    } else {
      await loadCategories();
    }
    
    setDeletingId(null);
  };

  const handleDialogSuccess = async () => {
    await loadCategories();
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as const,
      cell: (category: Category) => (
        <div>
          <div className="font-medium text-text-primary">{category.name}</div>
          <div className="text-xs text-text-tertiary">/{category.slug}</div>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: "description" as const,
      cell: (category: Category) => (
        <div className="max-w-md truncate text-sm text-text-secondary">
          {category.description || "—"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "is_active" as const,
      cell: (category: Category) => (
        <Badge variant={category.is_active ? "primary" : "secondary"}>
          {category.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Order",
      accessor: "display_order" as const,
      cell: (category: Category) => (
        <div className="text-sm text-text-secondary">
          {category.display_order}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as const,
      cell: (category: Category) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(category)}
            className="text-text-secondary hover:text-vntv-red"
            aria-label="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            disabled={deletingId === category.id}
            className="text-text-secondary hover:text-red-500 disabled:opacity-50"
            aria-label="Delete category"
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
        title="Categories"
        description="Manage content categories for articles and videos"
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        }
      />

      <div className="mt-6">
        {loading ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center text-text-secondary">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <p className="text-text-secondary">No categories yet</p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Category
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={categories}
            itemsPerPage={20}
          />
        )}
      </div>

      {/* Category Dialog */}
      <CategoryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        category={editingCategory}
        parentCategories={categories}
      />
    </AdminLayout>
  );
}
