import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/api/axios";
import { ServiceCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RateCard from "@/components/RateCard";
import { Home, Store, ArrowLeft, CalendarDays } from "lucide-react";

export default function BookingForm() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [cat, setCat] = useState<ServiceCategory | null>(null);
  const [mode, setMode] = useState(params.get("mode") || "home");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/categories").then(r => {
      const found = r.data.find((c: ServiceCategory) => c.id === parseInt(serviceId!));
      setCat(found || null);
    });
  }, [serviceId]);

  if (!cat) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  const sc = mode === "shop" ? Math.round(cat.base_service_charge * 0.9) : cat.base_service_charge;
  const partsEst = cat.group === "home_repair" ? Math.round(cat.market_rate_estimate * 0.27) : 0;
  const total = sc + 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/bookings", {
        category_id: parseInt(serviceId!),
        mode,
        address,
        scheduled_at: date ? new Date(date).toISOString() : null,
        notes,
        service_charge: sc,
      });
      navigate(`/payment/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Booking failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-xl mx-auto animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-2">{cat.icon} Book {cat.name}</h1>
        <p className="text-slate-400 text-sm mb-6">Choose your visit type and schedule</p>

        {cat.shop_visit_allowed && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Visit Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" id="mode-home" onClick={() => setMode("home")}
                className={`rounded-xl border p-4 text-left transition-all ${mode === "home" ? "border-orange-500 bg-orange-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                <Home className={`w-5 h-5 mb-2 ${mode === "home" ? "text-orange-400" : "text-slate-400"}`} />
                <p className={`font-semibold text-sm ${mode === "home" ? "text-orange-300" : "text-slate-300"}`}>Home Visit</p>
                <p className="text-xs text-slate-500">Rs {cat.base_service_charge}</p>
              </button>
              <button type="button" id="mode-shop" onClick={() => setMode("shop")}
                className={`rounded-xl border p-4 text-left transition-all ${mode === "shop" ? "border-orange-500 bg-orange-500/10" : "border-slate-700 hover:border-slate-600"}`}>
                <Store className={`w-5 h-5 mb-2 ${mode === "shop" ? "text-orange-400" : "text-slate-400"}`} />
                <p className={`font-semibold text-sm ${mode === "shop" ? "text-orange-300" : "text-slate-300"}`}>Shop Visit</p>
                <p className="text-xs text-emerald-400">Rs {Math.round(cat.base_service_charge * 0.9)} (10% off)</p>
              </button>
            </div>
          </div>
        )}

        <RateCard
          serviceName={cat.name}
          serviceCharge={sc}
          partsEstimate={partsEst}
          convenienceFee={50}
          total={total}
          marketEstimate={cat.market_rate_estimate}
          mode={mode}
        />

        <form onSubmit={handleSubmit} className="mt-6 glass-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {mode === "shop" ? "Your address (for record)" : "Service address"}
            </label>
            <Input id="booking-address" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Flat 4B, Aundh, Pune 411007" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />Preferred date & time
            </label>
            <Input id="booking-date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
              placeholder="Any specific issues or requirements..." />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <Button id="booking-submit" type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating booking..." : `Book Now — Rs ${total}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
