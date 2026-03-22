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
import UploadModal from "@/components/admin/UploadModal";
import { getThumbnailUrl } from "@/lib/cloudinary";

interface GalleryItem {
  id: string;
  imageUrl: string;
  publicId?: string; // Optional for existing items
  videoUrl?: string;
  type: "image" | "video";
  order: number;
  isVisible: boolean; // Added for completeness
  isMain: boolean;    // New field
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
        setItems(data.map((item: any) => ({
          ...item,
          isVisible: item.isVisible ?? true,
          isMain: item.isMain ?? false
        })));
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
        order: index + 1,
        isMain: item.isMain
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
      isVisible: true,
      isMain: false,
      isStaged: true
    }));
    setItems(prev => [...staged, ...prev]); // Prepend new items
    setHasChanges(true);
  };

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading gallery...</div>;

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl pb-40">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white px-6 md:px-8 py-6 rounded-3xl border border-[#e4dcdd] shadow-sm gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#171212] tracking-tight">Gallery Management</h1>
          <p className="text-[#856669] mt-1 text-xs md:text-sm font-medium">Drag to reorder. New items appear with a green border before saving.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {selectedIds.size > 0 && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-2 bg-red-500 text-white px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto justify-center"
            >
              <Trash2 size={18} />
              Delete Selected ({selectedIds.size})
            </button>
          )}
          <button
            onClick={cleanupTempFolder}
            disabled={cleaningTemp}
            className="flex items-center gap-2 border border-[#e4dcdd] text-[#856669] px-4 md:px-5 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm hover:bg-[#f8f6f6] active:scale-95 transition-all disabled:opacity-50 flex-1 sm:flex-none justify-center"
          >
            {cleaningTemp ? <Loader2 className="animate-spin" size={18} /> : null}
            Temp Cleanup
          </button>
          {hasChanges && (
            <button
              onClick={commitChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-[#DB5461] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#DB5461]/20 disabled:opacity-50 flex-1 sm:flex-none justify-center"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Complete Registration
            </button>
          )}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold text-xs md:text-sm hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center"
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
                  onToggleMain={() => {
                    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isMain: !i.isMain } : i));
                    setHasChanges(true);
                  }}
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 md:bottom-10 right-6 md:right-10 z-[100] flex items-center gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {hasChanges && !isUploadModalOpen && (
            <motion.button
              key="complete-btn"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              whileHover={{ scale: 1.05, backgroundColor: "#e26673" }}
              whileTap={{ scale: 0.95 }}
              onClick={commitChanges}
              disabled={saving}
              className="pointer-events-auto flex items-center gap-2 bg-[#DB5461] text-white px-4 md:px-6 py-3 md:py-4 rounded-full shadow-[0_20px_50px_rgba(219,84,97,0.3)] border border-white/10 backdrop-blur-md transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span className="font-bold text-xs md:text-sm tracking-tight pr-1">등록 완료</span>
            </motion.button>
          )}

          {!isUploadModalOpen && (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="pointer-events-auto flex items-center gap-2 md:gap-3 bg-[#171212] text-white px-4 md:px-6 py-3 md:py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 backdrop-blur-md transition-all group hover:bg-black"
            >
              <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#DB5461] text-white group-hover:rotate-90 transition-transform duration-300">
                <Plus size={18} />
              </div>
              <span className="font-bold text-xs md:text-sm tracking-tight pr-1 md:pr-2">이미지 등록</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SortableGalleryItem({
  item,
  index,
  onDelete,
  isSelected,
  onToggleSelect,
  onToggleMain,
  onPreview,
}: {
  item: GalleryItem;
  index: number;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: (shiftKey: boolean) => void;
  onToggleMain: () => void;
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
        onToggleMain={onToggleMain}
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
  onToggleMain,
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
  onToggleMain?: () => void;
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
      {onToggleMain && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMain();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-4 right-16 z-20 w-9 h-9 rounded-md border shadow-md flex items-center justify-center transition-all",
            item.isMain
              ? "bg-yellow-400 border-yellow-400 text-white opacity-100"
              : "bg-white/80 border-white text-gray-400 opacity-0 group-hover:opacity-100 hover:text-yellow-500"
          )}
          aria-label="Set as Main"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={item.isMain ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
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
              src={getThumbnailUrl(item.imageUrl)}
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
          src={getThumbnailUrl(item.imageUrl)}
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

