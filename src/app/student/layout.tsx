import { StudentLayout } from "@/modules/student/_layout/components/student-layout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>;
}
