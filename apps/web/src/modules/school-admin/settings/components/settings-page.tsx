"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Badge } from "@/modules/shared/ui/badge";
import { School, CreditCard, Bell, Users, Shield, Palette, Save } from "lucide-react";
import {
  useSchoolProfile, useUpdateProfile, useStaffUsers, useUpdateStaffUser,
  useUpsertBank, useCreateStaffUser,
} from "@/lib/api/hooks/useSettings";

const SECTIONS = [
  { id: "school", label: "Institute Profile", icon: School },
  { id: "payment", label: "Payment Gateway", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "security", label: "Security", icon: Shield },
];

const PROFILE_FIELDS: { key: keyof ProfileForm; label: string; editable: boolean }[] = [
  { key: "name", label: "Institute Name", editable: true },
  { key: "schoolType", label: "Institute Type", editable: false },
  { key: "primaryEmail", label: "Primary Email", editable: false },
  { key: "primaryPhone", label: "Primary Phone", editable: true },
  { key: "city", label: "City", editable: true },
  { key: "state", label: "State", editable: true },
  { key: "pinCode", label: "PIN Code", editable: false },
  { key: "academicYearStart", label: "Academic Year Start", editable: true },
];

type ProfileForm = {
  name: string; schoolType: string; primaryEmail: string; primaryPhone: string;
  city: string; state: string; pinCode: string; academicYearStart: string;
};

const emptyProfileForm: ProfileForm = {
  name: "", schoolType: "", primaryEmail: "", primaryPhone: "",
  city: "", state: "", pinCode: "", academicYearStart: "",
};

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("school");
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const profileQuery = useSchoolProfile();
  const updateProfile = useUpdateProfile();
  const usersQuery = useStaffUsers();
  const updateStaffUser = useUpdateStaffUser();
  const upsertBank = useUpsertBank();
  const createStaffUser = useCreateStaffUser();
  const profile = profileQuery.data;
  const users = usersQuery.data ?? [];

  const [paymentGateway, setPaymentGateway] = useState("RAZORPAY");
  const [gatewayKeyId, setGatewayKeyId] = useState("");
  const [gatewaySecret, setGatewaySecret] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", username: "", password: "", role: "ACCOUNTANT" });

  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name ?? "",
        schoolType: profile.schoolType ?? "",
        primaryEmail: profile.primaryEmail ?? "",
        primaryPhone: profile.primaryPhone ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        pinCode: profile.pinCode ?? "",
        academicYearStart: String(profile.academicYearStart ?? ""),
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.bankDetail) {
      setPaymentGateway(profile.bankDetail.paymentGateway ?? "RAZORPAY");
      setGatewayKeyId(profile.bankDetail.gatewayApiKey ?? "");
      setUpiId(profile.bankDetail.upiId ?? "");
    }
  }, [profile?.bankDetail]);

  const saveGatewaySettings = () => {
    const bank = profile?.bankDetail;
    if (!bank) {
      showToast("⚠️ Save bank details under Institute Profile first");
      return;
    }
    upsertBank.mutate(
      {
        accountHolderName: bank.accountHolderName,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        ifscCode: bank.ifscCode,
        accountType: bank.accountType ?? "CURRENT",
        upiId: upiId || undefined,
        paymentGateway,
        gatewayApiKey: gatewayKeyId || undefined,
        gatewaySecret: gatewaySecret || undefined,
      },
      {
        onSuccess: () => showToast("✅ Payment gateway settings saved"),
        onError: () => showToast("❌ Failed to save gateway settings"),
      },
    );
  };

  const inviteUser = () => {
    if (!inviteForm.email || !inviteForm.username || !inviteForm.password) {
      showToast("⚠️ Email, username and password are required");
      return;
    }
    createStaffUser.mutate(
      {
        email: inviteForm.email,
        username: inviteForm.username,
        password: inviteForm.password,
        role: inviteForm.role,
      },
      {
        onSuccess: () => {
          showToast("📧 User invited successfully");
          setShowInviteModal(false);
          setInviteForm({ email: "", username: "", password: "", role: "ACCOUNTANT" });
        },
        onError: () => showToast("❌ Failed to invite user"),
      },
    );
  };

  const saveProfile = () => {
    updateProfile.mutate(
      {
        name: profileForm.name,
        primaryPhone: profileForm.primaryPhone || undefined,
        city: profileForm.city || undefined,
        state: profileForm.state || undefined,
        academicYearStart: profileForm.academicYearStart
          ? Number(profileForm.academicYearStart)
          : undefined,
      },
      {
        onSuccess: () => showToast("✅ Institute profile saved successfully"),
        onError: () => showToast("❌ Failed to save institute profile"),
      },
    );
  };

  const toggleUserActive = (id: string, isActive: boolean) => {
    updateStaffUser.mutate(
      { id, payload: { isActive: !isActive } },
      {
        onSuccess: () => showToast(isActive ? "✅ User deactivated" : "✅ User activated"),
        onError: () => showToast("❌ Failed to update user"),
      },
    );
  };

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-5 right-5 z-[999] bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl">{toast}</div>}
      <Topbar title="Settings" subtitle="Manage institute configuration · Greenfield Institute" />
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
                <CardHeader><CardTitle>Institute Profile</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl">🏫</div>
                    <div>
                      <p className="font-semibold text-gray-900">{profile?.name ?? "—"}</p>
                      <p className="text-sm text-gray-500">{profile?.slug ? `${profile.slug}.edufees.pro` : "—"}</p>
                      <Button variant="outline" size="sm" className="mt-2">Change Logo</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PROFILE_FIELDS.map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">{field.label}</label>
                        <input
                          value={profileForm[field.key]}
                          readOnly={!field.editable}
                          onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Button onClick={saveProfile}><Save className="w-4 h-4" />Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "payment" && (
              <Card>
                <CardHeader><CardTitle>Payment Gateway Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["RAZORPAY", "PAYU", "STRIPE", "MANUAL"].map(gw => (
                      <button key={gw} onClick={() => setPaymentGateway(gw)} className={`p-4 border-2 rounded-xl text-sm font-semibold transition-colors ${gw === paymentGateway ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                        {gw === "RAZORPAY" ? "⚡" : gw === "PAYU" ? "💙" : gw === "STRIPE" ? "💜" : "💵"} {gw}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-900 mb-3">Razorpay Configuration</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">API Key ID</label>
                        <input type="password" value={gatewayKeyId} onChange={e => setGatewayKeyId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="API Key ID" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">API Secret</label>
                        <input type="password" value={gatewaySecret} onChange={e => setGatewaySecret(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="API Secret" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">UPI ID</label>
                    <input value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="school@razorpay" />
                  </div>
                  <Button onClick={saveGatewaySettings} disabled={upsertBank.isPending}><Save className="w-4 h-4" />Save Gateway Settings</Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "users" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Users & Access Control</CardTitle>
                  <Button size="sm" onClick={() => setShowInviteModal(true)}><Users className="w-4 h-4" />Invite User</Button>
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
                      {users.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No users yet.</td></tr>
                      )}
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {user.username.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{user.username}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">{user.email}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={user.role === "INSTITUTE_ADMIN" ? "info" : user.role === "ACCOUNTANT" ? "success" : "default"}>
                              {user.role.replace(/_/g, " ")}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={user.isActive ? "success" : "default"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <Button variant="ghost" size="sm" onClick={() => toggleUserActive(user.id, user.isActive)}>{user.isActive ? "Deactivate" : "Activate"}</Button>
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
                  <Button onClick={() => showToast("✅ Notification preferences saved")}><Save className="w-4 h-4" />Save Preferences</Button>
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
                    <Button onClick={() => showToast("✅ Password updated successfully")}><Shield className="w-4 h-4" />Update Password</Button>
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

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Invite Staff User</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <input value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Username</label>
                <input value={inviteForm.username} onChange={e => setInviteForm(f => ({ ...f, username: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Temporary Password</label>
                <input type="password" value={inviteForm.password} onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="SCHOOL_ADMIN">School Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button onClick={inviteUser} disabled={createStaffUser.isPending}>Send Invite</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
