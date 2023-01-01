"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RequireRole } from "@/components/auth/require-role-client";
import {
  getAdSlots,
  deleteAdSlot,
  toggleAdSlotStatus,
  getAdSlotsStats,
  type AdSlot,
} from "@/app/actions/ad-slots";
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Search,
  MapPin,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

export default function AdSlotsPage() {
  return (
    <RequireRole allowedRoles={["super_admin", "advertising_manager"]}>
      <AdSlotsPageContent />
    </RequireRole>
  );
}

function AdSlotsPageContent() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSlots = async () => {
    setLoading(true);
    const { data } = await getAdSlots(true); // Include inactive
    if (data) {
      setSlots(data);
      setFilteredSlots(data);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const statsData = await getAdSlotsStats();
    setStats(statsData);
  };

  useEffect(() => {
    loadSlots();
    loadStats();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = slots.filter(
        (slot) =>
          slot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          slot.placement.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSlots(filtered);
    } else {
      setFilteredSlots(slots);
    }
  }, [searchQuery, slots]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { data } = await toggleAdSlotStatus(id, !currentStatus);
    if (data) {
      setSlots(slots.map((s) => (s.id === id ? { ...s, is_active: !currentStatus } : s)));
      loadStats();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteAdSlot(id);

    if (error) {
      alert(error);
    } else {
      setSlots(slots.filter((s) => s.id !== id));
      loadStats();
    }

    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <PageHeader title="Ad Slots" description="Manage advertising slot definitions and placements">
        <Link href="/admin/ads/slots/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Ad Slot
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Total Slots</div>
            <div className="text-3xl font-bold text-text-primary">{stats.total}</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Active Slots</div>
            <div className="text-3xl font-bold text-green-500">{stats.active}</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-6">
            <div className="text-sm text-text-tertiary mb-1">Inactive Slots</div>
            <div className="text-3xl font-bold text-gray-500">{stats.inactive}</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search ad slots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Slots Table */}
        {loading ? (
          <div className="text-center py-12 text-text-tertiary">Loading ad slots...</div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-tertiary mb-4">
              {searchQuery ? "No ad slots match your search" : "No ad slots created yet"}
            </p>
            {!searchQuery && (
              <Link href="/admin/ads/slots/new">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Ad Slot
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
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Key
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                    Placement
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
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-surface-tertiary/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{slot.name}</div>
                      {slot.description && (
                        <div className="text-sm text-text-tertiary mt-1">{slot.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-surface-tertiary px-2 py-1 rounded text-text-secondary">
                        {slot.key}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-text-tertiary" />
                        <span className="text-sm text-text-secondary">{slot.placement}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {slot.is_active ? (
                        <Badge variant="success" className="bg-green-500/10 text-green-500">
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">
                          <X className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(slot.id, slot.is_active)}
                          className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                          title={slot.is_active ? "Deactivate" : "Activate"}
                        >
                          {slot.is_active ? (
                            <Power className="w-4 h-4 text-green-500" />
                          ) : (
                            <PowerOff className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        <Link href={`/admin/ads/slots/${slot.id}`}>
                          <button className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors">
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleDelete(slot.id, slot.name)}
                          disabled={deletingId === slot.id}
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
