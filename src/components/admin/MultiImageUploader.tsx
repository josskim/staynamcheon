"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import UploadModal from "./UploadModal";
import { getThumbnailUrl, getOptimizeImageUrl } from "@/lib/cloudinary";

export interface MultiImageItem {
  id: string;      // Unique ID for sorting
  src: string;     // URL
  alt?: string;
  type?: "image" | "video";
}

interface MultiImageUploaderProps {
  items: MultiImageItem[];
  onChange: (items: MultiImageItem[]) => void;
  className?: string;
  horizontal?: boolean;
}

export default function MultiImageUploader({
  items,
  onChange,
  className,
  horizontal = false,
}: MultiImageUploaderProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<MultiImageItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleUploadSuccess = (newItems: any[]) => {
    setIsUploadModalOpen(false);
    const addedItems = newItems.map((ni) => ({
      id: Math.random().toString(36).substring(7),
      src: ni.url,
      type: ni.type,
      alt: "",
    }));
    onChange([...items, ...addedItems]);
  };

  const closeLightbox = () => setSelectedImageIndex(null);
  const showNext = () => setSelectedImageIndex(prev => prev !== null ? (prev + 1) % items.length : null);
  const showPrev = () => setSelectedImageIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : null);

  return (
    <div className={cn("space-y-4", className)}>
      {items.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={
              horizontal ? horizontalListSortingStrategy : verticalListSortingStrategy
            }
          >
            <div
              className={cn(
                "gap-4",
                horizontal
                  ? "flex flex-wrap"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
              )}
            >
              {items.map((item, index) => (
                <SortableImageItem
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemove(item.id)}
                  onChange={(updates) => handleUpdate(item.id, updates)}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
              
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-[#e4dcdd] bg-[#f8f6f6]/30 text-[#856669] hover:bg-[#f8f6f6] hover:border-[#DB5461]/40 hover:text-[#DB5461] transition-all"
              >
                <Plus size={24} className="mb-2" />
                <span className="font-bold text-xs uppercase tracking-widest">Add Item</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#e4dcdd] rounded-3xl bg-[#f8f6f6]/30">
          <ImageIcon size={48} className="text-[#856669]/20 mb-4" />
          <p className="text-[#856669] font-medium mb-6">등록된 이미지가 없습니다.</p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-[#DB5461] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#DB5461]/20"
          >
            <Plus size={18} />
            이미지 추가하기
          </button>
        </div>
      )}

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm p-8 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button 
              onClick={closeLightbox}
              className="absolute top-8 right-8 text-white/70 hover:text-white p-2 transition-colors z-50"
            >
              <X size={40} />
            </button>

            {items.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); showPrev(); }}
                  className="absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-50"
                >
                  <ChevronLeft size={60} strokeWidth={1} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); showNext(); }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-50"
                >
                  <ChevronRight size={60} strokeWidth={1} />
                </button>
              </>
            )}

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {items[selectedImageIndex].type === "video" ? (
                <video 
                  src={items[selectedImageIndex].src} 
                  controls 
                  autoPlay 
                  className="max-h-full max-w-full rounded-lg shadow-2xl"
                />
              ) : (
                <img 
                  src={getOptimizeImageUrl(items[selectedImageIndex].src, { width: 1600 })} 
                  alt={items[selectedImageIndex].alt || ""} 
                  className="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
                />
              )}
              {items[selectedImageIndex].alt && (
                <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                   <p className="text-white font-medium text-lg">{items[selectedImageIndex].alt}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortableImageItem({
  item,
  onRemove,
  onChange,
  onClick,
}: {
  item: MultiImageItem;
  onRemove: () => void;
  onChange: (updates: Partial<MultiImageItem>) => void;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-2xl overflow-hidden border border-[#e4dcdd] bg-white group shadow-sm flex flex-col",
        isDragging ? "opacity-50 scale-105 z-10 shadow-2xl" : ""
      )}
    >
      <div className="relative aspect-video bg-black flex-1 overflow-hidden">
        <div 
          onClick={onClick}
          className="w-full h-full cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
        >
          {item.type === "video" ? (
            <div className="w-full h-full relative">
              <video
                src={item.src}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <Play size={24} className="text-white opacity-80" />
              </div>
            </div>
          ) : (
            <img src={getThumbnailUrl(item.src, 600)} className="w-full h-full object-cover" alt="" />
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onRemove}
            className="w-8 h-8 flex items-center justify-center bg-white/90 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-white/90 text-[#856669] rounded-lg cursor-grab active:cursor-grabbing hover:text-black transition-colors shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={16} />
        </div>
      </div>
      
      <div className="p-3 border-t border-[#f4f1f1]">
        <input
          type="text"
          value={item.alt || ""}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder="이미지 설명 (alt 태그)"
          className="w-full text-xs px-2 py-1.5 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg focus:border-[#DB5461] outline-none transition-colors"
        />
      </div>
    </div>
  );
}
