"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUp,
} from "lucide-react";
import { FaFacebook, FaXTwitter, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa6";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

const exploreLinks = [
  { name: "Ghana", href: "/category/ghana" },
  { name: "Nigeria", href: "/category/nigeria" },
  { name: "Africa", href: "/category/africa" },
  { name: "World", href: "/category/world" },
  { name: "Politics", href: "/category/politics" },
  { name: "Business", href: "/category/business" },
];

const aboutLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Advertise", href: "/advertise" },
  { name: "Careers", href: "/careers" },
];

const supportLinks = [
  { name: "Help Center", href: "/help" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Cookie Policy", href: "/cookies" },
];

const moreLinks = [
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

export function PublicFooter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await subscribeToNewsletter(email);
      
      if (result.success) {
        setMessage(result.message || "Thank you for subscribing!");
        setIsError(false);
        setEmail("");
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage("");
        }, 5000);
      } else {
        setMessage(result.error || "Failed to subscribe");
        setIsError(true);
        
        // Clear error after 5 seconds
        setTimeout(() => {
          setMessage("");
          setIsError(false);
        }, 5000);
      }
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-background-panel">
      {/* Newsletter Section */}
      <div className="border-b border-border bg-background-panel-2">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Stay Informed
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Get the latest African news delivered to your inbox
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="flex-1"
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            {message && (
              <p className={`text-sm mt-3 ${isError ? "text-red-500" : "text-green-500"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Explore */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-4">
              Explore
            </h4>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-vntv-red transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-4">
              About
            </h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-vntv-red transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-vntv-red transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More from VNTV */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-4">
              More from VNTV
            </h4>
            <ul className="space-y-2">
              {moreLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-vntv-red transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 flex flex-col items-center gap-6 border-t border-border pt-8">
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-vntv-red hover:text-vntv-red"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-sm text-text-tertiary text-center">
            © {new Date().getFullYear()} VNTV. All rights reserved.
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-vntv-red text-white shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-vntv-red focus:ring-offset-2"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
}
