import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { SavingsSummary as Summary } from "@/types";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { TrendingDown, Users, Package, Zap, Home, Star } from "lucide-react";

export default function SavingsSummary() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api.get(`/api/payments/savings/${bookingId}`).then(r => setSummary(r.data)).catch(() => {});
  }, [bookingId]);

  if (!summary) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  const splits = [
    { label: "Worker earnings", amount: summary.worker_amount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Supplier revenue", amount: summary.supplier_amount, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "LocalLink platform", amount: summary.platform_amount, icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-xl mx-auto animate-fade-in">
        {/* Hero savings */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <TrendingDown className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">
            You saved{" "}
            <span className="text-emerald-400">{formatINR(summary.savings)}!</span>
          </h1>
          <p className="text-2xl font-bold text-emerald-300 mb-1">{summary.savings_pct}% cheaper than market</p>
          <p className="text-slate-400 text-sm">vs market rate of {formatINR(summary.market_price_estimate)}</p>
        </div>

        {/* Cost breakdown */}
        <div className="glass-card mb-6">
          <h2 className="font-semibold mb-4 text-slate-100">What you paid</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Service charge</span><span>{formatINR(summary.service_charge)}</span>
            </div>
            {summary.parts_total > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Parts (supplier wholesale)</span><span>{formatINR(summary.parts_total)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Platform fee</span><span>{formatINR(summary.fee)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-slate-100">
              <span>Total paid</span><span className="gradient-text">{formatINR(summary.total)}</span>
            </div>
            <div className="flex justify-between text-slate-500 line-through">
              <span>Market would have cost</span><span>{formatINR(summary.market_price_estimate)}</span>
            </div>
          </div>
        </div>

        {/* Money distribution */}
        <div className="glass-card mb-6">
          <h2 className="font-semibold mb-4 text-slate-100">Where your money goes</h2>
          <div className="space-y-3">
            {splits.map(s => (
              <div key={s.label} className={`flex items-center gap-3 rounded-xl ${s.bg} p-3`}>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{s.label}</p>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700"
                      style={{ width: `${(s.amount / summary.total) * 100}%` }} />
                  </div>
                </div>
                <p className={`font-bold ${s.color}`}>{formatINR(s.amount)}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">Supplier buys parts at wholesale — savings passed to you</p>
        </div>

        {/* Star rating prompt */}
        <div className="glass-card mb-6 text-center p-6">
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 fill-amber-400" />
          <p className="font-semibold text-slate-100 mb-1">Enjoyed the service?</p>
          <p className="text-sm text-slate-400 mb-4">Rate your worker to help other customers</p>
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-400 font-bold transition-all hover:scale-110">
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" size="lg" onClick={() => navigate("/categories")}>
            <Home className="w-4 h-4 mr-2" />Book Another Service
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate(`/jobs/${bookingId}`)}>
            View Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
