"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequireRole } from "@/components/auth/require-role-client";
import {
  getAdvertisements,
  getAdvertisementsStats,
  type Advertisement,
} from "@/app/actions/advertisements";
import { getAdSlotsStats } from "@/app/actions/ad-slots";
import {
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  DollarSign,
  Eye,
  BarChart3,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function AdvertisingDashboardPage() {
  return (
    <RequireRole allowedRoles={["super_admin", "advertising_manager"]}>
      <AdvertisingDashboardContent />
    </RequireRole>
  );
}

function AdvertisingDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ads: { total: 0, active: 0, live: 0, scheduled: 0, expired: 0 },
    slots: { total: 0, active: 0, inactive: 0 },
  });
  const [liveAds, setLiveAds] = useState<Advertisement[]>([]);
  const [scheduledAds, setScheduledAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load stats
      const [adsStats, slotsStats] = await Promise.all([
        getAdvertisementsStats(),
        getAdSlotsStats(),
      ]);

      setStats({
        ads: adsStats,
        slots: slotsStats,
      });

      // Load active campaigns
      const { data: allAds } = await getAdvertisements({
        includeInactive: false,
        includeExpired: false,
      });

      if (allAds) {
        const now = new Date();

        // Filter live ads
        const live = allAds.filter((ad) => {
          const startsAt = new Date(ad.starts_at);
          const expiresAt = ad.expires_at ? new Date(ad.expires_at) : null;
          return startsAt <= now && (!expiresAt || expiresAt >= now);
        });

        // Filter scheduled ads
        const scheduled = allAds.filter((ad) => {
          const startsAt = new Date(ad.starts_at);
          return startsAt > now;
        });

        setLiveAds(live.slice(0, 5)); // Top 5 live ads
        setScheduledAds(scheduled.slice(0, 5)); // Top 5 scheduled ads
      }

      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <AdminLayout>
      <PageHeader
        title="Advertising Dashboard"
        description="Monitor ad performance and manage active campaigns"
      >
        <div className="flex gap-2">
          <Link href="/admin/ads/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              New Ad
            </Button>
          </Link>
          <Link href="/admin/ads">
            <Button variant="outline">View All Ads</Button>
          </Link>
        </div>
      </PageHeader>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-text-tertiary">
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  icon={<Activity className="w-5 h-5" />}
                  label="Live Campaigns"
                  value={stats.ads.live}
                  color="green"
                  description="Currently running"
                />
                <MetricCard
                  icon={<Calendar className="w-5 h-5" />}
                  label="Scheduled"
                  value={stats.ads.scheduled}
                  color="blue"
                  description="Starting soon"
                />
                <MetricCard
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Total Ads"
                  value={stats.ads.total}
                  color="purple"
                  description="All campaigns"
                />
                <MetricCard
                  icon={<MapPin className="w-5 h-5" />}
                  label="Active Slots"
                  value={stats.slots.active}
                  color="indigo"
                  description="Available placements"
                />
                <MetricCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Expired"
                  value={stats.ads.expired}
                  color="orange"
                  description="Past campaigns"
                />
              </div>
            </div>

            {/* Live Campaigns */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Live Campaigns
                </h2>
                <Link href="/admin/ads?filter=live">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {liveAds.length === 0 ? (
                <div className="bg-surface-secondary rounded-lg p-8 text-center">
                  <Activity className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                  <p className="text-text-tertiary mb-4">No live campaigns</p>
                  <Link href="/admin/ads/new">
                    <Button variant="primary" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-surface-secondary rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-tertiary border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Campaign
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Slot
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Priority
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Expires
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {liveAds.map((ad) => (
                        <tr key={ad.id} className="hover:bg-surface-tertiary/50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-text-primary">
                              {ad.name}
                            </div>
                            {ad.sponsor_id && (
                              <div className="text-xs text-text-tertiary mt-1">
                                Sponsored
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-text-secondary">
                              {ad.ad_slot?.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="secondary"
                              className="bg-purple-500/10 text-purple-500"
                            >
                              {ad.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-text-secondary">
                              {ad.expires_at
                                ? formatDistanceToNow(new Date(ad.expires_at), {
                                    addSuffix: true,
                                  })
                                : "Never"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/admin/ads/${ad.id}`}>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Scheduled Campaigns */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Scheduled Campaigns
                </h2>
                <Link href="/admin/ads?filter=scheduled">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {scheduledAds.length === 0 ? (
                <div className="bg-surface-secondary rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                  <p className="text-text-tertiary">No scheduled campaigns</p>
                </div>
              ) : (
                <div className="bg-surface-secondary rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-tertiary border-b border-border">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Campaign
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Slot
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Starts
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Duration
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-text-tertiary uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {scheduledAds.map((ad) => {
                        const startsAt = new Date(ad.starts_at);
                        const expiresAt = ad.expires_at
                          ? new Date(ad.expires_at)
                          : null;
                        const duration =
                          expiresAt && startsAt
                            ? Math.ceil(
                                (expiresAt.getTime() - startsAt.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : null;

                        return (
                          <tr key={ad.id} className="hover:bg-surface-tertiary/50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-text-primary">
                                {ad.name}
                              </div>
                              {ad.sponsor_id && (
                                <div className="text-xs text-text-tertiary mt-1">
                                  Sponsored
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-secondary">
                                {ad.ad_slot?.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-secondary">
                                {formatDistanceToNow(startsAt, {
                                  addSuffix: true,
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-text-secondary">
                                {duration ? `${duration} days` : "Ongoing"}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/admin/ads/${ad.id}`}>
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/ads/new">
                  <div className="bg-surface-secondary hover:bg-surface-tertiary rounded-lg p-6 cursor-pointer transition-colors border border-border">
                    <Plus className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">
                      Create Campaign
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      Launch a new advertisement
                    </p>
                  </div>
                </Link>

                <Link href="/admin/ads/slots">
                  <div className="bg-surface-secondary hover:bg-surface-tertiary rounded-lg p-6 cursor-pointer transition-colors border border-border">
                    <MapPin className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">
                      Manage Slots
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      Configure ad placements
                    </p>
                  </div>
                </Link>

                <Link href="/admin/ads">
                  <div className="bg-surface-secondary hover:bg-surface-tertiary rounded-lg p-6 cursor-pointer transition-colors border border-border">
                    <BarChart3 className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold text-text-primary mb-1">
                      View All Ads
                    </h3>
                    <p className="text-sm text-text-tertiary">
                      Browse all campaigns
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "green" | "blue" | "purple" | "indigo" | "orange";
  description: string;
}

function MetricCard({ icon, label, value, color, description }: MetricCardProps) {
  const colorClasses = {
    green: "text-green-500 bg-green-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    indigo: "text-indigo-500 bg-indigo-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  };

  return (
    <div className="bg-surface-secondary rounded-lg p-6">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-sm text-text-tertiary mb-1">{label}</div>
      <div className="text-3xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-xs text-text-tertiary">{description}</div>
    </div>
  );
}
