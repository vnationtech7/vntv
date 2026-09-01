"use client";

import { useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut as authSignOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import {
  Layout,
  FileText,
  Folder,
  Users,
  Video,
  ImageIcon,
  Globe,
  Flame,
  Grid,
  Speaker as SpeakerIcon,
  BarChart,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Activity,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { Award } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[]; // If specified, only these roles can see this item
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Layout,
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: FileText,
    roles: ["super_admin", "editor", "reporter"],
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Folder,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Tags",
    href: "/admin/tags",
    icon: Grid,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Authors",
    href: "/admin/authors",
    icon: Users,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: ImageIcon,
    roles: ["super_admin", "editor", "video_editor"],
  },
  {
    label: "Videos",
    href: "/admin/videos",
    icon: Video,
    roles: ["super_admin", "video_editor"],
  },
  {
    label: "Programmes",
    href: "/admin/programmes",
    icon: Video,
    roles: ["super_admin", "video_editor", "editor"],
  },
  {
    label: "RSS Feeds",
    href: "/admin/rss",
    icon: Globe,
    roles: ["super_admin", "editor"],
  },
  {
    label: "RSS Items",
    href: "/admin/rss/items",
    icon: FileText,
    roles: ["super_admin", "editor"],
  },
  {
    label: "RSS Monitoring",
    href: "/admin/rss/monitoring",
    icon: Activity,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Breaking News",
    href: "/admin/breaking-news",
    icon: Flame,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Homepage",
    href: "/admin/homepage",
    icon: Grid,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Advertising",
    href: "/admin/ads/dashboard",
    icon: SpeakerIcon,
    roles: ["super_admin", "advertising_manager"],
    children: [
      {
        label: "Dashboard",
        href: "/admin/ads/dashboard",
        icon: BarChart,
        roles: ["super_admin", "advertising_manager"],
      },
      {
        label: "Advertisements",
        href: "/admin/ads",
        icon: SpeakerIcon,
        roles: ["super_admin", "advertising_manager"],
      },
      {
        label: "Ad Slots",
        href: "/admin/ads/slots",
        icon: Grid,
        roles: ["super_admin", "advertising_manager"],
      },
      {
        label: "Sponsors",
        href: "/admin/sponsors",
        icon: Award,
        roles: ["super_admin", "advertising_manager"],
      },
      {
        label: "Settings",
        href: "/admin/ads/settings",
        icon: Settings,
        roles: ["super_admin"],
      },
    ],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: Mail,
    roles: ["super_admin", "editor"],
  },
  {
    label: "Users & Roles",
    href: "/admin/users",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["super_admin"],
  },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUserEmail = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUserEmail();
  }, []);

  const handleSignOut = async () => {
    await authSignOut();
    window.location.href = "/";
  };

  // Filter nav items based on user roles (simplified - should check actual roles)
  const visibleNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true; // No role requirement
    // TODO: Check actual user roles from database
    return true; // For now, show all items
  });

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    // Special handling for advertising routes
    if (href.startsWith("/admin/ads")) {
      return pathname?.startsWith("/admin/ads");
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background-panel px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-text-secondary hover:text-text-primary"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <div className="flex-1">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-vntv-red">VN</span>
              <span className="text-text-primary">TV</span>
            </span>
            <span className="text-xs uppercase tracking-wide text-text-tertiary">
              CMS
            </span>
          </Link>
        </div>
        <ThemeToggle />
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform border-r border-border bg-background-panel
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-vntv-red">VN</span>
              <span className="text-text-primary">TV</span>
            </span>
            <span className="text-xs uppercase tracking-wide text-text-tertiary">
              CMS
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
                      transition-colors
                      ${
                        isActive
                          ? "bg-vntv-red/10 text-vntv-red"
                          : "text-text-secondary hover:bg-background-panel-2 hover:text-text-primary"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>

                  {/* Submenu items */}
                  {hasChildren && isActive && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = isActiveRoute(child.href);

                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium
                                transition-colors
                                ${
                                  isChildActive
                                    ? "bg-vntv-red/10 text-vntv-red"
                                    : "text-text-tertiary hover:bg-background-panel-2 hover:text-text-secondary"
                                }
                              `}
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" />
                              <span>{child.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vntv-red/10 text-sm font-semibold text-vntv-red">
              {userEmail?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-text-primary">
                {userEmail || "User"}
              </p>
              <p className="text-xs text-text-tertiary">Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background-panel-2 hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-background-panel px-6 lg:flex">
          <Breadcrumbs />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              target="_blank"
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              View Site →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname) return null;

  // Parse pathname into breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  
  // Skip if only /admin
  if (segments.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-text-primary">Dashboard</span>
      </div>
    );
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { label, href, isLast: index === segments.length - 1 };
  });

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-text-tertiary" />
          )}
          {crumb.isLast ? (
            <span className="font-medium text-text-primary">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-text-secondary hover:text-text-primary"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
