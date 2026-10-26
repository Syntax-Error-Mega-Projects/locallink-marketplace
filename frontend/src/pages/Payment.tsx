import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Booking } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/utils";
import { CreditCard, ShieldCheck, ArrowLeft, Lock } from "lucide-react";

declare global { interface Window { Razorpay: any; } }

export default function Payment() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/bookings/${bookingId}`).then(r => setBooking(r.data)).catch(() => navigate(-1));
  }, [bookingId]);

  const handlePay = async () => {
    if (!booking || !user) return;
    setLoading(true);
    setError("");
    try {
      const { data: order } = await api.post("/api/payments/create-order", { booking_id: booking.id });

      // Mock flow if key is placeholder
      if (order.key_id.includes("placeholder") || order.key_id.includes("REPLACE")) {
        // Simulate payment verification with mock data
        await api.post("/api/payments/verify", {
          booking_id: booking.id,
          razorpay_order_id: order.razorpay_order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature",
        });
        navigate(`/savings/${booking.id}`);
        return;
      }

      const options = {
        key: order.key_id,
        amount: order.amount * 100,
        currency: "INR",
        name: "LocalLink",
        description: `Booking #${booking.id}`,
        order_id: order.razorpay_order_id,
        handler: async (response: any) => {
          try {
            await api.post("/api/payments/verify", {
              booking_id: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate(`/savings/${booking.id}`);
          } catch { setError("Payment verification failed. Contact support."); }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#f97316" },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Payment initiation failed.");
      setLoading(false);
    }
  };

  if (!booking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-md mx-auto animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-btn rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-slate-400 text-sm mt-1">Booking #{booking.id} · {formatDate(booking.created_at)}</p>
        </div>

        <div className="glass-card mb-6 space-y-3 text-sm">
          <h2 className="font-semibold text-slate-100">Order Summary</h2>
          <div className="flex justify-between text-slate-400"><span>Service charge</span><span>{formatINR(booking.service_charge)}</span></div>
          {booking.parts_total > 0 && <div className="flex justify-between text-slate-400"><span>Parts (supplier wholesale)</span><span>{formatINR(booking.parts_total)}</span></div>}
          <div className="flex justify-between text-slate-400"><span>Platform fee</span><span>{formatINR(booking.fee)}</span></div>
          <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-slate-100 text-base">
            <span>Total</span><span className="gradient-text">{formatINR(booking.total)}</span>
          </div>
          {booking.savings > 0 && (
            <div className="text-emerald-300 text-xs bg-emerald-500/10 rounded-lg px-3 py-2 mt-2">
              You are saving {formatINR(booking.savings)} vs market rate!
            </div>
          )}
        </div>

        <div className="glass-card mb-6 flex items-center gap-3 p-4">
          <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-0.5">Secure Payment via Razorpay</p>
            <p>256-bit SSL encrypted. UPI, Cards, NetBanking accepted. Pay only inside the app — no cash.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 justify-center mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          LocalLink never charges hidden fees. Price is fixed.
        </div>

        {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2 mb-4">{error}</p>}
        <Button id="pay-now-btn" className="w-full" size="lg" onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : `Pay ${formatINR(booking.total)}`}
        </Button>
      </div>
    </div>
  );
}
