import { ParentNav } from "./parent-nav";
export function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentNav />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
