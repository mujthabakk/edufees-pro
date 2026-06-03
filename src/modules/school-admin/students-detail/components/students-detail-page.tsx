"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge, StatusBadge } from "@/modules/shared/ui/badge";
import { ArrowLeft, Edit2, Send, Phone, Mail, Download, User, BookOpen, CreditCard, History } from "lucide-react";

const student = {
  id: "STU001",
  admissionNo: "ADM2024001",
  fullName: "Arjun Mehta",
  dob: "2008-03-15",
  gender: "Male",
  class: "Class 9",
  division: "A",
  batch: "2024-25",
  rollNo: "12",
  quota: "General",
  parentMobile: "9876543200",
  parentEmail: "arjun.parent@gmail.com",
  whatsappNo: "9876543200",
  fatherName: "Suresh Mehta",
  motherName: "Priya Mehta",
  guardianName: "",
  address: "42, Gandhi Nagar, Bandra West",
  city: "Mumbai",
  state: "Maharashtra",
  pin: "400050",
  loginUsername: "arjun.mehta2024",
  loginPassword: "Temp@1234",
  status: "active",
  totalFee: 85000,
  paid: 60000,
  balance: 25000,
  joinedOn: "2024-06-01",
};

const feeHistory = [
  { date: "2024-06-01", desc: "Admission Fee", amount: 15000, mode: "UPI", status: "PAID", invoice: "INV-001" },
  { date: "2024-07-01", desc: "Term 1 Tuition", amount: 25000, mode: "Bank Transfer", status: "PAID", invoice: "INV-002" },
  { date: "2024-10-01", desc: "Term 2 Tuition", amount: 20000, mode: "Cash", status: "PAID", invoice: "INV-003" },
  { date: "2025-01-01", desc: "Term 3 Tuition", amount: 25000, mode: "—", status: "PENDING", invoice: "—" },
];

const TABS = ["Profile", "Fee Details", "Payment History", "Login Credentials"];

export function StudentsDetailPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const pct = Math.round((student.paid / student.totalFee) * 100);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Student Detail" subtitle={`${student.fullName} · ${student.admissionNo}`} />
      <main className="flex-1 p-6 space-y-5">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Students
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Send className="w-4 h-4" />Send WhatsApp</Button>
            <Button variant="outline" size="sm"><Mail className="w-4 h-4" />Send Email</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4" />Fee Statement</Button>
            <Button size="sm"><Edit2 className="w-4 h-4" />Edit Student</Button>
          </div>
        </div>

        {/* Top summary card */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-700">
                {student.fullName.split(" ").map(w => w[0]).join("")}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{student.fullName}</h2>
                <p className="text-sm text-gray-500">{student.class} – Division {student.division} · Roll #{student.rollNo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="info">{student.admissionNo}</Badge>
                  <Badge variant="outline">{student.quota}</Badge>
                  <StatusBadge status="ACTIVE" />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">₹{student.balance.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{pct}% of ₹{student.totalFee.toLocaleString()} paid</p>
              <div className="w-40 h-1.5 bg-gray-200 rounded-full mt-2 ml-auto">
                <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === i ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab 0: Profile */}
        {tab === 0 && (
          <div className="grid grid-cols-2 gap-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4" />Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Full Name", student.fullName],
                  ["Date of Birth", new Date(student.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                  ["Gender", student.gender],
                  ["Father's Name", student.fatherName],
                  ["Mother's Name", student.motherName],
                  ["Guardian Name", student.guardianName || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-sm font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Academic Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Admission No.", student.admissionNo],
                  ["Class", student.class],
                  ["Division", student.division],
                  ["Batch", student.batch],
                  ["Roll No.", student.rollNo],
                  ["Quota", student.quota],
                  ["Joined On", new Date(student.joinedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-sm font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="w-4 h-4" />Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  ["Parent Mobile", student.parentMobile],
                  ["WhatsApp No.", student.whatsappNo],
                  ["Parent Email", student.parentEmail],
                  ["Address", student.address],
                  ["City", student.city],
                  ["State", student.state],
                  ["PIN Code", student.pin],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-sm font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="p-5 bg-orange-50 border-orange-200">
              <h3 className="text-sm font-semibold text-orange-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline" size="sm"><Send className="w-4 h-4" />Send Fee Reminder (WhatsApp)</Button>
                <Button className="w-full justify-start" variant="outline" size="sm"><Mail className="w-4 h-4" />Send Fee Reminder (Email)</Button>
                <Button className="w-full justify-start" variant="outline" size="sm"><Phone className="w-4 h-4" />Log Call with Parent</Button>
                <Button className="w-full justify-start" variant="outline" size="sm"><Download className="w-4 h-4" />Download Fee Statement</Button>
                <Button className="w-full justify-start" variant="outline" size="sm"><CreditCard className="w-4 h-4" />Record Payment</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 1: Fee Details */}
        {tab === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-5 bg-blue-50 border-blue-200">
                <p className="text-xs text-blue-700 font-medium uppercase">Total Fee</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">₹{student.totalFee.toLocaleString()}</p>
              </Card>
              <Card className="p-5 bg-green-50 border-green-200">
                <p className="text-xs text-green-700 font-medium uppercase">Paid</p>
                <p className="text-2xl font-bold text-green-800 mt-1">₹{student.paid.toLocaleString()}</p>
              </Card>
              <Card className="p-5 bg-red-50 border-red-200">
                <p className="text-xs text-red-700 font-medium uppercase">Balance Due</p>
                <p className="text-2xl font-bold text-red-800 mt-1">₹{student.balance.toLocaleString()}</p>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Assigned Fee Structure</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {["Fee Type", "Amount", "Due Date", "Status"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: "Admission Fee", amount: 15000, due: "2024-06-01", status: "PAID" },
                      { type: "Term 1 Tuition", amount: 25000, due: "2024-07-01", status: "PAID" },
                      { type: "Term 2 Tuition", amount: 20000, due: "2024-10-01", status: "PAID" },
                      { type: "Term 3 Tuition", amount: 25000, due: "2025-01-01", status: "OVERDUE" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">₹{row.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(row.due).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Payment History */}
        {tab === 2 && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Date", "Description", "Amount", "Mode", "Status", "Invoice"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feeHistory.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(row.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.desc}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">₹{row.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.mode}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 text-sm text-indigo-600">{row.invoice !== "—" ? <button className="underline">{row.invoice}</button> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Login Credentials */}
        {tab === 3 && (
          <Card className="max-w-lg">
            <CardHeader><CardTitle>Parent Portal Login</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">These credentials allow the parent to log in to the Parent Portal to view fee details and make payments.</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Username</span>
                  <span className="text-sm font-mono font-bold text-gray-900">{student.loginUsername}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Temp Password</span>
                  <span className="text-sm font-mono font-bold text-gray-900">{student.loginPassword}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Send className="w-4 h-4" />Resend via WhatsApp</Button>
                <Button variant="outline" size="sm"><Mail className="w-4 h-4" />Resend via Email</Button>
                <Button variant="outline" size="sm">Reset Password</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
