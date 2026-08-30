import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui";
import { getAllProgrammes } from "@/app/actions/programme";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function ProgrammesPage() {
  const { data: programmes, error } = await getAllProgrammes();

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
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            Error loading programmes: {error}
          </div>
        )}

        {programmes && programmes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary mb-4">No programmes yet</p>
            <Link href="/admin/programmes/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Programme
              </Button>
            </Link>
          </div>
        ) : (
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
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
