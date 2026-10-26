import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Booking } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import { CheckCircle, Clock, MapPin, Package, CreditCard, ArrowLeft, RefreshCw } from "lucide-react";

const STATUS_STEPS = [
  { key: "requested", label: "Requested", icon: Clock },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "on_the_way", label: "On the Way", icon: MapPin },
  { key: "in_progress", label: "In Progress", icon: Package },
  { key: "completed", label: "Completed", icon: CheckCircle },
  { key: "paid", label: "Paid", icon: CreditCard },
];

export default function JobStatus() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const r = await api.get(`/api/bookings/${bookingId}`);
      setBooking(r.data);
    } catch { }
  };

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [bookingId]);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!booking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  const stepIdx = STATUS_STEPS.findIndex(s => s.key === booking.status);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-xl mx-auto animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Booking #{booking.id}</h1>
            <p className="text-slate-400 text-sm">Created {formatDate(booking.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            <button onClick={refresh} className="text-slate-400 hover:text-slate-200 transition-colors p-1">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-700 z-0" />
            <div className="absolute left-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 z-0 transition-all duration-700"
              style={{ width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` }} />
            {STATUS_STEPS.map((step, i) => {
              const done = i <= stepIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${done ? "border-orange-500 bg-orange-500" : "border-slate-700 bg-slate-900"}`}>
                    <Icon className={`w-4 h-4 ${done ? "text-white" : "text-slate-600"}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${done ? "text-orange-300" : "text-slate-600"}`}>{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking details */}
        <div className="glass-card mb-4 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Mode</span><span className="text-slate-100 capitalize">{booking.mode} visit</span></div>
          {booking.address && <div className="flex justify-between"><span className="text-slate-400">Address</span><span className="text-slate-100 text-right max-w-[60%]">{booking.address}</span></div>}
          {booking.scheduled_at && <div className="flex justify-between"><span className="text-slate-400">Scheduled</span><span className="text-slate-100">{formatDate(booking.scheduled_at)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-400">Service charge</span><span className="text-slate-100">{formatINR(booking.service_charge)}</span></div>
          {booking.parts_total > 0 && <div className="flex justify-between"><span className="text-slate-400">Parts</span><span className="text-slate-100">{formatINR(booking.parts_total)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-400">Platform fee</span><span className="text-slate-100">{formatINR(booking.fee)}</span></div>
          <div className="flex justify-between border-t border-slate-700 pt-2 font-semibold">
            <span className="text-slate-100">Total</span><span className="gradient-text">{formatINR(booking.total)}</span>
          </div>
          {booking.savings > 0 && (
            <div className="text-emerald-300 text-sm bg-emerald-500/10 rounded-lg px-3 py-2">
              You saved {formatINR(booking.savings)} vs market rate of {formatINR(booking.market_price_estimate)}
            </div>
          )}
        </div>

        {booking.status === "completed" && (
          <Button className="w-full" size="lg" onClick={() => navigate(`/payment/${booking.id}`)}>
            <CreditCard className="w-4 h-4 mr-2" />Pay Now — {formatINR(booking.total)}
          </Button>
        )}
        {booking.status === "paid" && (
          <Button className="w-full" size="lg" onClick={() => navigate(`/savings/${booking.id}`)}>
            View Savings Summary
          </Button>
        )}
      </div>
    </div>
  );
}
