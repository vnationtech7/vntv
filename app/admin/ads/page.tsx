"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RequireRole } from "@/components/auth/require-role-client";
import {
  getAdvertisements,
  deleteAdvertisement,
  toggleAdvertisementStatus,
  getAdvertisementsStats,
  type Advertisement,
} from "@/app/actions/advertisements";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Search,
  Image as ImageIcon,
  Code,
  Calendar,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function AdvertisementsPage() {
  return (
    <RequireRole allowedRoles={["super_admin", "advertising_manager"]}>
      <AdvertisementsPageContent />
    </RequireRole>
  );
}

function AdvertisementsPageContent() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [filteredAds, setFilteredAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    live: 0,
    scheduled: 0,
    expired: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAds = async () => {
    setLoading(true);
    const { data, error } = await getAdvertisements({
      includeInactive: true,
      includeExpired: true,
    });
    
    if (error) {
      console.error("Error loading ads:", error);
    }
    
    console.log("Loaded ads:", data);
    
    if (data) {
      setAds(data);
      setFilteredAds(data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const statsData = await getAdvertisementsStats();
    setStats(statsData);
  };

  useEffect(() => {
    loadAds();
    loadStats();
  }, []);

  useEffect(() => {
    let filtered = ads;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (ad) =>
          ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.ad_slot?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((ad) => {
        const isActive = ad.is_active;
        const startsAt = new Date(ad.starts_at);
        const expiresAt = ad.expires_at ? new Date(ad.expires_at) : null;
        const now = new Date();
        
        let statusLabel = "inactive";
        if (isActive) {
          if (startsAt > now) {
            statusLabel = "scheduled";
          } else if (expiresAt && expiresAt < now) {
            statusLabel = "expired";
          } else {
            statusLabel = "live";
          }
        }
        
        return statusLabel === filterStatus;
      });
    }

    setFilteredAds(filtered);
  }, [searchQuery, filterStatus, ads]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { data } = await toggleAdvertisementStatus(id, !currentStatus);
    if (data) {
      setAds(ads.map((a) => (a.id === id ? { ...a, is_active: !currentStatus } : a)));
      loadStats();
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
    const { error } = await deleteAdvertisement(id);

    if (error) {
      alert(error);
    } else {
      setAds(ads.filter((a) => a.id !== id));
      loadStats();
    }

    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Advertisements"
        description="Manage advertisements and campaign scheduling"
      >
        <Link href="/admin/ads/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Advertisement
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Total Ads</div>
            <div className="text-3xl font-bold text-text-primary">{stats.total}</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Active</div>
            <div className="text-3xl font-bold text-blue-500">{stats.active}</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Live Now</div>
            <div className="text-3xl font-bold text-green-500">{stats.live}</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Scheduled</div>
            <div className="text-3xl font-bold text-purple-500">{stats.scheduled}</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Expired</div>
            <div className="text-3xl font-bold text-orange-500">{stats.expired}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search advertisements..."
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
              <option value="live">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Ads Table */}
        {loading ? (
          <div className="text-center py-12 text-text-tertiary">
            Loading advertisements...
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-tertiary mb-4">
              {searchQuery || filterStatus !== "all"
                ? "No advertisements match your filters"
                : "No advertisements created yet"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Link href="/admin/ads/new">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Advertisement
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
                    Advertisement
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Slot
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Schedule
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Priority
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
                {filteredAds.map((ad) => {
                  const status = {
                    label: !ad.is_active ? "Inactive" : 
                           new Date(ad.starts_at) > new Date() ? "Scheduled" :
                           ad.expires_at && new Date(ad.expires_at) < new Date() ? "Expired" : "Live",
                    color: !ad.is_active ? "gray" : 
                           new Date(ad.starts_at) > new Date() ? "blue" :
                           ad.expires_at && new Date(ad.expires_at) < new Date() ? "orange" : "green"
                  };
                  return (
                    <tr key={ad.id} className="hover:bg-surface-tertiary/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary">{ad.name}</div>
                        {ad.sponsor_id && (
                          <div className="text-sm text-text-tertiary mt-1">
                            Sponsored
                          </div>
                        )}
                        {ad.target_url && (
                          <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">
                              {ad.target_url}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-secondary">
                          {ad.ad_slot?.name}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {ad.ad_slot?.placement}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={
                            ad.creative_type === "image"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-purple-500/10 text-purple-500"
                          }
                        >
                          {ad.creative_type === "image" ? (
                            <ImageIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <Code className="w-3 h-3 mr-1" />
                          )}
                          {ad.creative_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-text-tertiary">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(ad.starts_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {ad.expires_at && (
                          <div className="text-xs text-text-tertiary mt-1">
                            Expires{" "}
                            {formatDistanceToNow(new Date(ad.expires_at), {
                              addSuffix: true,
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <TrendingUp className="w-3 h-3" />
                          {ad.priority}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className={
                            status.color === "green"
                              ? "bg-green-500/10 text-green-500"
                              : status.color === "blue"
                              ? "bg-blue-500/10 text-blue-500"
                              : status.color === "orange"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-gray-500/10 text-gray-500"
                          }
                        >
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(ad.id, ad.is_active)}
                            className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                            title={ad.is_active ? "Deactivate" : "Activate"}
                          >
                            {ad.is_active ? (
                              <Power className="w-4 h-4 text-green-500" />
                            ) : (
                              <PowerOff className="w-4 h-4 text-gray-500" />
                            )}
                          </button>

                          <Link href={`/admin/ads/${ad.id}`}>
                            <button className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors">
                              <Edit className="w-4 h-4 text-blue-500" />
                            </button>
                          </Link>

                          <button
                            onClick={() => handleDelete(ad.id, ad.name)}
                            disabled={deletingId === ad.id}
                            className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
