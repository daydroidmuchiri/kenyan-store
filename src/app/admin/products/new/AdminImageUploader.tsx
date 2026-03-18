"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

interface UploadedImage {
  url: string;
  uploading?: boolean;
  id: string; // local ID for React key tracking
}

interface AdminImageUploaderProps {
  values: string[];       // current array of image URLs (from react-hook-form)
  onChange: (urls: string[]) => void; // update the RHF field
}

export function AdminImageUploader({ values, onChange }: AdminImageUploaderProps) {
  const [draggingOver, setDraggingOver] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>(
    values.filter(Boolean).map((url) => ({ url, id: crypto.randomUUID() }))
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state → parent form whenever images change
  const syncToForm = useCallback((imgs: UploadedImage[]) => {
    const urls = imgs.filter((i) => i.url && !i.uploading).map((i) => i.url);
    onChange(urls);
  }, [onChange]);

  async function uploadFile(file: File): Promise<string | null> {
    // Validate type + size locally first
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type}. Use JPG, PNG or WebP.`);
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "bns_designs");

    const res = await fetch("/api/designs/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Upload failed");
    }

    const data = await res.json();
    return data.secure_url as string;
  }

  async function handleFiles(files: File[]) {
    if (images.filter((i) => !i.uploading).length + files.length > 8) {
      toast.error("Maximum 8 images per product.");
      return;
    }

    // Create placeholder entries to show upload progress
    const placeholders: UploadedImage[] = files.map(() => ({
      url: "",
      uploading: true,
      id: crypto.randomUUID(),
    }));

    const newImgs = [...images, ...placeholders];
    setImages(newImgs);

    // Upload each file in parallel
    await Promise.all(
      files.map(async (file, i) => {
        try {
          const url = await uploadFile(file);
          setImages((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((img) => img.id === placeholders[i].id);
            if (idx !== -1) {
              updated[idx] = { url: url ?? "", uploading: false, id: placeholders[i].id };
            }
            syncToForm(updated);
            return updated;
          });
        } catch (err: any) {
          toast.error(err.message || "Failed to upload image");
          setImages((prev) => {
            const updated = prev.filter((img) => img.id !== placeholders[i].id);
            syncToForm(updated);
            return updated;
          });
        }
      })
    );
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      syncToForm(updated);
      return updated;
    });
  }

  // Drag-and-drop handlers
  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) handleFiles(files);
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed cursor-pointer transition-all duration-200
          flex flex-col items-center justify-center gap-3 py-10 px-4 rounded-sm
          ${draggingOver
            ? "border-brand-600 bg-brand-50 scale-[1.01]"
            : "border-sand hover:border-brand-400 hover:bg-gray-50"
          }
        `}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          draggingOver ? "bg-brand-600 text-white" : "bg-sand text-muted"
        }`}>
          <Upload size={22} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-charcoal">
            {draggingOver ? "Drop images here" : "Drag & drop images here"}
          </p>
          <p className="text-xs text-muted mt-1">or click to browse</p>
          <p className="text-xs text-muted/60 mt-1">JPG, PNG, WebP · Max 10 MB each · Up to 8 images</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) handleFiles(files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Image Grid Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="relative aspect-[3/4] bg-sand overflow-hidden border border-sand group"
            >
              {img.uploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
                  <Loader2 size={22} className="animate-spin text-brand-600" />
                  <span className="text-[10px] text-muted">Uploading...</span>
                </div>
              ) : img.url ? (
                <>
                  <Image
                    src={img.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                      className="p-2 bg-white/90 rounded-full text-red-500 hover:bg-white transition-colors shadow"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {/* Primary badge */}
                  {index === 0 && (
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-charcoal text-cream px-2 py-0.5 rounded-sm">
                      Primary
                    </span>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted">
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.filter((i) => !i.uploading && i.url).length === 0 && (
        <p className="text-xs text-muted text-center">
          No images yet. Upload at least one to continue.
        </p>
      )}
    </div>
  );
}
