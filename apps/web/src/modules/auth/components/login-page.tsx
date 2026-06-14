"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, ChevronRight, Shield, Users, BookOpen, User, BarChart3 } from "lucide-react";
import { useLogin } from "@/lib/api/hooks/useAuth";

const ROLE_REDIRECTS: Record<string, string> = {
  SUPER_ADMIN: "/super-admin/dashboard",
  SCHOOL_ADMIN: "/dashboard",
  ACCOUNTANT: "/accountant/dashboard",
  TEACHER: "/teacher/dashboard",
  PARENT: "/parent/dashboard",
};

const ROLES = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    desc: "Platform-level management across all schools",
    icon: Shield,
    color: "bg-purple-600",
    lightColor: "bg-purple-50 text-purple-700 border-purple-200",
    email: "superadmin@edufees.pro",
    password: "Super@123",
    redirect: "/super-admin/dashboard",
  },
  {
    role: "SCHOOL_ADMIN",
    label: "School Admin",
    desc: "Full school management & configuration",
    icon: GraduationCap,
    color: "bg-indigo-600",
    lightColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    email: "admin@greenfield.edu",
    password: "Admin@123",
    redirect: "/dashboard",
  },
  {
    role: "ACCOUNTANT",
    label: "Accountant",
    desc: "Fee collection, payments & financial reports",
    icon: BarChart3,
    color: "bg-green-600",
    lightColor: "bg-green-50 text-green-700 border-green-200",
    email: "accounts@greenfield.edu",
    password: "Accounts@123",
    redirect: "/accountant/dashboard",
  },
  {
    role: "TEACHER",
    label: "Teacher",
    desc: "Class-wise student fee status view",
    icon: BookOpen,
    color: "bg-orange-500",
    lightColor: "bg-orange-50 text-orange-700 border-orange-200",
    email: "teacher@greenfield.edu",
    password: "Teacher@123",
    redirect: "/teacher/dashboard",
  },
  {
    role: "PARENT",
    label: "Parent",
    desc: "View fees, pay online & download invoices",
    icon: User,
    color: "bg-teal-600",
    lightColor: "bg-teal-50 text-teal-700 border-teal-200",
    email: "adm-2025-001@students.greenfield.edu",
    password: "Student@123",
    redirect: "/parent/dashboard",
  },
  {
    role: "STUDENT",
    label: "Student",
    desc: "My fee dashboard, invoices & payment history",
    icon: GraduationCap,
    color: "bg-violet-600",
    lightColor: "bg-violet-50 text-violet-700 border-violet-200",
    email: "adm-2025-001@students.greenfield.edu",
    password: "Student@123",
    redirect: "/student/dashboard",
  },
];

export function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [selectedRole, setSelectedRole] = useState(ROLES[1]);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(ROLES[1].email);
  const [password, setPassword] = useState(ROLES[1].password);
  const [error, setError] = useState("");
  const loading = login.isPending;

  const handleRoleSelect = (role: typeof ROLES[0]) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword(role.password);
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const redirect =
            selectedRole.role === "STUDENT"
              ? "/student/dashboard"
              : (ROLE_REDIRECTS[data.user.role] ?? selectedRole.redirect);
          router.push(redirect);
        },
        onError: (err: unknown) => {
          const axiosErr = err as {
            response?: { data?: { message?: string | string[] } };
          };
          const message = axiosErr.response?.data?.message;
          setError(
            Array.isArray(message)
              ? message.join(", ")
              : message ?? "Login failed. Check your credentials.",
          );
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-[1fr_420px] gap-8 items-start">

        {/* Left — Role Selector */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">EduFees Pro</h1>
              <p className="text-indigo-400 text-xs">Multi-tenant School Fee Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Select your role</h2>
          <p className="text-gray-400 text-sm mb-6">Choose a role to explore the demo. Credentials auto-fill.</p>

          <div className="space-y-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = selectedRole.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    active
                      ? "bg-white/10 border-white/20 shadow-lg"
                      : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm">{r.label}</p>
                      {active && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">Selected</span>}
                    </div>
                    <p className="text-gray-400 text-xs">{r.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gray-400 text-xs font-mono">{r.email}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-white" : "text-gray-600"}`} />
                </button>
              );
            })}
          </div>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Schools", value: "240+" },
              { label: "Students", value: "1.2L+" },
              { label: "Collected", value: "₹48Cr+" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login Form */}
        <div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Role indicator */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold mb-5 ${selectedRole.lightColor}`}>
              <div className={`w-2 h-2 rounded-full ${selectedRole.color}`} />
              Logging in as {selectedRole.label}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h3>
            <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${selectedRole.color} text-white py-2.5 rounded-lg text-sm font-semibold transition-opacity mt-2 ${loading ? "opacity-70" : "hover:opacity-90"}`}
              >
                {loading ? "Signing in..." : `Sign In as ${selectedRole.label}`}
              </button>
            </form>

            {/* Credentials box */}
            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-700 mb-2">All Demo Credentials</p>
              <div className="space-y-2">
                {ROLES.map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r)}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                  >
                    <span className="text-xs text-gray-600 font-medium">{r.label}</span>
                    <span className="text-xs text-gray-400 font-mono">{r.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            © 2026 EduFees Pro · Secure Multi-tenant Platform
          </p>
        </div>

      </div>
    </div>
  );
}
