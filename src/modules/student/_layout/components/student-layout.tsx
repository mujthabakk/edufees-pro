import { StudentNav } from "./student-nav";
export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNav />
      <main className="max-w-5xl mx-auto px-4 py-4 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
