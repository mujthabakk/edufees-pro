"use client";

import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { School, CreditCard, Bell, Users, Shield, Palette, Save } from "lucide-react";

const SECTIONS = [
  { id: "school", label: "School Profile", icon: School },
  { id: "payment", label: "Payment Gateway", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "security", label: "Security", icon: Shield },
];

const mockUsers = [
  { id: "1", name: "School Admin", email: "admin@greenfield.edu", role: "SCHOOL_ADMIN", isActive: true },
  { id: "2", name: "Ravi Accountant", email: "ravi@greenfield.edu", role: "ACCOUNTANT", isActive: true },
  { id: "3", name: "Priya Teacher", email: "priya.teacher@greenfield.edu", role: "TEACHER", isActive: true },
  { id: "4", name: "Suresh Accounts", email: "suresh@greenfield.edu", role: "ACCOUNTANT", isActive: false },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("school");

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Settings" subtitle="Manage school configuration" />
      <main className="flex-1 p-6">
        <div className="flex gap-6">
          {/* Sidebar Nav */}
          <div className="w-48 shrink-0 space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeSection === id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">

            {activeSection === "school" && (
              <Card>
                <CardHeader><CardTitle>School Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl">🏫</div>
                    <div>
                      <p className="font-semibold text-gray-900">Greenfield Academy</p>
                      <p className="text-sm text-gray-500">greenfield.edufees.pro</p>
                      <Button variant="outline" size="sm" className="mt-2">Change Logo</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "School Name", value: "Greenfield Academy" },
                      { label: "School Type", value: "SECONDARY" },
                      { label: "Primary Email", value: "contact@greenfield.edu" },
                      { label: "Primary Phone", value: "+91 98765 43210" },
                      { label: "City", value: "Bangalore" },
                      { label: "State", value: "Karnataka" },
                      { label: "PIN Code", value: "560001" },
                      { label: "Academic Year Start", value: "April (Month 4)" },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{field.label}</label>
                        <input defaultValue={field.value} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Button><Save className="w-4 h-4" />Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "payment" && (
              <Card>
                <CardHeader><CardTitle>Payment Gateway Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    {["RAZORPAY", "PAYU", "STRIPE", "MANUAL"].map(gw => (
                      <button key={gw} className={`p-4 border-2 rounded-xl text-sm font-semibold transition-colors ${gw === "RAZORPAY" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        {gw === "RAZORPAY" ? "⚡" : gw === "PAYU" ? "💙" : gw === "STRIPE" ? "💜" : "💵"} {gw}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-900 mb-3">Razorpay Configuration</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">API Key ID</label>
                        <input type="password" defaultValue="rzp_live_••••••••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">API Secret</label>
                        <input type="password" defaultValue="••••••••••••••••••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">UPI ID</label>
                    <input defaultValue="greenfield@razorpay" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <Button><Save className="w-4 h-4" />Save Gateway Settings</Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "users" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Users & Access Control</CardTitle>
                  <Button size="sm"><Users className="w-4 h-4" />Invite User</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        {["User", "Email", "Role", "Status", ""].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map(user => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {user.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{user.email}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={user.role === "SCHOOL_ADMIN" ? "info" : user.role === "ACCOUNTANT" ? "success" : "default"}>
                              {user.role.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={user.isActive ? "success" : "default"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card>
                <CardHeader><CardTitle>Notification Settings</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { label: "Payment Confirmation", desc: "Send receipt after payment", wa: true, email: true },
                    { label: "Fee Due Reminder", desc: "3 days before due date", wa: true, email: false },
                    { label: "Overdue Alert", desc: "When fee becomes overdue", wa: true, email: true },
                    { label: "Monthly Statement", desc: "First of every month", wa: false, email: true },
                  ].map(notif => (
                    <div key={notif.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notif.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" defaultChecked={notif.wa} className="rounded border-gray-300 text-green-600" />
                          WhatsApp
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" defaultChecked={notif.email} className="rounded border-gray-300 text-indigo-600" />
                          Email
                        </label>
                      </div>
                    </div>
                  ))}
                  <Button><Save className="w-4 h-4" />Save Preferences</Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card>
                <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900">Change Password</p>
                    {["Current Password", "New Password", "Confirm New Password"].map(label => (
                      <div key={label}>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
                        <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    ))}
                    <Button><Shield className="w-4 h-4" />Update Password</Button>
                  </div>
                  <div className="border-t border-gray-100 pt-5 space-y-3">
                    <p className="text-sm font-medium text-gray-900">Session & Login</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">Lock after failed attempts</p>
                        <p className="text-xs text-gray-500">Account locks after 5 failed logins</p>
                      </div>
                      <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">Force password change on first login</p>
                        <p className="text-xs text-gray-500">New users must reset password</p>
                      </div>
                      <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-sm font-medium text-gray-900 mb-3">Subscription Plan</p>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
                      <p className="text-xs opacity-80 uppercase font-medium tracking-wide">Current Plan</p>
                      <p className="text-2xl font-bold mt-1">Growth</p>
                      <p className="text-sm opacity-80 mt-1">Up to 500 students · Expires Mar 31, 2027</p>
                      <Button variant="secondary" size="sm" className="mt-3 bg-white text-indigo-700 hover:bg-gray-100">Upgrade to Enterprise</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
