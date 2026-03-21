"use client";

import { useState, useCallback } from "react";
import { X, Upload, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/upload";

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (items: any[]) => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ src: string; type: "image" | "video" }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith("image/") || f.type.startsWith("video/mp4"));
    setFiles(prev => [...prev, ...validFiles]);
    
    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [
          ...prev,
          {
            src: reader.result as string,
            type: file.type.startsWith("video") ? "video" : "image"
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadedItems = [];
      for (const file of files) {
        const result = await uploadToCloudinary(file, "staynamcheon/temp");
        
        uploadedItems.push({
          url: result.secure_url,
          publicId: result.public_id,
          posterUrl: Array.isArray(result?.eager) && result.eager[0]?.secure_url ? result.eager[0].secure_url : undefined,
          type: file.type.startsWith("video") ? "video" : "image"
        });
      }
      onSuccess(uploadedItems);
    } catch (error) {
      alert("Failed to upload some files");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-[95%] md:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-[#f4f1f1] flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold text-[#171212]">이미지 추가/관리</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#f8f6f6] rounded-full transition-colors text-[#856669]">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 md:p-8 space-y-4 md:space-y-6 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Info Area */}
          <div className="text-xs md:text-sm">
            <div className="text-[#856669] leading-relaxed">
              현재 <span className="text-[#DB5461] font-bold">{files.length}장의 이미지</span>가 대기 중입니다.<br className="hidden md:block"/>
              파일을 아래 영역에 끌어서 놓거나 클릭하여 추가해주세요.
            </div>
          </div>

          {/* Compact Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={onDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 md:p-8 flex flex-col items-center justify-center transition-all duration-300",
              isOver 
                ? "border-[#DB5461] bg-[#DB5461]/5" 
                : "border-[#e4dcdd] bg-[#f8f6f6]/30 hover:border-[#DB5461]/40"
            )}
          >
            <Upload size={24} className="text-[#DB5461] mb-2" />
            <p className="text-xs md:text-sm font-bold text-[#171212] text-center">이미지를 여기에 드래그하거나 <br className="md:hidden"/>클릭하여 파일 선택</p>
            <input 
              type="file" multiple className="hidden" id="browse-files" accept="image/*,video/mp4"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            />
          </div>

          {/* Thumbnail Grid Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-4">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#e4dcdd] group group-hover:shadow-lg transition-all">
                  {preview.type === "video" ? (
                    <div className="relative w-full h-full">
                      <video
                        src={preview.src}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        loop
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play size={16} className="text-white opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <img src={preview.src} className="w-full h-full object-cover" alt="" />
                  )}
                  <button 
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white/80 rounded flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-t border-[#f4f1f1] flex justify-center gap-3 bg-[#fdfdfd]">
          <button 
            onClick={onClose}
            className="flex-1 md:flex-none md:px-10 py-3 rounded-xl border border-[#e4dcdd] font-bold text-[#856669] hover:bg-[#f8f6f6] transition-colors text-sm md:text-base"
          >
            취소
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="flex-[2] md:flex-none md:px-12 py-3 bg-[#00B96B] text-white rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#00B96B]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale text-sm md:text-base"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : null}
            등록
          </button>
        </div>
      </motion.div>
    </div>
  );
}
