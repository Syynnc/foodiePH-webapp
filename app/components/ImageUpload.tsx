"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage, type UploadBucket } from "@/lib/supabase/storage";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 5;

interface ImageUploadProps {
  /** Current image URL (controlled). */
  value: string;
  /** Called with the new public URL after a successful upload, or "" when cleared. */
  onChange: (url: string) => void;
  /** Which Supabase Storage bucket to upload to. */
  bucket: UploadBucket;
  /** Sub-folder inside the bucket. */
  folder?: string;
  /** Displayed as the placeholder label. */
  label?: string;
  /** Aspect ratio class e.g. "aspect-[3/2]" or "aspect-square". Default: aspect-[3/2]. */
  aspectRatio?: string;
  /** Extra wrapper className. */
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  folder = "uploads",
  label = "Upload image",
  aspectRatio = "aspect-[3/2]",
  className = "",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");

    if (!ACCEPTED.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, or GIF images are accepted.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImage(file, bucket, folder);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected after clearing
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    onChange("");
    setError("");
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden border-2 transition-all duration-200 ${
          dragOver
            ? "border-[#c8783a] bg-[#c8783a]/[0.04]"
            : value
            ? "border-[#1a1208]/10 bg-[#f5ede0]"
            : "border-dashed border-[#1a1208]/15 bg-[#1a1208]/[0.02] hover:border-[#c8783a]/40 hover:bg-[#c8783a]/[0.02]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={value ? "Change image" : label}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      >
        {/* Preview */}
        {value && !uploading && (
          <Image src={value} alt="Preview" fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDFBF7]/90 gap-2 z-10">
            <svg className="animate-spin w-6 h-6 text-[#c8783a]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            <p className="text-[11px] font-semibold text-[#1a1208]/50">Uploading…</p>
          </div>
        )}

        {/* Idle empty state */}
        {!value && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-[#1a1208]/[0.05] flex items-center justify-center text-[#1a1208]/30">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#1a1208]/50 leading-snug">{label}</p>
              <p className="text-[10px] text-[#1a1208]/25 mt-0.5">Drag & drop or click · JPEG, PNG, WebP up to {MAX_MB} MB</p>
            </div>
          </div>
        )}

        {/* Hover overlay when image is set */}
        {value && !uploading && !disabled && (
          <div className="absolute inset-0 bg-[#1a1208]/0 hover:bg-[#1a1208]/30 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <span className="text-white text-[11px] font-bold uppercase tracking-[0.12em] bg-[#1a1208]/60 px-3 py-1.5 rounded-lg">
              Change photo
            </span>
          </div>
        )}
      </div>

      {/* Actions row */}
      {value && !uploading && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-[#1a1208]/30 truncate max-w-[260px]">
            {value.split("/").pop()}
          </p>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-[10px] font-bold uppercase tracking-[0.1em] text-red-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-400 font-medium flex items-center gap-1.5">
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled || uploading}
        tabIndex={-1}
      />
    </div>
  );
}
