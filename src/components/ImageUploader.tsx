"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  description?: string;
  aspectRatio?: "square" | "wide" | "banner";
}

export default function ImageUploader({ label, value, onChange, description, aspectRatio = "wide" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlMode, setUrlMode] = useState(false);

  const aspectClass = {
    square: "aspect-square",
    wide: "aspect-video",
    banner: "aspect-[3/1]",
  }[aspectRatio];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Upload failed");
      } else {
        onChange(data.url);
      }
    } catch (err) {
      setError("Upload failed — please try again");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</label>
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 hover:text-pink-400 transition-colors"
        >
          {urlMode ? "← Switch to Upload" : "Use URL instead →"}
        </button>
      </div>

      {urlMode ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 placeholder-zinc-600"
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <>
          {/* Preview or Drop Zone */}
          <div
            className={`relative ${aspectClass} rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer group transition-all ${
              value ? "border-zinc-700 bg-zinc-950" : "border-zinc-800 bg-zinc-950/40 hover:border-pink-500/50"
            }`}
            onClick={() => !uploading && inputRef.current?.click()}
          >
            {value ? (
              <>
                <img
                  src={value}
                  alt={label}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2 text-white">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase">Change Image</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(""); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-600/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors p-4">
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                    <span className="text-xs font-bold uppercase text-pink-400">Uploading...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-pink-500/40 transition-colors">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-wide">Click to upload</p>
                      {description && <p className="text-[10px] text-zinc-600 mt-1">{description}</p>}
                      <p className="text-[9px] text-zinc-700 mt-1">JPG, PNG, WebP, GIF · Max 10MB</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </>
      )}

      {error && (
        <p className="text-[10px] text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
