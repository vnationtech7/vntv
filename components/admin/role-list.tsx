"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "@/components/icons";
import { createRole, updateRole, deleteRole } from "@/app/admin/roles/actions";
import { useRoles } from "@/hooks/use-roles";

export function RoleList() {
  const { roles, loading, error } = useRoles();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: string;
    name: string;
    description: string | null;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createRole(formData);

    if (result.error) {
      setActionError(result.error);
    } else {
      setIsCreateOpen(false);
      window.location.reload(); // Refresh to show new role
    }

    setActionLoading(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRole) return;

    setActionLoading(true);
    setActionError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateRole(selectedRole.id, formData);

    if (result.error) {
      setActionError(result.error);
    } else {
      setIsEditOpen(false);
      setSelectedRole(null);
      window.location.reload(); // Refresh to show updated role
    }

    setActionLoading(false);
  }

  async function handleDelete(roleId: string, roleName: string) {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    setActionLoading(true);
    const result = await deleteRole(roleId);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      window.location.reload(); // Refresh to show changes
    }

    setActionLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[--color-vntv-red]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-status-error/10 p-4 text-sm text-status-error">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Roles</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-4">
        {roles.length === 0 ? (
          <div className="rounded-lg border border-border p-8 text-center text-text-secondary">
            No roles found. Create your first role to get started.
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg border border-border bg-background-panel p-6 flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {role.name}
                  </h3>
                  <Badge variant="secondary">{role.name}</Badge>
                </div>
                {role.description && (
                  <p className="text-sm text-text-secondary">
                    {role.description}
                  </p>
                )}
                <p className="text-xs text-text-tertiary">
                  Created {new Date(role.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsEditOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(role.id, role.name)}
                  disabled={actionLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Role Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form onSubmit={handleCreate} className="space-y-4">
              {actionError && (
                <div className="rounded-lg bg-status-error/10 p-4 text-sm text-status-error">
                  {actionError}
                </div>
              )}

              <Input
                label="Role Name"
                name="name"
                type="text"
                placeholder="e.g., admin, editor, author"
                required
              />

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-vntv-red focus:border-transparent"
                  placeholder="Describe what this role can do..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={actionLoading}>
                  Create Role
                </Button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form onSubmit={handleUpdate} className="space-y-4">
              {actionError && (
                <div className="rounded-lg bg-status-error/10 p-4 text-sm text-status-error">
                  {actionError}
                </div>
              )}

              <Input
                label="Role Name"
                name="name"
                type="text"
                defaultValue={selectedRole?.name}
                required
              />

              <div>
                <label
                  htmlFor="edit-description"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Description (optional)
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  defaultValue={selectedRole?.description || ""}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-vntv-red focus:border-transparent"
                  placeholder="Describe what this role can do..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedRole(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={actionLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
