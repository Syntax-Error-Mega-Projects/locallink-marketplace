import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { ServiceCategory, WorkerProvider } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { Star, ArrowLeft, CalendarDays, MessageSquare } from "lucide-react";

export default function ProfessionalBooking() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [cat, setCat] = useState<ServiceCategory | null>(null);
  const [providers, setProviders] = useState<WorkerProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!serviceId) return;
    api.get("/api/categories").then(r => {
      const found = r.data.find((c: ServiceCategory) => c.id === parseInt(serviceId));
      setCat(found || null);
    });
    api.get(`/api/categories/${serviceId}/providers`).then(r => {
      setProviders(r.data);
      if (r.data.length > 0) setSelectedProvider(r.data[0].user_id);
    }).catch(() => {});
  }, [serviceId]);

  if (!cat) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  const handleBook = async () => {
    if (!date) { setError("Please select a preferred date."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/bookings", {
        category_id: parseInt(serviceId!),
        mode: "home",
        scheduled_at: new Date(date).toISOString(),
        notes,
        service_charge: cat.base_service_charge,
      });
      navigate(`/payment/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Booking failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-6">{cat.icon} Book {cat.name}</h1>

        {/* Professional profiles */}
        {providers.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-slate-300 mb-3">Select Professional</h2>
            <div className="space-y-3">
              {providers.map(p => (
                <button key={p.user_id} onClick={() => setSelectedProvider(p.user_id)}
                  className={`w-full glass-card text-left transition-all ${selectedProvider === p.user_id ? "border-orange-500" : ""}`}>
                  <div className="flex items-center gap-4 p-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-100">{p.name}</p>
                        <VerifiedBadge />
                        {p.available_today && <Badge variant="success" className="text-xs">Available Today</Badge>}
                      </div>
                      <p className="text-xs text-slate-400">{p.bio}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-amber-400 text-xs">
                          <Star className="w-3 h-3 fill-amber-400" />{p.rating}
                        </span>
                        <span className="text-xs text-slate-400">{p.experience_years} yrs exp</span>
                        <span className="text-xs text-orange-400 font-medium">{formatINR(p.base_rate)} / consultation</span>
                      </div>
                    </div>
                    {selectedProvider === p.user_id && (
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fee breakdown */}
        <div className="glass-card mb-6 p-5">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Consultation fee</span>
            <span className="font-medium">{formatINR(cat.base_service_charge)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Platform fee</span>
            <span className="font-medium">Rs 50</span>
          </div>
          <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-slate-100">
            <span>Total</span>
            <span className="gradient-text">{formatINR(cat.base_service_charge + 50)}</span>
          </div>
          <div className="mt-3 text-xs text-emerald-300 bg-emerald-500/10 rounded-lg px-3 py-2">
            You save {formatINR(cat.market_rate_estimate - cat.base_service_charge - 50)} vs market rate of {formatINR(cat.market_rate_estimate)}
          </div>
        </div>

        {/* Booking form */}
        <div className="glass-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" /> Preferred Date & Time
            </label>
            <Input id="prof-date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Describe your matter (optional)
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
              placeholder="e.g. Property dispute, need consultation on legal options..." />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <Button id="prof-book-btn" className="w-full" size="lg" onClick={handleBook} disabled={loading}>
            {loading ? "Booking..." : `Book Consultation — ${formatINR(cat.base_service_charge + 50)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
