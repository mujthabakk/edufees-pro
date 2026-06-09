"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { CheckCircle, Eye, EyeOff, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfilePage() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Profile header card */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-5 text-white flex items-center gap-4">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0">S</div>
        <div>
          <h2 className="text-lg font-bold">Suresh Mehta</h2>
          <p className="text-teal-100 text-sm">Parent of Arjun Mehta</p>
          <p className="text-teal-200 text-xs mt-0.5">Class 9-A · Greenfield Academy</p>
        </div>
      </div>

      {/* Stack on mobile, 2 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile info */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />Profile updated successfully
              </div>
            )}
            {[
              ["Father's Name", "Suresh Mehta"],
              ["Mother's Name", "Priya Mehta"],
              ["Mobile Number", "9876543200"],
              ["WhatsApp Number", "9876543200"],
            ].map(([label, value]) => (
              <div key={label}>
                <label className="text-xs text-gray-500 font-medium">{label}</label>
                <input defaultValue={value} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 font-medium">Email Address</label>
              <input defaultValue="arjun.parent@gmail.com" type="email" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Change password */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {pwSaved && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4" />Password changed successfully
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium">Current Password</label>
                <div className="relative mt-1">
                  <input type={showOld ? "text" : "password"} className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter current password" />
                  <button onClick={() => setShowOld(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">New Password</label>
                <div className="relative mt-1">
                  <input type={showNew ? "text" : "password"} className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Min 8 characters" />
                  <button onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Confirm New Password</label>
                <input type="password" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Re-enter new password" />
              </div>
              <Button className="w-full" variant="outline" onClick={() => { setPwSaved(true); setTimeout(() => setPwSaved(false), 3000); }}>
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Student info */}
          <Card className="p-4 bg-teal-50 border-teal-100">
            <h3 className="text-sm font-semibold text-teal-900 mb-3">Student Information</h3>
            <div className="space-y-2">
              {[
                ["Student Name", "Arjun Mehta"],
                ["Admission No.", "ADM2024001"],
                ["Class", "Class 9 – Division A"],
                ["Batch", "2024-25"],
                ["School", "Greenfield Academy"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-teal-600">{k}</span>
                  <span className="font-medium text-teal-900">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Sign out — mobile prominent */}
          <button onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
