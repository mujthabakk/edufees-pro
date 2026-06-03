"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { CheckCircle, Eye, EyeOff } from "lucide-react";

export function ProfilePage() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  return (
    <div className="flex-1 p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">My Profile</h2>

      <div className="grid grid-cols-2 gap-5">
        {/* Profile info */}
        <Card>
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg"><CheckCircle className="w-4 h-4" />Profile updated successfully</div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-700">S</div>
              <div>
                <p className="font-semibold text-gray-900">Suresh Mehta</p>
                <p className="text-sm text-gray-500">Parent of Arjun Mehta · Class 9-A</p>
              </div>
            </div>
            {[
              ["Father's Name", "Suresh Mehta"],
              ["Mother's Name", "Priya Mehta"],
              ["Mobile Number", "9876543200"],
              ["WhatsApp Number", "9876543200"],
            ].map(([label, value]) => (
              <div key={label}>
                <label className="text-xs text-gray-500 font-medium">{label}</label>
                <input defaultValue={value} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 font-medium">Email Address</label>
              <input defaultValue="arjun.parent@gmail.com" type="email" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Change password */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {pwSaved && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg"><CheckCircle className="w-4 h-4" />Password changed successfully</div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium">Current Password</label>
                <div className="relative mt-1">
                  <input type={showOld ? "text" : "password"} className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter current password" />
                  <button onClick={() => setShowOld(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">New Password</label>
                <div className="relative mt-1">
                  <input type={showNew ? "text" : "password"} className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Min 8 characters" />
                  <button onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Confirm New Password</label>
                <input type="password" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Re-enter new password" />
              </div>
              <Button onClick={() => { setPwSaved(true); setTimeout(() => setPwSaved(false), 3000); }}>Update Password</Button>
            </CardContent>
          </Card>

          <Card className="p-5 bg-blue-50 border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Student Information (Read-only)</h3>
            <div className="space-y-2">
              {[["Student Name", "Arjun Mehta"], ["Admission No.", "ADM2024001"], ["Class", "Class 9 – Division A"], ["Batch", "2024-25"], ["School", "Greenfield Academy"]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-blue-700">{k}</span>
                  <span className="font-medium text-blue-900">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
