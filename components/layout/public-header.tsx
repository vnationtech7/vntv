"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { SearchDialog } from "./search-dialog";
import {
  Menu,
  X,
  Search,
  User,
  Home,
} from "lucide-react";
import { FaFacebook, FaXTwitter, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa6";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Ghana", href: "/category/ghana" },
  { name: "Nigeria", href: "/category/nigeria" },
  { name: "Africa", href: "/category/africa" },
  { name: "World", href: "/category/world" },
  { name: "Politics", href: "/category/politics" },
  { name: "Business", href: "/category/business" },
  { name: "Entertainment", href: "/category/entertainment" },
  { name: "Sports", href: "/category/sports" },
  { name: "Viral", href: "/category/viral" },
  { name: "Opinion", href: "/category/opinion" },
  { name: "Video", href: "/video" },
  { name: "Originals", href: "/originals" },
];

const socialLinks = [
  { name: "Facebook", href: "#", icon: FaFacebook },
  { name: "X (Twitter)", href: "#", icon: FaXTwitter },
  { name: "YouTube", href: "#", icon: FaYoutube },
  { name: "Instagram", href: "#", icon: FaInstagram },
  { name: "TikTok", href: "#", icon: FaTiktok },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { openLogin } = useAuth();
  const { user, profile } = useUserProfile();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-12 items-center justify-between">
            {/* Social Links */}
            <div className="hidden items-center gap-2 md:flex flex-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-background-panel hover:text-text-primary"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Center Logo */}
            <div className="flex items-center justify-center flex-1">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="VNTV Logo"
                  width={96}
                  height={32}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 justify-end flex-1">
              <a
                href="https://vnationpic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 items-center rounded group"
                aria-label="VNation Homepage"
              >
                <Image
                  src="/logo3.png"
                  alt="VNation"
                  width={32}
                  height={32}
                  quality={100}
                  priority
                  className="h-8 w-auto object-contain transition-transform duration-1000 ease-in-out group-hover:scale-110 group-hover:animate-pulse"
                />
              </a>
              <ThemeToggleCompact />
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background-panel hover:text-text-primary"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              {user ? (
                <Link
                  href="/settings"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-vntv-red text-white transition-opacity hover:opacity-90 overflow-hidden"
                  aria-label="Profile"
                >
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || profile.email}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Link>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={openLogin}
                  className="h-8 text-xs"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <div className="text-3xl font-extrabold tracking-tight">
              <span className="text-vntv-red">VN</span>
              <span className="text-text-primary">TV</span>
            </div>
            <p className="text-[8px] tracking-[0.15em] text-text-tertiary uppercase">
              Africa. Our Stories. Our Way.
            </p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-vntv-red ${
                    isActive
                      ? "text-vntv-red"
                      : "text-text-secondary"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-md text-text-primary transition-colors hover:bg-background-panel"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-vntv-red/10 text-vntv-red"
                        : "text-text-secondary hover:bg-background-panel hover:text-text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Social Links */}
            <div className="mt-6 flex items-center justify-center gap-3 border-t border-border pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-background-panel hover:text-text-primary"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
