import { StudentsDetailPage } from "@/modules/school-admin/students-detail";

export const dynamicParams = false;

export async function generateStaticParams() {
  return ["1", "2", "3", "4", "5", "6", "7", "8"].map((id) => ({ id }));
}

export default function Page() {
  return <StudentsDetailPage />;
}
