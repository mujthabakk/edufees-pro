import { ParentNav } from "@/modules/parent/_layout/components/parent-nav";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50"><ParentNav /><div className="max-w-5xl mx-auto">{children}</div></div>;
}
