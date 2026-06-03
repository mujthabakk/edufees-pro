"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";

const Field = ({ label, placeholder, required, type = "text" }: { label: string; placeholder?: string; required?: boolean; type?: string }) => (
  <div>
    <label className="text-xs text-gray-500 font-medium">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <input type={type} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder={placeholder} />
  </div>
);

const Select = ({ label, options, required }: { label: string; options: string[]; required?: boolean }) => (
  <div>
    <label className="text-xs text-gray-500 font-medium">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <select className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
      <option value="">Select...</option>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

export function AddStudentPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="Add Student" subtitle="Student registered successfully" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Student Added!</h2>
            <p className="text-gray-500 mb-6 text-sm">The student has been registered. Login credentials will be sent to the parent's WhatsApp and email.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/teacher/students")}>View Students</Button>
              <Button variant="outline" onClick={() => setSubmitted(false)}>Add Another</Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Student" subtitle="Register a new student under your class" />
      <main className="flex-1 p-6 space-y-5">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />Back
        </button>

        <div className="grid grid-cols-3 gap-5">
          {/* Personal Info */}
          <Card className="col-span-2">
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Field label="Full Name" placeholder="As per records" required />
              <Field label="Date of Birth" type="date" required />
              <Select label="Gender" options={["Male", "Female", "Other"]} required />
              <Field label="Admission Number" placeholder="Auto or manual" />
              <Select label="Class" options={["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"]} required />
              <Select label="Division" options={["A", "B", "C", "D"]} required />
              <Field label="Roll No." placeholder="Optional" />
              <Select label="Admission Quota" options={["General", "Management", "SC/ST", "Sports", "Staff Ward"]} />
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5 bg-orange-50 border-orange-200">
              <h3 className="text-sm font-semibold text-orange-900 mb-2">Required Fields</h3>
              <ul className="space-y-1 text-xs text-orange-700">
                <li>• Full Name</li><li>• Date of Birth</li><li>• Gender</li>
                <li>• Class & Division</li><li>• Parent Mobile</li>
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">After Submission</h3>
              <ul className="space-y-1.5 text-xs text-gray-500">
                {["Login credentials auto-generated", "WhatsApp sent to parent", "Email sent to parent", "Student visible in your class list"].map(i => (
                  <li key={i} className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" />{i}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Contact Info */}
          <Card className="col-span-2">
            <CardHeader><CardTitle>Contact & Parent Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Field label="Parent Mobile" placeholder="10-digit mobile" required type="tel" />
              <Field label="WhatsApp Number" placeholder="If different from mobile" type="tel" />
              <Field label="Parent Email" placeholder="parent@email.com" type="email" />
              <Field label="Father's Name" />
              <Field label="Mother's Name" />
              <Field label="Guardian Name" placeholder="If different from parents" />
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="col-span-2">
            <CardHeader><CardTitle>Address</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Field label="Address Line 1" placeholder="House/Flat, Street, Locality" /></div>
              <Field label="City" />
              <Field label="State" />
              <Field label="PIN Code" type="text" placeholder="6-digit PIN" />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setSubmitted(true)}>Add Student</Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </main>
    </div>
  );
}
