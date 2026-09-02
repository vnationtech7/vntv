"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui";
import { getAllProgrammes, deleteProgramme, toggleProgrammeStatus } from "@/app/actions/programme";
import { Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { RequireVideoEditor } from "@/components/auth/require-role-client";

export default function ProgrammesPage() {
  return (
    <RequireVideoEditor>
      <ProgrammesPageContent />
    </RequireVideoEditor>
  );
}

function ProgrammesPageContent() {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadProgrammes = async () => {
    setLoading(true);
    const { data, error: fetchError } = await getAllProgrammes();
    if (data) {
      setProgrammes(data);
      setError(null);
    } else if (fetchError) {
      setError(fetchError);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProgrammes();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also delete all episodes. This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const { success, error } = await deleteProgramme(id);

    if (error) {
      alert(`Failed to delete: ${error}`);
    } else {
      await loadProgrammes();
    }

    setDeletingId(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean, name: string) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!confirm(`${action === "activate" ? "Activate" : "Deactivate"} "${name}"?`)) {
      return;
    }

    setTogglingId(id);
    const { success, error } = await toggleProgrammeStatus(id, currentStatus);

    if (error) {
      alert(`Failed to ${action}: ${error}`);
    } else {
      await loadProgrammes();
    }

    setTogglingId(null);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Programmes"
        description="Manage VNTV Originals programmes and series"
      >
        <Link href="/admin/programmes/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Programme
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6">
        {loading && (
          <div className="text-center py-20">
            <p className="text-text-secondary">Loading programmes...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            Error loading programmes: {error}
          </div>
        )}

        {!loading && programmes && programmes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">No programmes yet</p>
            <Link href="/admin/programmes/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Programme
              </Button>
            </Link>
          </div>
        ) : !loading && programmes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes?.map((programme) => {
              const posterUrl = programme.poster_image
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${programme.poster_image.storage_path}`
                : null;

              return (
                <div
                  key={programme.id}
                  className="bg-surface-secondary rounded-lg overflow-hidden border border-border hover:border-accent-yellow transition-colors"
                >
                  {/* Poster Image */}
                  {posterUrl ? (
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={posterUrl}
                        alt={programme.poster_image?.alt_text || programme.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-surface-tertiary flex items-center justify-center">
                      <span className="text-text-tertiary text-4xl font-bold">
                        {programme.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      {programme.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-medium">
                          <Eye className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-500/10 text-gray-500 text-xs font-medium">
                          <EyeOff className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                      {programme.programme_type && (
                        <span className="px-2 py-1 rounded bg-accent-yellow/10 text-accent-yellow text-xs font-medium capitalize">
                          {programme.programme_type.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-text-primary mb-1 line-clamp-1">
                      {programme.name}
                    </h3>

                    {/* Presenter */}
                    {programme.presenter && (
                      <p className="text-sm text-text-secondary mb-2">
                        Presented by {programme.presenter}
                      </p>
                    )}

                    {/* Description */}
                    {programme.description && (
                      <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
                        {programme.description}
                      </p>
                    )}

                    {/* Meta */}
                    <p className="text-xs text-text-tertiary mb-4">
                      Created {formatDistanceToNow(new Date(programme.created_at), { addSuffix: true })}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {/* Top row: Toggle Active and Delete */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(programme.id, programme.is_active, programme.name)}
                          disabled={togglingId === programme.id}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-colors disabled:opacity-50 ${
                            programme.is_active
                              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                              : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                          }`}
                          title={programme.is_active ? "Deactivate" : "Activate"}
                        >
                          {programme.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Inactive</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(programme.id, programme.name)}
                          disabled={deletingId === programme.id}
                          className="px-3 py-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom row: Edit and Episodes */}
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/programmes/${programme.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Link
                          href={`/admin/programmes/${programme.id}/episodes`}
                          className="flex-1"
                        >
                          <Button variant="primary" size="sm" className="w-full">
                            Episodes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
