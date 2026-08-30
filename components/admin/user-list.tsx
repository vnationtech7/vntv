"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Shield, Plus, X } from "@/components/icons";
import { getUsers, assignRole, removeRole } from "@/app/admin/roles/actions";
import { useRoles } from "@/hooks/use-roles";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  user_roles: Array<{
    id: string;
    role_id: string;
    roles: {
      id: string;
      name: string;
    };
  }>;
}

export function UserList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { roles } = useRoles();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const result = await getUsers();

    if (result.error) {
      setError(result.error);
    } else {
      setUsers(result.data || []);
    }

    setLoading(false);
  }

  async function handleAssignRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    const formData = new FormData(e.currentTarget);
    const roleId = formData.get("roleId") as string;

    const result = await assignRole(selectedUser.id, roleId);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      setIsAssignOpen(false);
      setSelectedUser(null);
      await loadUsers(); // Refresh user list
    }

    setActionLoading(false);
  }

  async function handleRemoveRole(userRoleId: string) {
    if (!confirm("Are you sure you want to remove this role?")) return;

    setActionLoading(true);
    const result = await removeRole(userRoleId);

    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      await loadUsers(); // Refresh user list
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
        <h2 className="text-2xl font-bold text-text-primary">Users</h2>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-panel-2 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-background-panel transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[--color-background-panel-2] text-[--color-foreground-muted] font-bold text-xs uppercase">
                            {(user.full_name || user.email).charAt(0)}
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-text-primary">
                          {user.full_name || "No name"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.user_roles.length === 0 ? (
                        <span className="text-sm text-text-tertiary">No roles</span>
                      ) : (
                        user.user_roles.map((userRole) => (
                          <Badge
                            key={userRole.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            {userRole.roles.name}
                            <button
                              onClick={() => handleRemoveRole(userRole.id)}
                              disabled={actionLoading}
                              className="ml-1 hover:text-status-error"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsAssignOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Assign Role
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Role Modal */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Role to {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <label
                  htmlFor="roleId"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Select Role
                </label>
                <Select
                  id="roleId"
                  name="roleId"
                  required
                  options={roles.map((role) => ({
                    value: role.id,
                    label: role.name,
                  }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAssignOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={actionLoading}>
                  Assign Role
                </Button>
              </div>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
