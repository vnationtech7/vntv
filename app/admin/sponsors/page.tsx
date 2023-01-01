"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RequireRole } from "@/components/auth/require-role-client";
import {
  getSponsorships,
  deleteSponsorship,
  toggleSponsorshipStatus,
  type Sponsorship,
} from "@/app/actions/sponsorships";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Search,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function SponsorsPage() {
  return (
    <RequireRole allowedRoles={["super_admin", "advertising_manager"]}>
      <SponsorsPageContent />
    </RequireRole>
  );
}

function SponsorsPageContent() {
  const [sponsors, setSponsors] = useState<Sponsorship[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSponsors = async () => {
    setLoading(true);
    const { data } = await getSponsorships(true); // Include inactive
    if (data) {
      setSponsors(data);
      setFilteredSponsors(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  useEffect(() => {
    let filtered = sponsors;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (sponsor) =>
          sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sponsor.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      filtered = filtered.filter((sponsor) => sponsor.is_active === isActive);
    }

    setFilteredSponsors(filtered);
  }, [searchQuery, filterStatus, sponsors]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { data } = await toggleSponsorshipStatus(id, !currentStatus);
    if (data) {
      setSponsors(
        sponsors.map((s) => (s.id === id ? { ...s, is_active: !currentStatus } : s))
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteSponsorship(id);

    if (error) {
      alert(error);
    } else {
      setSponsors(sponsors.filter((s) => s.id !== id));
    }

    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Sponsors"
        description="Manage sponsorships and advertising partners"
      >
        <Link href="/admin/sponsors/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Sponsor
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Total Sponsors</div>
            <div className="text-3xl font-bold text-text-primary">
              {sponsors.length}
            </div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Active</div>
            <div className="text-3xl font-bold text-green-500">
              {sponsors.filter((s) => s.is_active).length}
            </div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Inactive</div>
            <div className="text-3xl font-bold text-gray-500">
              {sponsors.filter((s) => !s.is_active).length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Sponsors Table */}
        {loading ? (
          <div className="text-center py-12 text-text-tertiary">
            Loading sponsors...
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-tertiary mb-4">
              {searchQuery || filterStatus !== "all"
                ? "No sponsors match your filters"
                : "No sponsors created yet"}
            </div>
            {!searchQuery && filterStatus === "all" && (
              <Link href="/admin/sponsors/new">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Sponsor
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-surface-secondary rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-tertiary border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Sponsor
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Description
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Website
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-surface-tertiary/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">
                        {sponsor.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-secondary max-w-md truncate">
                        {sponsor.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sponsor.website_url ? (
                        <a
                          href={sponsor.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">
                            {sponsor.website_url}
                          </span>
                        </a>
                      ) : (
                        <span className="text-text-tertiary text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={
                          sponsor.is_active
                            ? "bg-green-500/10 text-green-500"
                            : "bg-gray-500/10 text-gray-500"
                        }
                      >
                        {sponsor.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(sponsor.id, sponsor.is_active)
                          }
                          className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                          title={sponsor.is_active ? "Deactivate" : "Activate"}
                        >
                          {sponsor.is_active ? (
                            <Power className="w-4 h-4 text-green-500" />
                          ) : (
                            <PowerOff className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        <Link href={`/admin/sponsors/${sponsor.id}`}>
                          <button className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors">
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleDelete(sponsor.id, sponsor.name)}
                          disabled={deletingId === sponsor.id}
                          className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
