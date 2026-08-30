import Image from "next/image";
import { Quote } from "lucide-react";

export type ArticleBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: string }
  | { type: "image"; url: string; alt?: string; caption?: string; credit?: string }
  | { type: "video"; url: string; thumbnail?: string; caption?: string }
  | { type: "youtube"; videoId: string; caption?: string }
  | { type: "quote"; content: string; author?: string; source?: string }
  | { type: "embed"; html: string; caption?: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "divider" };

interface ArticleBlockRendererProps {
  blocks: ArticleBlock[];
  className?: string;
}

export function ArticleBlockRenderer({ blocks, className = "" }: ArticleBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <p className="text-text-secondary">No content available.</p>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none text-text-primary ${className}`}>
      {blocks.map((block, index) => (
        <ArticleBlock key={index} block={block} />
      ))}
    </div>
  );
}

function ArticleBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="mb-4 leading-relaxed">
          {block.content}
        </p>
      );

    case "heading":
      const headingClasses = {
        1: "text-4xl font-extrabold mt-12 mb-6",
        2: "text-3xl font-bold mt-10 mb-5",
        3: "text-2xl font-bold mt-8 mb-4",
        4: "text-xl font-bold mt-6 mb-3",
        5: "text-lg font-bold mt-4 mb-2",
        6: "text-base font-bold mt-4 mb-2",
      };
      
      switch (block.level) {
        case 1:
          return <h1 className={headingClasses[1]}>{block.content}</h1>;
        case 2:
          return <h2 className={headingClasses[2]}>{block.content}</h2>;
        case 3:
          return <h3 className={headingClasses[3]}>{block.content}</h3>;
        case 4:
          return <h4 className={headingClasses[4]}>{block.content}</h4>;
        case 5:
          return <h5 className={headingClasses[5]}>{block.content}</h5>;
        case 6:
          return <h6 className={headingClasses[6]}>{block.content}</h6>;
        default:
          return <h2 className={headingClasses[2]}>{block.content}</h2>;
      }

    case "image":
      return (
        <figure className="my-8">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={block.url}
              alt={block.alt || "Article image"}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
          {(block.caption || block.credit) && (
            <figcaption className="mt-3 text-sm text-text-secondary">
              {block.caption && <span>{block.caption}</span>}
              {block.credit && (
                <span className="block mt-1 text-xs">
                  Credit: {block.credit}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      );

    case "video":
      return (
        <figure className="my-8">
          <div className="relative overflow-hidden rounded-lg bg-background-panel aspect-video">
            <video
              src={block.url}
              controls
              poster={block.thumbnail}
              className="w-full h-full"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-sm text-text-secondary">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "youtube":
      return (
        <figure className="my-8">
          <div className="relative overflow-hidden rounded-lg bg-background-panel aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${block.videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-sm text-text-secondary">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "quote":
      return (
        <blockquote className="my-8 border-l-4 border-vntv-red bg-background-panel p-6 rounded-r-lg">
          <Quote className="w-8 h-8 text-vntv-red mb-4 opacity-50" />
          <p className="text-xl font-medium leading-relaxed mb-4">
            "{block.content}"
          </p>
          {(block.author || block.source) && (
            <footer className="text-sm text-text-secondary">
              {block.author && <cite className="font-semibold not-italic">{block.author}</cite>}
              {block.author && block.source && <span className="mx-2">—</span>}
              {block.source && <span>{block.source}</span>}
            </footer>
          )}
        </blockquote>
      );

    case "embed":
      return (
        <figure className="my-8">
          <div
            className="overflow-hidden rounded-lg"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
          {block.caption && (
            <figcaption className="mt-3 text-sm text-text-secondary">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "list":
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className={`my-6 ${block.ordered ? "list-decimal" : "list-disc"} list-inside space-y-2`}>
          {block.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      );

    case "divider":
      return (
        <hr className="my-8 border-t border-border" />
      );

    default:
      return null;
  }
}
