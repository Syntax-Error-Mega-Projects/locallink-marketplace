import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DiscountSlabTable from "@/components/DiscountSlabTable";
import { formatINR } from "@/lib/utils";
import { Users, Hammer, TrendingDown } from "lucide-react";
import { LabourEstimate } from "@/types";

const WORK_TYPES = ["mason", "helper", "tile fitter", "painter", "welder", "roof/slab worker", "electrician", "plumber"];
const CREW_SIZES = [1, 2, 5, 10, 20];

export default function LabourBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workType, setWorkType] = useState("mason");
  const [workers, setWorkers] = useState(5);
  const [days, setDays] = useState(5);
  const [startDate, setStartDate] = useState("");
  const [teamLead, setTeamLead] = useState("");
  const [address, setAddress] = useState("");
  const [estimate, setEstimate] = useState<LabourEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [error, setError] = useState("");

  // Live estimate whenever inputs change
  useEffect(() => {
    if (!startDate) return;
    const token = localStorage.getItem("locallink_token");
    if (!token) return;
    api.post("/api/labour/estimate", { work_type: workType, workers_count: workers, days, start_date: startDate })
      .then(r => setEstimate(r.data))
      .catch(() => {});
  }, [workType, workers, days, startDate]);

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!startDate) { setError("Please select a start date."); return; }
    setError("");
    setBookLoading(true);
    try {
      const res = await api.post("/api/labour/book", {
        work_type: workType, workers_count: workers, days,
        start_date: startDate, team_lead: teamLead, address,
      });
      navigate(`/payment/${res.data.booking_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Booking failed.");
    } finally { setBookLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <span className="text-4xl">???</span> Labour Package Builder
          </h1>
          <p className="text-slate-400">Hire verified construction workers by the day. Bulk discounts up to 15%.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Config panel */}
          <div className="space-y-6">
            {/* Work type */}
            <div className="glass-card">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Hammer className="w-4 h-4 text-orange-400" />Work Type</h2>
              <div className="grid grid-cols-2 gap-2">
                {WORK_TYPES.map(wt => (
                  <button key={wt} id={`wt-${wt}`} onClick={() => setWorkType(wt)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${workType === wt ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                    {wt.charAt(0).toUpperCase() + wt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Crew size */}
            <div className="glass-card">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-orange-400" />Crew Size</h2>
              <div className="flex gap-3 flex-wrap">
                {CREW_SIZES.map(n => (
                  <button key={n} id={`crew-${n}`} onClick={() => setWorkers(n)}
                    className={`w-16 h-16 rounded-xl font-bold text-lg transition-all ${workers === n ? "gradient-btn scale-105" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">workers</p>
            </div>

            {/* Days + dates */}
            <div className="glass-card space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Number of Days</label>
                <Input id="labour-days" type="number" min={1} max={365} value={days} onChange={e => setDays(parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
                <Input id="labour-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Team Lead Name (optional)</label>
                <Input id="labour-lead" value={teamLead} onChange={e => setTeamLead(e.target.value)} placeholder="Ramesh Kumar" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Site Address</label>
                <Input id="labour-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Plot 12, Wakad, Pune 411057" />
              </div>
            </div>
          </div>

          {/* Summary panel */}
          <div className="space-y-6">
            <div className="glass-card">
              <h2 className="font-semibold mb-4">Bulk Discount Slabs</h2>
              {estimate ? (
                <DiscountSlabTable slabs={estimate.slab_table} activeWorkers={workers} />
              ) : (
                <div className="text-slate-500 text-sm">Select a start date to see estimate</div>
              )}
            </div>

            {estimate && (
              <div className="glass-card animate-slide-up">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-emerald-400" />Your Estimate</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>{workers} workers × {days} days × {formatINR(estimate.base_rate_per_worker_per_day)}/day</span>
                    <span>{formatINR(estimate.subtotal)}</span>
                  </div>
                  {estimate.discount_pct > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Bulk discount ({estimate.discount_pct}%)</span>
                      <span>-{formatINR(estimate.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-slate-100 text-base">
                    <span>Total</span>
                    <span className="gradient-text">{formatINR(estimate.total + 50)}</span>
                  </div>
                  {estimate.discount_pct > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mt-2">
                      <p className="text-emerald-300 text-sm font-medium">
                        You save {formatINR(estimate.discount_amount)} ({estimate.discount_pct}%) with this package!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <Button id="labour-book-btn" className="w-full" size="lg" onClick={handleBook} disabled={bookLoading || !startDate}>
              {bookLoading ? "Creating booking..." : estimate ? `Book Package — ${formatINR(estimate.total + 50)}` : "Select start date to book"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
