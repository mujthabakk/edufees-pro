"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import {
  Upload, Download, CheckCircle, XCircle, AlertTriangle,
  FileSpreadsheet, RefreshCw, Link2, X, Info,
} from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type RowStatus = "success" | "error" | "warning";

interface ParsedRow {
  row: number;
  name: string;
  class: string;
  division: string;
  mobile: string;
  email: string;
  admissionNo: string;
  status: RowStatus;
  message: string;
}

// ──────────────────────────────────────────────
// Template columns & sample data for download
// ──────────────────────────────────────────────
const TEMPLATE_HEADERS = [
  "Full Name", "Admission No", "Class", "Division", "Date of Birth",
  "Gender", "Parent Mobile", "Parent Email", "Father Name",
  "Mother Name", "Address", "City", "State", "PIN Code", "Quota",
];

const SAMPLE_ROWS = [
  ["Arjun Mehta", "ADM2024001", "Class 9", "A", "2008-03-15", "Male", "9876543200", "arjun@gmail.com", "Suresh Mehta", "Priya Mehta", "12 MG Road", "Bangalore", "Karnataka", "560001", "General"],
  ["Sana Khan", "ADM2024002", "Class 9", "B", "2009-07-22", "Female", "9876543201", "sana@gmail.com", "Imran Khan", "Fatima Khan", "45 Brigade Rd", "Bangalore", "Karnataka", "560001", "General"],
  ["Vikram Nair", "ADM2024003", "Class 10", "A", "2007-11-10", "Male", "9876543202", "vikram@gmail.com", "Rajan Nair", "Suma Nair", "8 Residency Rd", "Bangalore", "Karnataka", "560025", "Sports"],
];

const STEPS = ["Upload File", "Validate Data", "Review & Import", "Done"];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function validateRow(raw: Record<string, string>, index: number): ParsedRow {
  const name = (raw["Full Name"] || raw["full name"] || raw["fullname"] || raw["Name"] || "").trim();
  const cls  = (raw["Class"]     || raw["class"]  || "").trim();
  const div  = (raw["Division"]  || raw["division"] || "").trim();
  const mob  = (raw["Parent Mobile"] || raw["mobile"] || raw["Mobile"] || "").trim();
  const email = (raw["Parent Email"] || raw["email"] || raw["Email"] || "").trim();
  const admNo = (raw["Admission No"] || raw["admission no"] || raw["AdmissionNo"] || "").trim();

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name) errors.push("Missing Full Name");
  if (!cls)  errors.push("Missing Class");
  if (mob && !/^[6-9]\d{9}$/.test(mob.replace(/\s/g, ""))) warnings.push("Invalid mobile number");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) warnings.push("Invalid email format");
  if (!email && !mob) errors.push("Need at least Mobile or Email");
  if (div && !["A","B","C","D","Science","Commerce","Arts"].includes(div))
    warnings.push(`Unknown division "${div}"`);

  const status: RowStatus = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "success";
  const message = errors.length > 0 ? errors[0] : warnings.length > 0 ? warnings[0] : "Ready to import";

  return { row: index + 2, name, class: cls, division: div, mobile: mob, email, admissionNo: admNo, status, message };
}

function csvToRows(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.replace(/^"|"$/g, "").trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
    return obj;
  });
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export function StudentsImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [skipErrors, setSkipErrors] = useState(true);
  const [toast, setToast] = useState("");
  const [showGSheet, setShowGSheet] = useState(false);
  const [gsheetUrl, setGsheetUrl] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all"|"success"|"warning"|"error">("all");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // ── Process uploaded file ──
  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");

    const ext = file.name.split(".").pop()?.toLowerCase();
    let parsed: ParsedRow[] = [];

    try {
      if (ext === "csv") {
        const text = await file.text();
        const rawRows = csvToRows(text);
        parsed = rawRows.map((r, i) => validateRow(r, i));
      } else if (ext === "xlsx" || ext === "xls") {
        // Dynamic import to avoid SSR issues
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawRows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        parsed = rawRows.map((r, i) => validateRow(r as Record<string, string>, i));
      } else {
        showToast("⚠️ Unsupported file type. Please upload .xlsx, .xls, or .csv");
        return;
      }

      if (parsed.length === 0) {
        showToast("⚠️ No data rows found in the file. Check the file has data after the header row.");
        return;
      }

      setRows(parsed);
      setStep(1);
    } catch {
      showToast("❌ Failed to parse file. Make sure it matches the template format.");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleImportGSheet = () => {
    if (!gsheetUrl.includes("docs.google.com")) {
      showToast("⚠️ Please paste a valid Google Sheets URL");
      return;
    }
    // Simulate fetching & parsing Google Sheet
    showToast("🔄 Fetching Google Sheet data...");
    setTimeout(() => {
      setFileName("Google Sheet Import");
      setFileSize("—");
      // Use demo rows for simulation
      const demoRows: ParsedRow[] = SAMPLE_ROWS.map((r, i) => validateRow(
        Object.fromEntries(TEMPLATE_HEADERS.map((h, j) => [h, r[j] || ""])),
        i
      ));
      setRows(demoRows);
      setShowGSheet(false);
      setStep(1);
      showToast("✅ Google Sheet loaded successfully");
    }, 1800);
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); setStep(3); }, 2200);
  };

  // ── Derived ──
  const successRows = rows.filter(r => r.status === "success").length;
  const errorRows   = rows.filter(r => r.status === "error").length;
  const warningRows = rows.filter(r => r.status === "warning").length;
  const importCount = skipErrors ? successRows + warningRows : successRows;
  const filtered = filterStatus === "all" ? rows : rows.filter(r => r.status === filterStatus);

  const statusIcon = (s: RowStatus) =>
    s === "success" ? <CheckCircle className="w-4 h-4 text-green-500" />
    : s === "error"  ? <XCircle    className="w-4 h-4 text-red-500" />
    : <AlertTriangle className="w-4 h-4 text-yellow-500" />;

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl max-w-sm">{toast}</div>}
      <Topbar title="Bulk Student Import" subtitle="Upload Excel / Google Sheet to onboard students · Greenfield Institute" />
      <main className="flex-1 p-6 space-y-5">

        {/* Step Progress */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                  ${i < step ? "bg-indigo-600 border-indigo-600 text-white"
                  : i === step ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-gray-300 text-gray-400 bg-white"}`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <p className={`text-xs mt-1 font-medium ${i === step ? "text-indigo-600" : i < step ? "text-green-600" : "text-gray-400"}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-indigo-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Upload ── */}
        {step === 0 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-8">
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
                    ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50/60"}`}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {dragging ? "Release to upload" : "Drop your Excel or CSV file here"}
                  </p>
                  <p className="text-sm text-gray-500 mb-5">Supports .xlsx, .xls, .csv · Max 10 MB · Up to 500 students per batch</p>
                  <div className="flex gap-3 justify-center" onClick={e => e.stopPropagation()}>
                    <Button onClick={() => fileRef.current?.click()}>
                      <Upload className="w-4 h-4" />Browse Files
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowGSheet(true)}
                    >
                      <Link2 className="w-4 h-4" />Import from Google Sheet
                    </Button>
                  </div>
                </div>

                {/* Download options */}
                <div className="mt-5 flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      downloadCSV("students_import_template.csv", TEMPLATE_HEADERS, SAMPLE_ROWS);
                      showToast("📥 Template downloaded — fill it and upload!");
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />Download CSV Template
                  </button>
                  <button
                    onClick={() => {
                      downloadCSV("students_import_demo.csv", TEMPLATE_HEADERS, SAMPLE_ROWS);
                      showToast("📥 Demo sheet downloaded with 3 sample rows!");
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />Download Demo Sheet (3 rows)
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Template column reference */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-900">Template Columns Reference</h3>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {TEMPLATE_HEADERS.map(col => {
                  const req = ["Full Name","Admission No","Class","Parent Mobile"].includes(col);
                  return (
                    <div key={col} className={`text-xs px-2 py-1.5 rounded-md flex items-center gap-1
                      ${req ? "bg-indigo-50 text-indigo-700 font-semibold" : "bg-gray-50 text-gray-600"}`}>
                      {req && <span className="text-red-500">*</span>}{col}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                <span className="text-red-500 font-semibold">* Required.</span> Keep the first row as headers exactly as shown above.
              </p>
            </Card>
          </div>
        )}

        {/* ── STEP 1: Validate ── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* File info + summary */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-500">{fileSize} · {rows.length} rows detected</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg">
                  <CheckCircle className="w-4 h-4" />{successRows} ready
                </div>
                <div className="flex items-center gap-1.5 text-sm text-yellow-700 font-medium bg-yellow-50 px-3 py-1.5 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />{warningRows} warnings
                </div>
                <div className="flex items-center gap-1.5 text-sm text-red-700 font-medium bg-red-50 px-3 py-1.5 rounded-lg">
                  <XCircle className="w-4 h-4" />{errorRows} errors
                </div>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
              {(["all","success","warning","error"] as const).map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors
                    ${filterStatus === f ? "bg-indigo-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
                  {f === "all" ? `All (${rows.length})` : f === "success" ? `✅ Ready (${successRows})` : f === "warning" ? `⚠️ Warnings (${warningRows})` : `❌ Errors (${errorRows})`}
                </button>
              ))}
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {["Row","Name","Class","Div","Mobile","Email","Adm No","Status","Issue"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => (
                      <tr key={row.row} className={`border-b border-gray-50
                        ${row.status === "error" ? "bg-red-50/50" : row.status === "warning" ? "bg-yellow-50/30" : ""}`}>
                        <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{row.row}</td>
                        <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{row.name || <span className="text-red-500 italic text-xs">missing</span>}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">{row.class || "—"}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">{row.division || "—"}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">{row.mobile || "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[140px] truncate">{row.email || "—"}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{row.admissionNo || "—"}</td>
                        <td className="px-4 py-2.5">{statusIcon(row.status)}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[180px]">{row.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="py-8 text-center text-gray-400 text-sm">No rows match this filter.</div>}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input type="checkbox" checked={skipErrors} onChange={e => setSkipErrors(e.target.checked)} className="rounded border-gray-300 text-indigo-600" />
                Import valid rows even if some rows have errors
              </label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setStep(0); setRows([]); if (fileRef.current) fileRef.current.value = ""; }}>
                  Re-upload
                </Button>
                <Button onClick={() => setStep(2)} disabled={importCount === 0}>
                  Review & Confirm ({importCount} rows) →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-5 border-green-200 bg-green-50">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Will be imported</p>
                <p className="text-4xl font-bold text-green-800 mt-1">{importCount}</p>
                <p className="text-xs text-green-600 mt-1">students · credentials auto-generated</p>
              </Card>
              <Card className="p-5 border-red-200 bg-red-50">
                <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">Will be skipped</p>
                <p className="text-4xl font-bold text-red-800 mt-1">{skipErrors ? errorRows : errorRows + warningRows}</p>
                <p className="text-xs text-red-600 mt-1">rows with errors</p>
              </Card>
              <Card className="p-5 border-indigo-200 bg-indigo-50">
                <p className="text-xs text-indigo-700 font-semibold uppercase tracking-wide">Notifications</p>
                <p className="text-2xl font-bold text-indigo-800 mt-2">📧 + 📱</p>
                <p className="text-xs text-indigo-600 mt-1">Email & WhatsApp per parent</p>
              </Card>
            </div>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">What happens after import</h3>
              <div className="space-y-2">
                {[
                  "Auto-generate username & random password for each student",
                  "Send welcome WhatsApp to parent mobile with login credentials",
                  "Send welcome email to parent with credentials PDF",
                  "Students immediately visible in the Students management list",
                  "Fee assignment can begin immediately from the dashboard",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleImport} disabled={importing}>
                {importing
                  ? <><RefreshCw className="w-4 h-4 animate-spin" />Importing {importCount} students...</>
                  : <><Upload className="w-4 h-4" />Confirm & Import {importCount} Students</>}
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>← Back to Validation</Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful! 🎉</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {importCount} students have been added to Greenfield Institute. Login credentials sent to parents via Email & WhatsApp.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-green-700">{importCount}</p>
                <p className="text-xs text-green-600 mt-0.5">Imported</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-blue-700">{importCount}</p>
                <p className="text-xs text-blue-600 mt-0.5">WhatsApp sent</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-purple-700">{importCount}</p>
                <p className="text-xs text-purple-600 mt-0.5">Email sent</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/students")}>View All Students</Button>
              <Button variant="outline" onClick={() => { setStep(0); setRows([]); setFileName(""); if (fileRef.current) fileRef.current.value = ""; }}>
                Import More
              </Button>
            </div>
          </Card>
        )}
      </main>

      {/* ── Google Sheet Modal ── */}
      {showGSheet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-[500px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">📊</div>
                <h3 className="font-bold text-gray-900">Import from Google Sheet</h3>
              </div>
              <button onClick={() => setShowGSheet(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 space-y-1">
              <p className="font-semibold">Before importing:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-600">
                <li>Open your Google Sheet and go to <strong>File → Share → Anyone with the link can view</strong></li>
                <li>Copy the sheet URL and paste it below</li>
                <li>Make sure row 1 has the column headers matching our template</li>
              </ol>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Google Sheet URL</label>
              <input
                value={gsheetUrl}
                onChange={e => setGsheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Sheet must be set to "Anyone with the link can view"</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
              <p className="font-semibold text-gray-700 mb-1">Required column headers in your sheet:</p>
              <p className="font-mono">{TEMPLATE_HEADERS.slice(0, 6).join(" | ")} | ...</p>
              <button onClick={() => { downloadCSV("students_import_template.csv", TEMPLATE_HEADERS, SAMPLE_ROWS); showToast("📥 Template downloaded!"); }} className="mt-2 text-indigo-600 hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" />Download template to use as base
              </button>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={() => setShowGSheet(false)}>Cancel</Button>
              <Button onClick={handleImportGSheet}><Link2 className="w-4 h-4" />Load Sheet</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
