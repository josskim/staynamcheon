"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { Calendar, X, ChevronDown } from "lucide-react";

interface Props {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  onChange: (from: string, to: string) => void;
}

function toStr(d: Date | undefined): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromStr(s: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getThisWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toStr(d);
}

function getThisMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function getTodayStr(): string {
  return toStr(new Date());
}

const PRESETS = [
  { label: "오늘", getRange: () => ({ from: getTodayStr(), to: getTodayStr() }) },
  { label: "이번주", getRange: () => ({ from: getThisWeekStart(), to: getTodayStr() }) },
  { label: "이번달", getRange: () => ({ from: getThisMonthStart(), to: getTodayStr() }) },
  { label: "오늘부터", getRange: () => ({ from: getTodayStr(), to: "" }) },
];

export default function DateRangePicker({ from, to, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DateRange | undefined>({
    from: fromStr(from),
    to: fromStr(to),
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected({ from: fromStr(from), to: fromStr(to) });
  }, [from, to]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (range: DateRange | undefined) => {
    setSelected(range);
    const f = toStr(range?.from);
    const t = toStr(range?.to);
    onChange(f, t);
    if (f && t) setTimeout(() => setOpen(false), 200);
  };

  const handlePreset = (preset: (typeof PRESETS)[number]) => {
    const { from: f, to: t } = preset.getRange();
    onChange(f, t);
    setSelected({ from: fromStr(f), to: fromStr(t) });
    setOpen(false);
  };

  const hasValue = !!(from || to);
  const displayText =
    from && to && from === to
      ? from
      : from && to
      ? `${from} ~ ${to}`
      : from
      ? `${from} ~`
      : to
      ? `~ ${to}`
      : "기간 선택";

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-2xl border text-sm font-medium transition-all ${
          open || hasValue
            ? "border-[#DB5461] bg-rose-50 text-[#DB5461]"
            : "border-[#e4dcdd] bg-white text-[#856669] hover:border-[#DB5461] hover:text-[#DB5461] hover:bg-rose-50"
        }`}
      >
        <Calendar size={15} />
        <span className={hasValue ? "text-[#171212] font-semibold" : ""}>{displayText}</span>
        {hasValue ? (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("", "");
              setSelected(undefined);
            }}
            className="ml-0.5 p-0.5 rounded-full hover:bg-rose-100 text-[#856669] hover:text-[#DB5461] transition-colors"
          >
            <X size={13} />
          </span>
        ) : (
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 bg-white rounded-3xl border border-[#e4dcdd] shadow-xl p-5 min-w-[320px]"
          style={
            {
              "--rdp-accent-color": "#DB5461",
              "--rdp-accent-background-color": "#fce8ea",
              "--rdp-day_button-border-radius": "10px",
              "--rdp-day-height": "38px",
              "--rdp-day-width": "38px",
              "--rdp-day_button-height": "36px",
              "--rdp-day_button-width": "36px",
            } as React.CSSProperties
          }
        >
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f8f6f6] text-[#856669] hover:bg-rose-50 hover:text-[#DB5461] transition-colors border border-[#e4dcdd] hover:border-[#DB5461]"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            showOutsideDays
            navLayout="around"
          />

          {/* Footer */}
          {(from || to) && (
            <div className="mt-3 pt-3 border-t border-[#f4f1f1] flex items-center justify-between">
              <span className="text-xs text-[#856669]">
                {from || "~"} → {to || "현재"}
              </span>
              <button
                onClick={() => { onChange("", ""); setSelected(undefined); setOpen(false); }}
                className="text-xs text-[#DB5461] font-medium hover:underline"
              >
                초기화
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
