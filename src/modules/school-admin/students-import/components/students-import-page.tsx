"use client";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, RefreshCw } from "lucide-react";

type RowStatus = "success" | "error" | "warning";

const mockValidation = [
  { row: 2, name: "Arjun Mehta", class: "Class 9", division: "A", mobile: "9876543200", email: "arjun@gmail.com", status: "success" as RowStatus, message: "Ready to import" },
  { row: 3, name: "Sana Khan", class: "Class 9", division: "B", mobile: "9876543201", email: "sana@gmail.com", status: "success" as RowStatus, message: "Ready to import" },
  { row: 4, name: "Vikram Nair", class: "Class 10", division: "C", mobile: "invalid", email: "vikram@gmail.com", status: "warning" as RowStatus, message: "Invalid mobile number format" },
  { row: 5, name: "", class: "Class 8", division: "A", mobile: "9876543203", email: "", status: "error" as RowStatus, message: "Missing required field: Name" },
  { row: 6, name: "Deepa Iyer", class: "Class 11", division: "X", mobile: "9876543204", email: "deepa@gmail.com", status: "error" as RowStatus, message: "Unknown division 'X' — did you mean A/B/C?" },
  { row: 7, name: "Rohit Sharma", class: "Class 7", division: "B", mobile: "9876543205", email: "rohit@gmail.com", status: "success" as RowStatus, message: "Ready to import" },
  { row: 8, name: "Meena Pillai", class: "Class 6", division: "A", mobile: "9876543206", email: "meena@gmail.com", status: "success" as RowStatus, message: "Ready to import" },
  { row: 9, name: "Ajay Kumar", class: "Class 9", division: "A", mobile: "9876543207", email: "", status: "warning" as RowStatus, message: "Missing email — WhatsApp only" },
];

const STEPS = ["Upload File", "Validate", "Review & Import", "Done"];

export function StudentsImportPage() {
  const [step, setStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [skipErrors, setSkipErrors] = useState(true);

  const successRows = mockValidation.filter(r => r.status === "success").length;
  const errorRows = mockValidation.filter(r => r.status === "error").length;
  const warningRows = mockValidation.filter(r => r.status === "warning").length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setFileName("students_import.xlsx");
    setTimeout(() => setStep(1), 500);
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => { setImporting(false); setStep(3); }, 2000);
  };

  const statusIcon = (s: RowStatus) => s === "success"
    ? <CheckCircle className="w-4 h-4 text-green-500" />
    : s === "error" ? <XCircle className="w-4 h-4 text-red-500" />
    : <AlertTriangle className="w-4 h-4 text-yellow-500" />;

  const statusBadgeVariant = (s: RowStatus): "success" | "danger" | "warning" =>
    s === "success" ? "success" : s === "error" ? "danger" : "warning";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Bulk Student Import" subtitle="Upload Excel / CSV to onboard multiple students at once" />
      <main className="flex-1 p-6 space-y-5">

        {/* Step Progress */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i < step ? "bg-indigo-600 border-indigo-600 text-white" : i === step ? "border-indigo-600 text-indigo-600 bg-white" : "border-gray-300 text-gray-400 bg-white"}`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <p className={`text-xs mt-1 font-medium ${i === step ? "text-indigo-600" : i < step ? "text-green-600" : "text-gray-400"}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-indigo-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Upload */}
        {step === 0 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-8">
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"}`}
                >
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">Drop your Excel or CSV file here</p>
                  <p className="text-sm text-gray-500 mb-5">Supports .xlsx, .xls, .csv · Max 10 MB · Up to 500 students per import</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => { setFileName("students_import.xlsx"); setStep(1); }}>
                      <Upload className="w-4 h-4" />Browse Files
                    </Button>
                    <Button variant="outline"><Download className="w-4 h-4" />Download Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Import Template Columns</h3>
              <div className="grid grid-cols-4 gap-2">
                {["Full Name*", "Date of Birth", "Gender", "Admission No*", "Class*", "Division", "Batch", "Roll No",
                  "Parent Mobile*", "Parent Email", "WhatsApp No", "Father Name", "Mother Name", "Guardian Name",
                  "Address Line 1", "City", "State", "PIN Code", "Quota"].map(col => (
                  <div key={col} className={`text-xs px-2 py-1.5 rounded-md ${col.includes("*") ? "bg-indigo-50 text-indigo-700 font-medium" : "bg-gray-50 text-gray-600"}`}>
                    {col}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">* Required fields. Red = error, Yellow = warning on validation.</p>
            </Card>
          </div>
        )}

        {/* Step 1: Validate */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{fileName}</p>
                  <p className="text-xs text-gray-500">{mockValidation.length} rows detected</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><CheckCircle className="w-4 h-4" />{successRows} ready</div>
                <div className="flex items-center gap-1.5 text-sm text-yellow-600 font-medium"><AlertTriangle className="w-4 h-4" />{warningRows} warnings</div>
                <div className="flex items-center gap-1.5 text-sm text-red-600 font-medium"><XCircle className="w-4 h-4" />{errorRows} errors</div>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {["Row", "Name", "Class", "Division", "Mobile", "Email", "Status", "Message"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockValidation.map(row => (
                      <tr key={row.row} className={`border-b border-gray-50 ${row.status === "error" ? "bg-red-50/50" : row.status === "warning" ? "bg-yellow-50/30" : ""}`}>
                        <td className="px-4 py-3 text-xs text-gray-400">{row.row}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name || <span className="text-red-500 italic">missing</span>}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.class}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.division}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.mobile}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.email || "—"}</td>
                        <td className="px-4 py-3">{statusIcon(row.status)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{row.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={skipErrors} onChange={e => setSkipErrors(e.target.checked)} className="rounded border-gray-300 text-indigo-600" />
                Import successful rows even if some rows have errors
              </label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Re-upload</Button>
                <Button onClick={() => setStep(2)}>Review & Confirm ({skipErrors ? successRows + warningRows : successRows} rows)</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-5 border-green-200 bg-green-50">
                <p className="text-xs text-green-700 font-medium uppercase">Will be imported</p>
                <p className="text-3xl font-bold text-green-800 mt-1">{successRows + warningRows}</p>
                <p className="text-xs text-green-600 mt-1">students · credentials auto-generated</p>
              </Card>
              <Card className="p-5 border-red-200 bg-red-50">
                <p className="text-xs text-red-700 font-medium uppercase">Will be skipped</p>
                <p className="text-3xl font-bold text-red-800 mt-1">{errorRows}</p>
                <p className="text-xs text-red-600 mt-1">rows with errors</p>
              </Card>
              <Card className="p-5 border-indigo-200 bg-indigo-50">
                <p className="text-xs text-indigo-700 font-medium uppercase">After import</p>
                <p className="text-3xl font-bold text-indigo-800 mt-1">Credentials via</p>
                <p className="text-xs text-indigo-600 mt-1">📧 Email + 📱 WhatsApp per parent</p>
              </Card>
            </div>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">What happens next</h3>
              <div className="space-y-2">
                {["Auto-generate username & random password for each student", "Send welcome WhatsApp to parent mobile with login credentials", "Send welcome email to parent email with credentials", "Students immediately visible in the student management list", "Fee assignment can begin from the Accountant dashboard"].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </Card>
            <div className="flex gap-3">
              <Button onClick={handleImport} disabled={importing}>
                {importing ? <><RefreshCw className="w-4 h-4 animate-spin" />Importing...</> : <><Upload className="w-4 h-4" />Confirm & Import {successRows + warningRows} Students</>}
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h2>
            <p className="text-gray-500 mb-6">{successRows + warningRows} students have been added to Greenfield Academy. Credentials sent via Email & WhatsApp.</p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
              <div className="bg-green-50 rounded-xl p-3"><p className="text-2xl font-bold text-green-700">{successRows + warningRows}</p><p className="text-xs text-green-600">Imported</p></div>
              <div className="bg-blue-50 rounded-xl p-3"><p className="text-2xl font-bold text-blue-700">{successRows + warningRows}</p><p className="text-xs text-blue-600">WhatsApp sent</p></div>
              <div className="bg-purple-50 rounded-xl p-3"><p className="text-2xl font-bold text-purple-700">{successRows + warningRows}</p><p className="text-xs text-purple-600">Email sent</p></div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.href = "/students"}>View All Students</Button>
              <Button variant="outline" onClick={() => setStep(0)}>Import More</Button>
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}
