import { useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";

interface AdminCloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  folder?: string;
}

export default function AdminCloudinaryUpload({ 
  onUploadSuccess, 
  folder = "staynamcheon/stories" 
}: AdminCloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, folder);
      onUploadSuccess(result.secure_url);
    } catch (error) {
      console.error(error);
      alert("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          await handleUpload(file);
        }
      }
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          await handleUpload(file);
        } else {
          alert(`지원하지 않는 파일 형식입니다: ${file.name}`);
        }
      }
    }
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center py-12 transition-all border-2 rounded-xl mb-4 bg-gray-50/50 ${
        isDragging 
          ? "border-primary bg-primary/5 border-solid scale-[1.02]" 
          : "border-gray-300 border-dashed hover:border-primary/50 hover:bg-gray-50"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {uploading ? (
        <div className="flex flex-col items-center text-primary">
          <Loader2 className="animate-spin mb-2" size={32} />
          <span className="text-sm font-medium">업로드 중... (순차 진행)</span>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors w-full h-full min-h-[120px]">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <ImageIcon size={32} className="opacity-80 text-gray-400 group-hover:text-primary" />
          </div>
          <span className="font-bold text-base text-gray-700">{isDragging ? "여기에 파일을 모두 놓으세요!" : "이 박스 안에 사진이나 영상을 여러 개 드래그 앤 드롭 하세요"}</span>
          <span className="text-sm mt-2 font-medium text-gray-500">또는 <span className="text-primary hover:underline">클릭하여 파일 선택</span> (다중 선택 가능)</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,video/*" 
            multiple
            onChange={handleFileChange} 
            disabled={uploading} 
          />
        </label>
      )}
    </div>
  );
}
