import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Booking } from "@/types";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatDate } from "@/lib/utils";
import { Briefcase, DollarSign, CheckCircle, MapPin, Package, RefreshCw } from "lucide-react";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState<Booking[]>([]);
  const [myJobs, setMyJobs] = useState<Booking[]>([]);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [tab, setTab] = useState<"available" | "my">("available");

  const load = async () => {
    const [avail, mine] = await Promise.all([
      api.get("/api/bookings?available=true"),
      api.get("/api/bookings"),
    ]);
    setAvailable(avail.data);
    setMyJobs(mine.data);
  };

  useEffect(() => { load(); }, []);

  const accept = async (id: number) => {
    setAccepting(id);
    try {
      await api.post(`/api/bookings/${id}/accept`);
      await load();
      setTab("my");
    } finally { setAccepting(null); }
  };

  const NEXT_STATUS: Record<string, string> = {
    accepted: "on_the_way", on_the_way: "in_progress", in_progress: "completed"
  };

  const advance = async (id: number, status: string) => {
    const next = NEXT_STATUS[status];
    if (!next) return;
    setUpdatingStatus(id);
    try {
      await api.post(`/api/bookings/${id}/status`, { status: next });
      await load();
    } finally { setUpdatingStatus(null); }
  };

  const totalEarned = myJobs.filter(b => b.status === "paid").reduce((s, b) => s + Math.round(b.service_charge * 0.9), 0);
  const completedCount = myJobs.filter(b => ["completed", "paid"].includes(b.status)).length;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Worker Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, {user?.name}</p>
          </div>
          <button onClick={load} className="text-slate-400 hover:text-slate-200 p-2"><RefreshCw className="w-5 h-5" /></button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card text-center">
            <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold gradient-text">{formatINR(totalEarned)}</p>
            <p className="text-xs text-slate-400">Total Earned</p>
          </div>
          <div className="glass-card text-center">
            <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{completedCount}</p>
            <p className="text-xs text-slate-400">Jobs Completed</p>
          </div>
          <div className="glass-card text-center">
            <Package className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{available.length}</p>
            <p className="text-xs text-slate-400">New Jobs Available</p>
          </div>
        </div>

        {/* Supplier Map CTA */}
        <div className="glass-card mb-6 flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-100">Find cheapest suppliers nearby</p>
            <p className="text-xs text-slate-400">See the nearest suppliers with lowest prices for parts</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/suppliers/map")}>View Map</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-6">
          {(["available", "my"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-orange-500 text-white" : "text-slate-400 hover:text-slate-200"}`}>
              {t === "available" ? `Available Jobs (${available.length})` : `My Jobs (${myJobs.length})`}
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="space-y-4">
          {(tab === "available" ? available : myJobs).map(b => (
            <div key={b.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-100">Booking #{b.id}</p>
                  <p className="text-xs text-slate-400">{formatDate(b.created_at)} · {b.mode} visit</p>
                  {b.address && <p className="text-xs text-slate-500 mt-0.5">{b.address}</p>}
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Service: <span className="text-slate-100">{formatINR(b.service_charge)}</span></span>
                  <span className="text-emerald-400 font-medium">Your cut: {formatINR(Math.round(b.service_charge * 0.9))}</span>
                </div>
                <div className="flex gap-2">
                  {tab === "available" && (
                    <Button id={`accept-${b.id}`} size="sm" onClick={() => accept(b.id)} disabled={accepting === b.id}>
                      {accepting === b.id ? "Accepting..." : "Accept Job"}
                    </Button>
                  )}
                  {tab === "my" && NEXT_STATUS[b.status] && (
                    <Button id={`advance-${b.id}`} size="sm" onClick={() => advance(b.id, b.status)} disabled={updatingStatus === b.id}>
                      {updatingStatus === b.id ? "Updating..." : `Mark ${NEXT_STATUS[b.status].replace("_", " ")}`}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${b.id}`)}>View</Button>
                </div>
              </div>
            </div>
          ))}
          {(tab === "available" ? available : myJobs).length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>{tab === "available" ? "No available jobs right now. Check back soon!" : "No jobs yet."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
