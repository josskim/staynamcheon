"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface SingleImageUploaderProps {
  currentImageUrl?: string;
  onUpload: (url: string) => void;
  className?: string;
  label?: string;
}

export default function SingleImageUploader({ 
  currentImageUrl, 
  onUpload, 
  className,
  label = "Upload Image"
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "staynamcheon/single");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const { url } = await res.json();
      onUpload(url);
    } catch (error) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative aspect-video bg-[#f8f6f6] rounded-xl overflow-hidden border border-[#e4dcdd] group flex flex-col items-center justify-center">
        {currentImageUrl ? (
          <>
            <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                <Upload size={16} />
                변경하기
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center text-[#856669] hover:text-[#DB5461] transition-colors w-full h-full">
            <ImageIcon size={32} className="mb-2" />
            <span className="font-bold text-sm">{label}</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin text-[#DB5461]" size={32} />
          </div>
        )}
      </div>
    </div>
  );
}
