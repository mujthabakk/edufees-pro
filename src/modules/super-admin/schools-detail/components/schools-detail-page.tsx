"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import {
  ArrowLeft, Users, GraduationCap, BookOpen, CreditCard, BarChart3,
  CheckCircle, XCircle, Edit2, Mail, Phone, MapPin, Calendar,
  TrendingUp, Shield, UserCheck, Briefcase, X, AlertTriangle, Send
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const schoolsData: Record<string, {
  id: string; name: string; city: string; state: string; address: string;
  plan: string; status: string; phone: string; adminEmail: string;
  joined: string; students: number; staff: number; totalFee: number;
  collected: number; overdue: number;
  users: { role: string; count: number; color: string; icon: any }[];
  classes: { name: string; students: number; divisions: string[] }[];
  monthlyCollection: { month: string; amount: number }[];
}> = {
  "1": {
    id: "1", name: "Greenfield Academy", city: "Mumbai", state: "Maharashtra",
    address: "42, MG Road, Bandra West, Mumbai – 400050",
    plan: "Growth", status: "Active", phone: "022-12345678",
    adminEmail: "admin@greenfield.edu", joined: "2023-04-01",
    students: 630, staff: 45, totalFee: 52000000, collected: 44200000, overdue: 3200000,
    users: [
      { role: "Institute Admin", count: 2, color: "bg-indigo-100 text-indigo-700", icon: Shield },
      { role: "Accountant", count: 3, color: "bg-green-100 text-green-700", icon: Briefcase },
      { role: "Teacher", count: 28, color: "bg-orange-100 text-orange-700", icon: BookOpen },
      { role: "Parent", count: 630, color: "bg-blue-100 text-blue-700", icon: UserCheck },
    ],
    classes: [
      { name: "Class 6", students: 92, divisions: ["A", "B", "C"] },
      { name: "Class 7", students: 88, divisions: ["A", "B"] },
      { name: "Class 8", students: 95, divisions: ["A", "B", "C"] },
      { name: "Class 9", students: 84, divisions: ["A", "B"] },
      { name: "Class 10", students: 80, divisions: ["A", "B"] },
      { name: "Class 11", students: 102, divisions: ["Science", "Commerce"] },
      { name: "Class 12", students: 89, divisions: ["Science", "Commerce"] },
    ],
    monthlyCollection: [
      { month: "Jan", amount: 4200000 }, { month: "Feb", amount: 3800000 },
      { month: "Mar", amount: 5100000 }, { month: "Apr", amount: 4600000 },
      { month: "May", amount: 4900000 }, { month: "Jun", amount: 1850000 },
    ],
  },
  "2": {
    id: "2", name: "Sunrise Public School", city: "Pune", state: "Maharashtra",
    address: "15, FC Road, Shivajinagar, Pune – 411005",
    plan: "Starter", status: "Active", phone: "020-87654321",
    adminEmail: "principal@sunrise.edu", joined: "2023-09-15",
    students: 310, staff: 22, totalFee: 22000000, collected: 18500000, overdue: 1200000,
    users: [
      { role: "Institute Admin", count: 1, color: "bg-indigo-100 text-indigo-700", icon: Shield },
      { role: "Accountant", count: 2, color: "bg-green-100 text-green-700", icon: Briefcase },
      { role: "Teacher", count: 15, color: "bg-orange-100 text-orange-700", icon: BookOpen },
      { role: "Parent", count: 310, color: "bg-blue-100 text-blue-700", icon: UserCheck },
    ],
    classes: [
      { name: "Class 6", students: 48, divisions: ["A", "B"] },
      { name: "Class 7", students: 52, divisions: ["A", "B"] },
      { name: "Class 8", students: 55, divisions: ["A", "B"] },
      { name: "Class 9", students: 60, divisions: ["A", "B"] },
      { name: "Class 10", students: 58, divisions: ["A"] },
      { name: "Class 11", students: 38, divisions: ["Science"] },
    ],
    monthlyCollection: [
      { month: "Jan", amount: 1900000 }, { month: "Feb", amount: 1700000 },
      { month: "Mar", amount: 2100000 }, { month: "Apr", amount: 1800000 },
      { month: "May", amount: 2000000 }, { month: "Jun", amount: 900000 },
    ],
  },
  "3": {
    id: "3", name: "Delhi Modern School", city: "New Delhi", state: "Delhi",
    address: "Plot 4, Sector 10, Dwarka, New Delhi – 110075",
    plan: "Enterprise", status: "Active", phone: "011-11223344",
    adminEmail: "admin@delhimodern.edu", joined: "2022-11-01",
    students: 1240, staff: 98, totalFee: 110000000, collected: 98000000, overdue: 4500000,
    users: [
      { role: "Institute Admin", count: 4, color: "bg-indigo-100 text-indigo-700", icon: Shield },
      { role: "Accountant", count: 8, color: "bg-green-100 text-green-700", icon: Briefcase },
      { role: "Teacher", count: 72, color: "bg-orange-100 text-orange-700", icon: BookOpen },
      { role: "Parent", count: 1240, color: "bg-blue-100 text-blue-700", icon: UserCheck },
    ],
    classes: [
      { name: "Class 6", students: 180, divisions: ["A", "B", "C", "D"] },
      { name: "Class 7", students: 175, divisions: ["A", "B", "C"] },
      { name: "Class 8", students: 190, divisions: ["A", "B", "C", "D"] },
      { name: "Class 9", students: 185, divisions: ["A", "B", "C"] },
      { name: "Class 10", students: 178, divisions: ["A", "B", "C"] },
      { name: "Class 11", students: 168, divisions: ["Science", "Commerce", "Arts"] },
      { name: "Class 12", students: 164, divisions: ["Science", "Commerce", "Arts"] },
    ],
    monthlyCollection: [
      { month: "Jan", amount: 9800000 }, { month: "Feb", amount: 8500000 },
      { month: "Mar", amount: 11200000 }, { month: "Apr", amount: 9600000 },
      { month: "May", amount: 10500000 }, { month: "Jun", amount: 4200000 },
    ],
  },
  "4": {
    id: "4", name: "Vidya Vihar CBSE", city: "Bangalore", state: "Karnataka",
    address: "88, Outer Ring Road, Marathahalli, Bangalore – 560037",
    plan: "Free", status: "Suspended", phone: "080-99887766",
    adminEmail: "vidyavihar@gmail.com", joined: "2024-01-10",
    students: 88, staff: 9, totalFee: 4400000, collected: 1200000, overdue: 980000,
    users: [
      { role: "Institute Admin", count: 1, color: "bg-indigo-100 text-indigo-700", icon: Shield },
      { role: "Accountant", count: 1, color: "bg-green-100 text-green-700", icon: Briefcase },
      { role: "Teacher", count: 6, color: "bg-orange-100 text-orange-700", icon: BookOpen },
      { role: "Parent", count: 88, color: "bg-blue-100 text-blue-700", icon: UserCheck },
    ],
    classes: [
      { name: "Class 6", students: 22, divisions: ["A"] },
      { name: "Class 7", students: 20, divisions: ["A"] },
      { name: "Class 8", students: 24, divisions: ["A"] },
      { name: "Class 9", students: 22, divisions: ["A"] },
    ],
    monthlyCollection: [
      { month: "Jan", amount: 280000 }, { month: "Feb", amount: 210000 },
      { month: "Mar", amount: 180000 }, { month: "Apr", amount: 90000 },
      { month: "May", amount: 0 }, { month: "Jun", amount: 0 },
    ],
  },
  "5": {
    id: "5", name: "KV Andheri", city: "Mumbai", state: "Maharashtra",
    address: "SV Road, Andheri West, Mumbai – 400058",
    plan: "Starter", status: "Active", phone: "022-55667788",
    adminEmail: "kvandheri@gov.in", joined: "2023-06-20",
    students: 420, staff: 31, totalFee: 30000000, collected: 25600000, overdue: 1800000,
    users: [
      { role: "Institute Admin", count: 2, color: "bg-indigo-100 text-indigo-700", icon: Shield },
      { role: "Accountant", count: 3, color: "bg-green-100 text-green-700", icon: Briefcase },
      { role: "Teacher", count: 22, color: "bg-orange-100 text-orange-700", icon: BookOpen },
      { role: "Parent", count: 420, color: "bg-blue-100 text-blue-700", icon: UserCheck },
    ],
    classes: [
      { name: "Class 6", students: 65, divisions: ["A", "B"] },
      { name: "Class 7", students: 62, divisions: ["A", "B"] },
      { name: "Class 8", students: 70, divisions: ["A", "B"] },
      { name: "Class 9", students: 68, divisions: ["A", "B"] },
      { name: "Class 10", students: 72, divisions: ["A", "B"] },
      { name: "Class 11", students: 48, divisions: ["Science", "Commerce"] },
      { name: "Class 12", students: 35, divisions: ["Science"] },
    ],
    monthlyCollection: [
      { month: "Jan", amount: 2600000 }, { month: "Feb", amount: 2200000 },
      { month: "Mar", amount: 2900000 }, { month: "Apr", amount: 2400000 },
      { month: "May", amount: 2700000 }, { month: "Jun", amount: 1100000 },
    ],
  },
};

const planColors: Record<string, string> = {
  Free: "bg-gray-100 text-gray-600",
  Starter: "bg-blue-100 text-blue-700",
  Growth: "bg-indigo-100 text-indigo-700",
  Enterprise: "bg-purple-100 text-purple-700",
};

const TABS = ["Overview", "Students & Classes", "Users", "Fee Collection"];

export function SchoolsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const baseSchool = schoolsData[id as string];

  const [school, setSchool] = useState(baseSchool);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  if (!school) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6">
        <p className="text-gray-500">Institute not found.</p>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const collectionPct = Math.round((school.collected / school.totalFee) * 100);
  const totalUsers = school.users.reduce((a, u) => a + u.count, 0);

  const handleEditSave = () => {
    setSchool((s: any) => ({ ...s, ...editForm }));
    setShowEdit(false);
    showToast("✅ Institute details updated successfully");
  };

  const handleToggleStatus = () => {
    const newStatus = school.status === "Active" ? "Suspended" : "Active";
    setSchool((s: any) => ({ ...s, status: newStatus }));
    setShowConfirm(false);
    showToast(newStatus === "Suspended" ? `⚠️ ${school.name} has been suspended` : `✅ ${school.name} has been activated`);
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={school.name} subtitle={`${school.city}, ${school.state} · ${school.plan} Plan`} />
      <main className="flex-1 p-6 space-y-5">

        {/* Toast */}
        {toast && (
          <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">
            {toast}
          </div>
        )}

        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Institutes
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { showToast("📧 Email sent to " + school.adminEmail); }}>
              <Mail className="w-4 h-4" />Email Admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setEditForm({ name: school.name, city: school.city, state: school.state, address: school.address, phone: school.phone, adminEmail: school.adminEmail }); setShowEdit(true); }}>
              <Edit2 className="w-4 h-4" />Edit School
            </Button>
            {school.status === "Active"
              ? <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowConfirm(true)}>
                  <XCircle className="w-4 h-4" />Suspend
                </Button>
              : <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setShowConfirm(true)}>
                  <CheckCircle className="w-4 h-4" />Activate
                </Button>
            }
          </div>
        </div>

        {/* School header card */}
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{school.name}</h2>
                  {school.status === "Active"
                    ? <Badge variant="success">Active</Badge>
                    : <Badge variant="danger">Suspended</Badge>
                  }
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${planColors[school.plan]}`}>{school.plan}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{school.address}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{school.adminEmail}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{school.phone}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(school.joined).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{school.students.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-orange-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{school.staff}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Fee Collected</p>
                <p className="text-2xl font-bold text-gray-900">₹{(school.collected / 100000).toFixed(1)}L</p>
                <p className="text-xs text-green-600">{collectionPct}% of total</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-red-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">₹{(school.overdue / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Users breakdown */}
          <Card className="col-span-1">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" />Users by Role</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center pb-2 border-b border-gray-100">
                <p className="text-3xl font-bold text-gray-900">{totalUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total registered users</p>
              </div>
              {school.users.map(u => (
                <div key={u.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${u.color}`}>
                      <u.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm text-gray-700">{u.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `${Math.min((u.count / totalUsers) * 100, 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{u.count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Monthly collection chart */}
          <Card className="col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Monthly Fee Collection</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={school.monthlyCollection}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={v => [`₹${(Number(v) / 100000).toFixed(2)}L`, "Collected"]} />
                  <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Classes & Fee summary */}
        <div className="grid grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>Classes & Student Count</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {school.classes.map(cls => (
                <div key={cls.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cls.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      {cls.divisions.map(d => (
                        <span key={d} className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{cls.students}</p>
                    <p className="text-xs text-gray-400">students</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Fee Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  { label: "Total Fee", value: `₹${(school.totalFee / 100000).toFixed(1)}L`, color: "text-gray-900" },
                  { label: "Collected", value: `₹${(school.collected / 100000).toFixed(1)}L`, color: "text-green-600" },
                  { label: "Outstanding", value: `₹${((school.totalFee - school.collected) / 100000).toFixed(1)}L`, color: "text-orange-600" },
                  { label: "Overdue (90+ days)", value: `₹${(school.overdue / 100000).toFixed(1)}L`, color: "text-red-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className={`text-base font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Collection Rate</span>
                  <span className="font-semibold text-gray-900">{collectionPct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${collectionPct >= 80 ? "bg-green-500" : collectionPct >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${collectionPct}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* ── EDIT MODAL ── */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-[500px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Edit Institute Details</h3>
                <button onClick={() => setShowEdit(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-700" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Institute Name", "name", "col-span-2"],
                  ["City", "city", ""],
                  ["State", "state", ""],
                  ["Address", "address", "col-span-2"],
                  ["Phone", "phone", ""],
                  ["Admin Email", "adminEmail", ""],
                ].map(([label, key, cls]) => (
                  <div key={key} className={cls || ""}>
                    <label className="text-xs text-gray-500 font-medium">{label}</label>
                    <input value={editForm[key] || ""} onChange={e => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
                <Button onClick={handleEditSave}>Save Changes</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── CONFIRM SUSPEND/ACTIVATE ── */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-[400px] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${school.status === "Active" ? "bg-red-100" : "bg-green-100"}`}>
                  <AlertTriangle className={`w-5 h-5 ${school.status === "Active" ? "text-red-500" : "text-green-600"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{school.status === "Active" ? "Suspend Institute?" : "Activate Institute?"}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {school.status === "Active"
                      ? `All users of ${school.name} will immediately lose access.`
                      : `${school.name} and all its users will regain access.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button onClick={handleToggleStatus}
                  className={school.status === "Active" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}>
                  {school.status === "Active" ? "Yes, Suspend" : "Yes, Activate"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
