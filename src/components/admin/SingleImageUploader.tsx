import { useState } from "react";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/upload";
import { getThumbnailUrl, getOptimizeImageUrl } from "@/lib/cloudinary";

interface SingleImageUploaderProps {
  currentImageUrl?: string;
  onUpload: (url: string) => void;
  className?: string;
  label?: string;
  acceptVideo?: boolean;
}

export default function SingleImageUploader({ 
  currentImageUrl, 
  onUpload, 
  className,
  label = "Upload Image",
  acceptVideo = false
}: SingleImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  const isVideo = currentImageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || currentImageUrl?.includes("/video/upload/");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, "staynamcheon/single");
      onUpload(result.secure_url);
    } catch (error) {
      console.error(error);
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
            <div 
              className="w-full h-full cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
            >
              {isVideo ? (
                <video src={currentImageUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={getThumbnailUrl(currentImageUrl, 800)} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              )}
            </div>
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg text-xs uppercase tracking-widest whitespace-nowrap">
                <Upload size={14} />
                Change
                <input type="file" className="hidden" accept={acceptVideo ? "image/*,video/mp4,video/webm" : "image/*"} onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center text-[#856669] hover:text-[#DB5461] transition-colors w-full h-full z-10">
            <ImageIcon size={32} className="mb-2" />
            <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
            <input type="file" className="hidden" accept={acceptVideo ? "image/*,video/mp4,video/webm" : "image/*"} onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="animate-spin text-[#DB5461]" size={32} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showLightbox && currentImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setShowLightbox(false)}
          >
            <button className="absolute top-8 right-8 text-white/70 hover:text-white p-2 z-50">
              <X size={40} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo ? (
                <video src={currentImageUrl} controls autoPlay className="max-h-full max-w-full rounded-lg shadow-2xl" />
              ) : (
                <img 
                  src={getOptimizeImageUrl(currentImageUrl, { width: 1600 })} 
                  alt="Original" 
                  className="max-h-full max-w-full rounded-lg shadow-2xl object-contain" 
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
