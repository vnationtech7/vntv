"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useCallback, useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Undo,
  Redo,
  Code,
  Palette,
  Upload,
} from "lucide-react";
import { uploadArticleMedia as clientUploadArticleMedia } from "@/lib/utils/client-upload";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onUpload?: (file: File) => Promise<string>; // Returns URL of uploaded file
  placeholder?: string;
  useClientUpload?: boolean; // If true, use client-side upload (better for large files)
}

export function RichTextEditor({
  content,
  onChange,
  onUpload,
  placeholder = "Start writing your article...",
  useClientUpload = true, // Default to client-side upload for better performance
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Youtube.configure({
        controls: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg my-4",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-vntv-red underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[400px] p-4 focus:outline-none text-text-primary",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          handleFileUpload(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          handleFileUpload(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

      if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        alert("Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG)");
        return;
      }

      setIsUploading(true);
      try {
        let url: string;

        // Use client-side upload if enabled (better for large files like videos)
        if (useClientUpload) {
          const result = await clientUploadArticleMedia(file);
          if (result.error) {
            throw new Error(result.error);
          }
          url = result.url!;
        } else if (onUpload) {
          // Fall back to provided onUpload handler
          url = await onUpload(file);
        } else {
          throw new Error("No upload handler available");
        }
        
        if (validImageTypes.includes(file.type)) {
          // Insert image on a new line
          editor.chain().focus().enter().setImage({ src: url }).enter().run();
        } else if (validVideoTypes.includes(file.type)) {
          // Insert HTML5 video on a new line
          const videoHtml = `<video controls class="w-full rounded-lg my-4"><source src="${url}" type="${file.type}"></video>`;
          editor.chain().focus().enter().insertContent(videoHtml).enter().run();
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setIsUploading(false);
      }
    },
    [editor, onUpload, useClientUpload]
  );

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  if (!editor) {
    return null;
  }

  const textColors = [
    "#000000", // Black
    "#DC2626", // Red (VNTV Red)
    "#2563EB", // Blue
    "#16A34A", // Green
    "#CA8A04", // Yellow
    "#9333EA", // Purple
    "#EA580C", // Orange
    "#64748B", // Gray
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background-panel">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        {/* Color Picker */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            isActive={showColorPicker}
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-background-panel border border-border rounded-lg shadow-lg z-10 flex gap-1">
              {textColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform bg-white text-xs flex items-center justify-center"
                title="Reset color"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Prominent Add Image Button */}
        {(onUpload || useClientUpload) && (
          <button
            type="button"
            onClick={triggerFileUpload}
            disabled={isUploading}
            className="px-3 py-1 bg-vntv-red text-white rounded hover:bg-vntv-red/90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
            title="Upload Image or Video"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Add Image"}
          </button>
        )}

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-sm text-text-secondary">Uploading...</div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="p-2 border-t border-border bg-background-panel">
        <p className="text-xs text-text-tertiary">
          💡 Drag & drop images or videos directly into the editor, or click "Add Image" button
        </p>
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-background transition-colors ${
        isActive ? "bg-vntv-red text-white" : "text-text-secondary"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
