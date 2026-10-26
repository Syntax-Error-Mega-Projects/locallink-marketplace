import { useEffect, useState } from "react";
import api from "@/api/axios";
import { Badge } from "@/components/ui/badge";
import VerifiedBadge from "@/components/VerifiedBadge";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VerifyRecord {
  user_id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  verified: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  customer: "info", worker: "default", supplier: "success", admin: "secondary"
};

export default function AdminVerifications() {
  const [records, setRecords] = useState<VerifyRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    api.get("/api/admin/verifications").then(r => setRecords(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.role === filter;
    return matchSearch && matchFilter;
  });

  const roleCounts = records.reduce((acc, r) => { acc[r.role] = (acc[r.role] || 0) + 1; return acc; }, {} as Record<string, number>);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-orange-400" />Admin: Verification Status
          </h1>
          <p className="text-slate-400">All registered users and their verification status. All verified (mocked).</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {["customer", "worker", "supplier", "admin"].map(role => (
            <div key={role} className="glass-card text-center">
              <p className="text-2xl font-bold text-slate-100">{roleCounts[role] || 0}</p>
              <p className="text-xs text-slate-400 capitalize">{role}s</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input id="admin-search" className="pl-10" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["all", "customer", "worker", "supplier", "admin"].map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${filter === r ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-400">
                <th className="text-left px-5 py-3 font-medium">User</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">Phone</th>
                <th className="text-left px-5 py-3 font-medium">Joined</th>
                <th className="text-left px-5 py-3 font-medium">Verification</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.user_id} className="border-t border-slate-800 hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-bold text-white">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={(ROLE_COLORS[r.role] as any) || "secondary"} className="capitalize">{r.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{r.phone}</td>
                  <td className="px-5 py-3 text-slate-400">{formatDate(r.created_at)}</td>
                  <td className="px-5 py-3">{r.verified ? <VerifiedBadge /> : <Badge variant="destructive">Pending</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 text-xs text-slate-500 border-t border-slate-800 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> {filtered.length} users · Verification is mocked for demo (all verified instantly)
          </div>
        </div>
      </div>
    </div>
  );
}
