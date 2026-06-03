"use client";
import { useState } from "react";
import { Topbar } from "@/modules/shared/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search } from "lucide-react";

const callsData = [
  { id: 1, name: "Aisha Khan", type: "incoming", duration: "3:45", date: "2026-06-03 09:10" },
  { id: 2, name: "Ravi Sharma", type: "outgoing", duration: "1:20", date: "2026-06-03 10:35" },
  { id: 3, name: "Priya Nair", type: "missed", duration: "—", date: "2026-06-02 14:22" },
  { id: 4, name: "John David", type: "outgoing", duration: "5:10", date: "2026-06-02 11:00" },
  { id: 5, name: "Sara Mathew", type: "incoming", duration: "2:05", date: "2026-06-01 16:45" },
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "incoming") return <PhoneIncoming size={16} className="text-green-500" />;
  if (type === "outgoing") return <PhoneOutgoing size={16} className="text-blue-500" />;
  return <PhoneMissed size={16} className="text-red-500" />;
};

export function CallsPage() {
  const [search, setSearch] = useState("");
  const filtered = callsData.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Topbar title="Calls" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="flex items-center gap-3 p-4"><PhoneIncoming className="text-green-500" /><div><p className="text-sm text-gray-500">Incoming</p><p className="text-2xl font-bold">12</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4"><PhoneOutgoing className="text-blue-500" /><div><p className="text-sm text-gray-500">Outgoing</p><p className="text-2xl font-bold">8</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4"><PhoneMissed className="text-red-500" /><div><p className="text-sm text-gray-500">Missed</p><p className="text-2xl font-bold">3</p></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Call Log</CardTitle>
            <div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-3 py-2 border rounded-lg text-sm" /></div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2">Type</th><th className="pb-2">Duration</th><th className="pb-2">Date &amp; Time</th><th className="pb-2">Action</th></tr></thead>
              <tbody>{filtered.map(c => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3"><span className="flex items-center gap-1"><TypeIcon type={c.type} />{c.type}</span></td>
                  <td className="py-3">{c.duration}</td>
                  <td className="py-3 text-gray-500">{c.date}</td>
                  <td className="py-3"><Button size="sm" variant="outline" className="flex items-center gap-1"><Phone size={13} /> Call Back</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
