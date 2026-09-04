"use client";

import { useState } from "react";
import { Plus, Trash2, MoveUp, MoveDown, Type, Image as ImageIcon, Video, Quote, List, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ArticleBlock } from "@/components/content/article-block-renderer";

interface ArticleBlockEditorProps {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}

export function ArticleBlockEditor({ blocks, onChange }: ArticleBlockEditorProps) {
  const [selectedType, setSelectedType] = useState<ArticleBlock["type"]>("paragraph");

  const addBlock = (type: ArticleBlock["type"]) => {
    let newBlock: ArticleBlock;

    switch (type) {
      case "paragraph":
        newBlock = { type: "paragraph", content: "" };
        break;
      case "heading":
        newBlock = { type: "heading", level: 2, content: "" };
        break;
      case "image":
        newBlock = { type: "image", url: "", alt: "", caption: "" };
        break;
      case "video":
        newBlock = { type: "video", url: "", caption: "" };
        break;
      case "youtube":
        newBlock = { type: "youtube", videoId: "", caption: "" };
        break;
      case "quote":
        newBlock = { type: "quote", content: "", author: "" };
        break;
      case "list":
        newBlock = { type: "list", ordered: false, items: [""] };
        break;
      case "divider":
        newBlock = { type: "divider" };
        break;
      default:
        newBlock = { type: "paragraph", content: "" };
    }

    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedBlock: ArticleBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      {/* Block List */}
      {blocks.map((block, index) => (
        <div key={index} className="border border-border rounded-lg p-4 bg-background-panel">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary uppercase">
                {block.type}
              </span>
              {block.type === "heading" && (
                <span className="text-xs text-text-tertiary">H{block.level}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(index, "up")}
                disabled={index === 0}
                className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-30"
                title="Move up"
              >
                <MoveUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, "down")}
                disabled={index === blocks.length - 1}
                className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-30"
                title="Move down"
              >
                <MoveDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteBlock(index)}
                className="p-1 text-red-600 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <BlockEditor block={block} onChange={(updated) => updateBlock(index, updated)} />
        </div>
      ))}

      {/* Add Block Buttons */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 bg-background">
        <p className="text-sm font-medium text-text-primary mb-3">Add Content Block:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("paragraph")}
            className="flex items-center gap-2"
          >
            <Type className="w-4 h-4" />
            Paragraph
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("heading")}
            className="flex items-center gap-2"
          >
            <Type className="w-4 h-4 font-bold" />
            Heading
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("image")}
            className="flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("video")}
            className="flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Video
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("youtube")}
            className="flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            YouTube
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("quote")}
            className="flex items-center gap-2"
          >
            <Quote className="w-4 h-4" />
            Quote
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("list")}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("divider")}
            className="flex items-center gap-2"
          >
            <Minus className="w-4 h-4" />
            Divider
          </Button>
        </div>
      </div>
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: ArticleBlock; onChange: (block: ArticleBlock) => void }) {
  switch (block.type) {
    case "paragraph":
      return (
        <Textarea
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          placeholder="Enter paragraph text..."
          rows={4}
          className="w-full"
        />
      );

    case "heading":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={block.level}
              onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
              <option value={5}>H5</option>
              <option value={6}>H6</option>
            </select>
            <Input
              value={block.content}
              onChange={(e) => onChange({ ...block, content: e.target.value })}
              placeholder="Enter heading text..."
              className="flex-1"
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <Input
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="Image URL"
          />
          <Input
            value={block.alt || ""}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Alt text (for accessibility)"
          />
          <Input
            value={block.caption || ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (optional)"
          />
          <Input
            value={block.credit || ""}
            onChange={(e) => onChange({ ...block, credit: e.target.value })}
            placeholder="Photo credit (optional)"
          />
        </div>
      );

    case "video":
      return (
        <div className="space-y-2">
          <Input
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            placeholder="Video URL (uploaded video from media library)"
          />
          <Input
            value={block.thumbnail || ""}
            onChange={(e) => onChange({ ...block, thumbnail: e.target.value })}
            placeholder="Thumbnail URL (optional)"
          />
          <Input
            value={block.caption || ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (optional)"
          />
          <p className="text-xs text-text-tertiary">
            Upload video to Media Library first, then paste the public URL here
          </p>
        </div>
      );

    case "youtube":
      return (
        <div className="space-y-2">
          <Input
            value={block.videoId}
            onChange={(e) => onChange({ ...block, videoId: e.target.value })}
            placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ)"
          />
          <Input
            value={block.caption || ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (optional)"
          />
          <p className="text-xs text-text-tertiary">
            Find the video ID in the YouTube URL: youtube.com/watch?v=<strong>VIDEO_ID</strong>
          </p>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-2">
          <Textarea
            value={block.content}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder="Quote text..."
            rows={3}
          />
          <Input
            value={block.author || ""}
            onChange={(e) => onChange({ ...block, author: e.target.value })}
            placeholder="Author name (optional)"
          />
          <Input
            value={block.source || ""}
            onChange={(e) => onChange({ ...block, source: e.target.value })}
            placeholder="Source (optional)"
          />
        </div>
      );

    case "list":
      return (
        <div className="space-y-2">
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              size="sm"
              variant={block.ordered ? "outline" : "primary"}
              onClick={() => onChange({ ...block, ordered: false })}
            >
              Bullet List
            </Button>
            <Button
              type="button"
              size="sm"
              variant={block.ordered ? "primary" : "outline"}
              onClick={() => onChange({ ...block, ordered: true })}
            >
              Numbered List
            </Button>
          </div>
          {block.items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...block.items];
                  newItems[idx] = e.target.value;
                  onChange({ ...block, items: newItems });
                }}
                placeholder={`Item ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => {
                  const newItems = block.items.filter((_, i) => i !== idx);
                  onChange({ ...block, items: newItems.length > 0 ? newItems : [""] });
                }}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChange({ ...block, items: [...block.items, ""] })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      );

    case "divider":
      return (
        <div className="py-4 text-center text-text-tertiary">
          <hr className="border-t border-border" />
          <p className="text-xs mt-2">Horizontal divider</p>
        </div>
      );

    default:
      return <p className="text-text-tertiary text-sm">Unknown block type</p>;
  }
}
