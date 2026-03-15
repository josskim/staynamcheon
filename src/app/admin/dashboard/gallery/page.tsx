"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Upload,
  Save,
  Loader2,
  Play,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: string;
  imageUrl: string;
  publicId?: string; // Optional for existing items
  videoUrl?: string;
  type: "image" | "video";
  order: number;
  isStaged?: boolean; // New items not yet saved
}

export default function GalleryManagementPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cleaningTemp, setCleaningTemp] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const stagedPublicIdsRef = useRef<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedIndexRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  );

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items]
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const stagedPublicIds = useMemo(
    () =>
      items
        .filter((item) => item.isStaged && item.publicId && item.publicId.includes("temp/"))
        .map((item) => item.publicId as string),
    [items]
  );

  useEffect(() => {
    stagedPublicIdsRef.current = stagedPublicIds;
  }, [stagedPublicIds]);

  useEffect(() => {
    return () => {
      const publicIds = stagedPublicIdsRef.current;
      if (!publicIds || publicIds.length === 0) return;
      const payload = JSON.stringify({ publicIds });
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/admin/gallery/temp-cleanup", blob);
        return;
      }
      fetch("/api/admin/gallery/temp-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => undefined);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
        setSelectedIds(new Set());
        lastSelectedIndexRef.current = null;
      } else {
        console.error("API did not return an array:", data);
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch gallery items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      setHasChanges(true);
      return next;
    });
  };

  const commitChanges = async () => {
    setSaving(true);
    try {
      const commitItems = items.map((item, index) => ({
        id: item.isStaged ? undefined : item.id,
        publicId: item.publicId,
        imageUrl: item.imageUrl,
        videoUrl: item.videoUrl,
        type: item.type,
        order: index + 1
      }));

      const res = await fetch("/api/admin/gallery/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: commitItems })
      });

      if (res.ok) {
        setHasChanges(false);
        fetchItems(); // Refresh to get real IDs and definitive URLs
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "Failed to commit changes");
      }
    } catch (error) {
      alert("Failed to commit changes");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string, isStaged: boolean) => {
    if (isStaged) {
      const stagedItem = items.find((item) => item.id === id);
      if (stagedItem?.publicId) {
        fetch("/api/admin/gallery/temp-cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicIds: [stagedItem.publicId] })
        }).catch(() => undefined);
      }
      setItems(prev => prev.filter(item => item.id !== id));
      setHasChanges(true);
      return;
    }
    if (!confirm("Delete this item permanently?")) return;
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      alert("Failed to delete item");
    }
  };

  const toggleSelect = (id: string, index: number, isShift: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isShift && lastSelectedIndexRef.current !== null) {
        const start = Math.min(lastSelectedIndexRef.current, index);
        const end = Math.max(lastSelectedIndexRef.current, index);
        for (let i = start; i <= end; i += 1) {
          const itemId = items[i]?.id;
          if (itemId) next.add(itemId);
        }
      } else {
        if (next.has(id)) next.delete(id);
        else next.add(id);
        lastSelectedIndexRef.current = index;
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    lastSelectedIndexRef.current = null;
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`선택한 ${selectedIds.size}개 이미지를 삭제할까요?`)) return;

    const idsToDelete = new Set(selectedIds);
    const selectedItems = items.filter((item) => idsToDelete.has(item.id));
    const stagedItems = selectedItems.filter((item) => item.isStaged);
    const savedItems = selectedItems.filter((item) => !item.isStaged);

    if (stagedItems.length > 0) {
      const publicIds = stagedItems
        .map((item) => item.publicId)
        .filter((pid): pid is string => !!pid);
      if (publicIds.length > 0) {
        fetch("/api/admin/gallery/temp-cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicIds })
        }).catch(() => undefined);
      }
    }

    if (savedItems.length > 0) {
      await Promise.all(
        savedItems.map((item) =>
          fetch(`/api/admin/gallery?id=${item.id}`, { method: "DELETE" }).catch(() => undefined)
        )
      );
    }

    setItems((prev) => prev.filter((item) => !idsToDelete.has(item.id)));
    clearSelection();
  };

  const cleanupTempFolder = async () => {
    if (!confirm("임시보관함의 모든 이미지를 삭제할까요?")) return;
    setCleaningTemp(true);
    try {
      const res = await fetch("/api/admin/gallery/temp-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all" })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`임시보관함 정리 완료 (${data?.deleted ?? 0}건)`);
      } else {
        alert("임시보관함 정리에 실패했습니다.");
      }
    } catch {
      alert("임시보관함 정리에 실패했습니다.");
    } finally {
      setCleaningTemp(false);
    }
  };

  const addStagedItems = (newItems: { url: string, publicId: string, type: "image" | "video", posterUrl?: string }[]) => {
    const staged: GalleryItem[] = newItems.map(ni => ({
      id: Math.random().toString(), // Temp ID for DnD key
      imageUrl: ni.type === "video" ? (ni.posterUrl || ni.url) : ni.url,
      videoUrl: ni.type === "video" ? ni.url : undefined,
      publicId: ni.publicId,
      type: ni.type,
      order: 0,
      isStaged: true
    }));
    setItems(prev => [...staged, ...prev]); // Prepend new items
    setHasChanges(true);
  };

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading gallery...</div>;

  return (
    <div className="space-y-8 max-w-7xl pb-40">
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-3xl border border-[#e4dcdd] shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#171212] tracking-tight">Gallery Management</h1>
          <p className="text-[#856669] mt-1 text-sm font-medium">Drag to reorder. New items appear with a green border before saving.</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 bg-red-500 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Trash2 size={18} />
              Delete Selected ({selectedIds.size})
            </button>
          )}
          <button
            onClick={cleanupTempFolder}
            disabled={cleaningTemp}
            className="flex items-center gap-2 border border-[#e4dcdd] text-[#856669] px-5 py-3 rounded-2xl font-bold text-sm hover:bg-[#f8f6f6] active:scale-95 transition-all disabled:opacity-50"
          >
            {cleaningTemp ? <Loader2 className="animate-spin" size={18} /> : null}
            Temp Cleanup
          </button>
          {hasChanges && (
            <button
              onClick={commitChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-[#DB5461] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#DB5461]/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Complete Registration
            </button>
          )}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            Add Images (Stage)
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => setActiveId(String(event.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {(Array.isArray(items) ? items : []).map((item, index) => (
                <SortableGalleryItem
                  key={item.id}
                  item={item}
                  index={index}
                  onDelete={() => deleteItem(item.id, !!item.isStaged)}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={(shiftKey) => toggleSelect(item.id, index, shiftKey)}
                  onPreview={() => setPreviewItem(item)}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeItem ? (
            <GalleryCard
              item={activeItem}
              isDragging
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {(!items || items.length === 0) && (
        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-[#e4dcdd] rounded-3xl bg-white/50">
          <ImageIcon size={48} className="text-[#856669]/20 mb-4" />
          <p className="text-[#856669] font-medium">이미지가 없습니다. 첫 이미지를 등록해보세요!</p>
        </div>
      )}

      {isUploadModalOpen && (
        <UploadModal 
          onClose={() => setIsUploadModalOpen(false)} 
          onSuccess={(newItems) => {
            setIsUploadModalOpen(false);
            addStagedItems(newItems);
          }}
        />
      )}

      {previewItem && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-6"
          onClick={() => setPreviewItem(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-[121] w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
            {previewItem.type === "video" ? (
              <video
                src={previewItem.videoUrl || previewItem.imageUrl}
                poster={previewItem.imageUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <img
                src={previewItem.imageUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SortableGalleryItem({
  item,
  index,
  onDelete,
  isSelected,
  onToggleSelect,
  onPreview,
}: {
  item: GalleryItem;
  index: number;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: (shiftKey: boolean) => void;
  onPreview: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GalleryCard
        item={item}
        onDelete={onDelete}
        isDragging={isDragging}
        isOver={isOver}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onPreview={onPreview}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

function GalleryCard({
  item,
  onDelete,
  isDragging,
  isOver,
  isOverlay,
  isSelected,
  onToggleSelect,
  onPreview,
  dragAttributes,
  dragListeners
}: {
  item: GalleryItem;
  onDelete?: () => void;
  isDragging?: boolean;
  isOver?: boolean;
  isOverlay?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (shiftKey: boolean) => void;
  onPreview?: () => void;
  dragAttributes?: any;
  dragListeners?: any;
}) {
  return (
    <div
      {...dragAttributes}
      {...dragListeners}
      className={cn(
        "relative aspect-square bg-white rounded-3xl border overflow-hidden group shadow-sm transition-all cursor-grab active:cursor-grabbing",
        item.isStaged ? "border-green-400 border-2" : "border-[#e4dcdd]",
        isSelected ? "ring-2 ring-[#DB5461] ring-offset-2" : "",
        isDragging ? "opacity-60 scale-[1.02] shadow-2xl z-50" : "hover:shadow-xl",
        isOver ? "ring-2 ring-[#DB5461] ring-offset-2" : ""
      )}
      style={isOverlay ? { boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.35)" } : undefined}
    >
      {onToggleSelect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect((e as any).shiftKey);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-4 left-4 z-20 w-9 h-9 rounded-md border shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
            isSelected
              ? "bg-black/80 border-white text-white"
              : "bg-white border-white text-black"
          )}
          aria-label="Select image"
        >
          {isSelected ? (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
              <path d="M1 6.5L5.5 11L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </button>
      )}
      {onPreview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-lg"
          aria-label="Preview"
        >
          <Search size={16} />
        </button>
      )}
      {item.type === "video" ? (
        <div className="w-full h-full bg-black">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play size={40} className="text-white opacity-80" />
          </div>
        </div>
      ) : (
        <img
          src={item.imageUrl}
          alt=""
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      )}

      {isOver && !isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-[#DB5461] rounded-3xl bg-[#DB5461]/5 flex items-center justify-center text-xs font-bold text-[#DB5461]">
          여기로 이동
        </div>
      )}

      {item.isStaged && (
        <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md z-10">
          STAGED
        </div>
      )}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg z-10"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (items: any[]) => void }) {
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
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "staynamcheon/temp");
        
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        });
        const { url, publicId, public_id, posterUrl } = await uploadRes.json();
        
        uploadedItems.push({
          url,
          publicId: publicId || public_id,
          posterUrl,
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
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#f4f1f1] flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#171212]">이미지 추가/관리</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#f8f6f6] rounded-full transition-colors text-[#856669]">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Info Area */}
          <div className="text-sm">
            <div className="text-[#856669] leading-relaxed">
              현재 <span className="text-[#DB5461] font-bold">{files.length}장의 이미지</span>가 대기 중입니다. (최대 120장 등록 가능)<br/>
              파일을 아래 영역에 끌어서 놓거나 클릭하여 추가해주세요.
            </div>
          </div>

          {/* Compact Drop Area (1/4 size) */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={onDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300",
              isOver 
                ? "border-[#DB5461] bg-[#DB5461]/5" 
                : "border-[#e4dcdd] bg-[#f8f6f6]/30 hover:border-[#DB5461]/40"
            )}
          >
            <Upload size={24} className="text-[#DB5461] mb-2" />
            <p className="text-sm font-bold text-[#171212]">이미지를 여기에 드래그하거나 클릭하여 파일 선택</p>
            <input 
              type="file" multiple className="hidden" id="browse-files" accept="image/*,video/mp4"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
            />
          </div>

          {/* Thumbnail Grid Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-3 pt-4">
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
        <div className="px-8 py-6 border-t border-[#f4f1f1] flex justify-center gap-3 bg-[#fdfdfd]">
          <button 
            onClick={onClose}
            className="px-10 py-3 rounded-xl border border-[#e4dcdd] font-bold text-[#856669] hover:bg-[#f8f6f6] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="px-12 py-3 bg-[#00B96B] text-white rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#00B96B]/20 flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : null}
            등록
          </button>
        </div>
      </motion.div>
    </div>
  );
}
