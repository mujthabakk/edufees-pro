"use client";
import { useState } from "react";
import { CheckCircle, Eye, EyeOff, LogOut, Camera, Lock, User, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

const student = {
  name:        "Aryan Sharma",
  admissionNo: "ADM-2024-001",
  class:       "Class 10",
  division:    "A",
  rollNo:      "24",
  batch:       "2025-26",
  school:      "Greenfield Academy",
  quota:       "General",
  dob:         "15/03/2010",
  gender:      "Male",
  father:      "Rajesh Sharma",
  mother:      "Priya Sharma",
  mobile:      "9876543210",
  whatsapp:    "9876543210",
  email:       "aryan.sharma@gmail.com",
  address:     "204, Green Park, Bengaluru – 560001",
};

export function StudentProfilePage() {
  const [whatsapp, setWhatsapp] = useState(student.whatsapp);
  const [email, setEmail]       = useState(student.email);
  const [saved, setSaved]       = useState(false);

  const [oldPw, setOldPw]       = useState("");
  const [newPw, setNewPw]       = useState("");
  const [confPw, setConfPw]     = useState("");
  const [showOld, setShowOld]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwSaved, setPwSaved]   = useState(false);
  const [pwError, setPwError]   = useState("");

  const [tab, setTab] = useState<"profile"|"security"|"info">("profile");
  const router = useRouter();

  const saveProfile = () => { setSaved(true); setTimeout(()=>setSaved(false),3000); };
  const changePw = () => {
    if (newPw.length < 8)              { setPwError("Password must be at least 8 characters"); return; }
    if (newPw !== confPw)              { setPwError("Passwords do not match"); return; }
    if (!/\d/.test(newPw))            { setPwError("Password must contain at least 1 number"); return; }
    setPwError(""); setPwSaved(true); setOldPw(""); setNewPw(""); setConfPw("");
    setTimeout(()=>setPwSaved(false),3000);
  };

  return (
    <div className="space-y-4">
      {/* Profile hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">
              {student.name.split(" ").map(n=>n[0]).join("")}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
              <Camera className="w-3 h-3 text-indigo-600" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold">{student.name}</h2>
            <p className="text-indigo-200 text-xs">{student.class} – {student.division} · Roll {student.rollNo}</p>
            <p className="text-indigo-300 text-xs">{student.admissionNo} · {student.school}</p>
          </div>
        </div>
        {/* Info pills */}
        <div className="flex gap-2 flex-wrap mt-4">
          {[student.quota, `AY ${student.batch}`, student.gender, student.dob].map(v => (
            <span key={v} className="text-xs bg-white/15 text-white px-2.5 py-1 rounded-full">{v}</span>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {([
          { key:"profile",  label:"Contact",  icon:<User className="w-4 h-4"/> },
          { key:"security", label:"Security", icon:<Lock className="w-4 h-4"/> },
          { key:"info",     label:"Academic", icon:<BookOpen className="w-4 h-4"/> },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${tab===t.key?"bg-white text-indigo-700 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Contact tab */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4"/>Profile updated successfully
            </div>
          )}
          {/* Read-only fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["Full Name",  student.name,  true],
              ["Father's Name", student.father, true],
              ["Mother's Name", student.mother, true],
              ["Mobile Number", student.mobile, true],
            ].map(([label, value, readonly]) => (
              <div key={label as string}>
                <label className="text-xs text-gray-500 font-medium">{label as string} {readonly && <span className="text-gray-300 text-[10px]">(read-only)</span>}</label>
                <input defaultValue={value as string} disabled={readonly as boolean}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
            ))}
          </div>
          {/* Editable */}
          <div>
            <label className="text-xs text-gray-500 font-medium">WhatsApp Number <span className="text-indigo-500 text-[10px]">(editable)</span></label>
            <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Email Address <span className="text-indigo-500 text-[10px]">(editable)</span></label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Address <span className="text-gray-300 text-[10px]">(read-only)</span></label>
            <textarea defaultValue={student.address} disabled rows={2}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none disabled:bg-gray-50 disabled:text-gray-400" />
          </div>
          <button onClick={saveProfile} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
            Save Changes
          </button>
          <p className="text-xs text-center text-gray-400">To change Name, Class, or Admission No., contact school admin</p>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          {pwSaved && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4"/>Password changed successfully
            </div>
          )}
          {pwError && (
            <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-xl">{pwError}</div>
          )}
          {[
            { label:"Current Password", val:oldPw, set:setOldPw, show:showOld, toggle:()=>setShowOld(v=>!v) },
            { label:"New Password",     val:newPw, set:setNewPw, show:showNew, toggle:()=>setShowNew(v=>!v) },
            { label:"Confirm Password", val:confPw,set:setConfPw,show:showConf,toggle:()=>setShowConf(v=>!v) },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-gray-500 font-medium">{f.label}</label>
              <div className="relative mt-1">
                <input type={f.show?"text":"password"} value={f.val} onChange={e=>f.set(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={f.label==="New Password"?"Min 8 chars, 1 number":""} />
                <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {f.show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
          ))}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-700">Password requirements:</p>
            <p className={newPw.length >= 8 ? "text-green-600" : ""}>✓ Minimum 8 characters</p>
            <p className={/\d/.test(newPw) ? "text-green-600" : ""}>✓ At least 1 number</p>
            <p className={newPw === confPw && confPw ? "text-green-600" : ""}>✓ Passwords match</p>
          </div>
          <button onClick={changePw} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
            Update Password
          </button>
        </div>
      )}

      {/* Academic Info tab */}
      {tab === "info" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <p className="text-xs text-gray-400 font-medium">All fields are read-only. Contact school admin for changes.</p>
          {[
            ["Student Name",    student.name],
            ["Admission No.",   student.admissionNo],
            ["Class",           student.class],
            ["Division",        student.division],
            ["Roll Number",     student.rollNo],
            ["Academic Year",   student.batch],
            ["Quota / Category",student.quota],
            ["Date of Birth",   student.dob],
            ["Gender",          student.gender],
            ["School",          student.school],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{k}</span>
              <span className="text-sm font-semibold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sign out */}
      <button onClick={() => router.push("/")}
        className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
        <LogOut className="w-4 h-4"/>Sign Out
      </button>
    </div>
  );
}
