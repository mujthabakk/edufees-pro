"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import { mockStudents } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const CLASSES   = ["All Classes","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const DIVISIONS = ["All Divisions","A","B","C","Science","Commerce"];
const QUOTAS    = ["All Quotas","General","SC/ST","Sports","Scholarship","Management"];

export type PickedStudent = {
  id: string;
  fullName: string;
  admissionNo: string;
  class: string;
  division: string;
  quota: string;
  parentMobile: string;
  totalFee: number;
  paidAmount: number;
  status: string;
};

type Props = {
  value: PickedStudent | null;
  onChange: (student: PickedStudent | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
};

export function StudentPicker({ value, onChange, placeholder = "Search by name or admission no...", label = "Student", required }: Props) {
  const [query, setQuery]       = useState("");
  const [open, setOpen]         = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [classF, setClassF]     = useState("All Classes");
  const [divF, setDivF]         = useState("All Divisions");
  const [quotaF, setQuotaF]     = useState("All Quotas");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = mockStudents.filter(s => {
    const q = query.toLowerCase();
    const matchQ = !q || s.fullName.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q);
    const matchC = classF === "All Classes"   || s.class === classF;
    const matchD = divF   === "All Divisions" || s.division === divF;
    const matchQ2= quotaF === "All Quotas"    || s.quota === quotaF;
    return matchQ && matchC && matchD && matchQ2;
  }).slice(0, 8);

  const activeFilters = [classF !== "All Classes", divF !== "All Divisions", quotaF !== "All Quotas"].filter(Boolean).length;

  const select = (s: typeof mockStudents[0]) => {
    onChange({ id: s.id, fullName: s.fullName, admissionNo: s.admissionNo, class: s.class, division: s.division, quota: s.quota, parentMobile: s.parentMobile, totalFee: s.totalFee, paidAmount: s.paidAmount, status: s.status });
    setOpen(false);
    setQuery("");
  };

  const clear = () => { onChange(null); setQuery(""); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-xs text-gray-500 font-medium block mb-1">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Selected student chip */}
      {value ? (
        <div className="flex items-center gap-3 p-3 border border-indigo-300 bg-indigo-50 rounded-xl">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
            {value.fullName.split(" ").map(n => n[0]).join("").slice(0,2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{value.fullName}</p>
            <p className="text-xs text-gray-500">{value.admissionNo} · {value.class} {value.division} · {value.quota}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-red-500 font-semibold">{formatCurrency(value.totalFee - value.paidAmount)} due</p>
            <p className="text-xs text-gray-400">{value.parentMobile}</p>
          </div>
          <button onClick={clear} className="p-1 text-gray-400 hover:text-red-500 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 bg-white hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left">
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1">{placeholder}</span>
          <ChevronDown className="w-4 h-4 shrink-0" />
        </button>
      )}

      {/* Dropdown */}
      {open && !value && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Name or admission number..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-colors ${showFilters || activeFilters > 0 ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-indigo-300"}`}>
              <Filter className="w-3.5 h-3.5" />
              Filters{activeFilters > 0 && <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center">{activeFilters}</span>}
            </button>
          </div>

          {/* Filters row */}
          {showFilters && (
            <div className="flex gap-2 p-2 border-b border-gray-100 bg-gray-50 flex-wrap">
              <select value={classF} onChange={e => setClassF(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={divF} onChange={e => setDivF(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {DIVISIONS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select value={quotaF} onChange={e => setQuotaF(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                {QUOTAS.map(q => <option key={q}>{q}</option>)}
              </select>
              {activeFilters > 0 && (
                <button onClick={() => { setClassF("All Classes"); setDivF("All Divisions"); setQuotaF("All Quotas"); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-1">✕ Clear</button>
              )}
            </div>
          )}

          {/* Results */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No students found</p>
            ) : (
              filtered.map(s => (
                <button key={s.id} onClick={() => select(s)}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                    {s.fullName.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{s.fullName}</p>
                    <p className="text-xs text-gray-400">{s.admissionNo} · {s.class} {s.division && `Div ${s.division}`} · {s.quota}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${s.paidAmount < s.totalFee ? "text-red-500" : "text-green-600"}`}>
                      {s.paidAmount < s.totalFee ? `${formatCurrency(s.totalFee - s.paidAmount)} due` : "Cleared"}
                    </p>
                    <p className="text-xs text-gray-400">{s.status}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
        </div>
      )}
    </div>
  );
}
