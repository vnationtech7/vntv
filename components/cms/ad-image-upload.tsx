"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from "lucide-react";
import Image from "next/image";

interface AdImageUploadProps {
  slotKey: string;
  requiredWidth: number;
  requiredHeight: number;
  ratio: string;
  onUploadSuccess: (data: {
    path: string;
    width: number;
    height: number;
    url: string;
  }) => void;
  currentImageUrl?: string | null;
  onRemove?: () => void;
}

export function AdImageUpload({
  slotKey,
  requiredWidth,
  requiredHeight,
  ratio,
  onUploadSuccess,
  currentImageUrl,
  onRemove,
}: AdImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Image must be less than 2MB");
      }

      // Validate dimensions
      const { width, height } = await validateImage(file);

      if (width !== requiredWidth || height !== requiredHeight) {
        throw new Error(
          `Image must be exactly ${requiredWidth}x${requiredHeight}px (${ratio} ratio). Your image is ${width}x${height}px. Please resize your image and try again.`
        );
      }

      // Upload to Supabase storage
      const supabase = createClient();
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${timestamp}_${slotKey}.${fileExt}`;
      const filePath = `${slotKey}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("advertisements")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("advertisements").getPublicUrl(filePath);

      // Success callback
      onUploadSuccess({
        path: filePath,
        width,
        height,
        url: publicUrl,
      });

      setUploading(false);
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Requirements Info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-400 mb-1">Required Dimensions</div>
            <div className="text-blue-300">
              <strong>{requiredWidth}x{requiredHeight}px</strong> ({ratio} aspect ratio)
            </div>
            <div className="text-blue-300/80 text-xs mt-1">
              • JPG, PNG, or WebP format<br />
              • Maximum file size: 2MB<br />
              • Exact dimensions required (strict validation)
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area or Preview */}
      {currentImageUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-border">
            <Image
              src={currentImageUrl}
              alt="Advertisement preview"
              width={requiredWidth}
              height={requiredHeight}
              className="w-full h-auto"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <Check className="w-4 h-4" />
              <span>Image uploaded successfully</span>
            </div>
            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive ? "border-primary bg-primary/5" : "border-border"}
            ${uploading ? "opacity-50 pointer-events-none" : "cursor-pointer hover:border-primary/50"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />

          <div className="space-y-3">
            <div className="flex justify-center">
              {uploading ? (
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-12 h-12 text-text-tertiary" />
              )}
            </div>

            {uploading ? (
              <p className="text-text-secondary">Uploading and validating...</p>
            ) : (
              <>
                <div>
                  <p className="text-text-primary font-medium mb-1">
                    Drop your ad image here or click to upload
                  </p>
                  <p className="text-sm text-text-tertiary">
                    Must be {requiredWidth}x{requiredHeight}px • Max 2MB
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
