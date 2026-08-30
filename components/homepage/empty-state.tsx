import Link from "next/link";
import { FileText, Video, Flame } from "lucide-react";

interface EmptyStateProps {
  type: "articles" | "videos" | "breaking";
}

export function EmptyState({ type }: EmptyStateProps) {
  const config = {
    articles: {
      icon: FileText,
      title: "No Articles Yet",
      description: "Start by creating and publishing articles in the CMS.",
      link: "/admin/articles/new",
      linkText: "Create Article",
    },
    videos: {
      icon: Video,
      title: "No Videos Yet",
      description: "Add videos to your content library to display them here.",
      link: "/admin/videos",
      linkText: "Manage Videos",
    },
    breaking: {
      icon: Flame,
      title: "No Breaking News",
      description: "Create breaking news items to show in the ticker.",
      link: "/admin/breaking-news",
      linkText: "Add Breaking News",
    },
  };

  const { icon: Icon, title, description, link, linkText } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 rounded-full bg-[--panel] p-6">
        <Icon className="w-12 h-12 text-[--muted]" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-[--muted] mb-6 max-w-md">{description}</p>
      <Link
        href={link}
        className="inline-flex items-center gap-2 bg-[--red] text-white text-sm font-bold px-6 py-3 rounded-md hover:bg-[#c11026] transition-colors"
      >
        {linkText}
      </Link>
    </div>
  );
}
