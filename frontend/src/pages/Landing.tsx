import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, MapPin, CreditCard, TrendingDown, Star, Zap, Users, Wrench } from "lucide-react";

const STATS = [
  { label: "Verified Workers", value: "2,400+" },
  { label: "Services Booked", value: "18,000+" },
  { label: "Avg. Savings", value: "30%" },
  { label: "Cities", value: "12" },
];

const FEATURES = [
  { icon: ShieldCheck, title: "All Verified", desc: "Every worker, shop and supplier is Aadhaar-verified with police and skill checks.", color: "text-emerald-400" },
  { icon: TrendingDown, title: "No Hidden Charges", desc: "Fixed price shown upfront. Workers source parts directly from suppliers at wholesale.", color: "text-orange-400" },
  { icon: MapPin, title: "Nearest Supplier Map", desc: "Workers see the cheapest nearby supplier on a live map — savings passed to you.", color: "text-blue-400" },
  { icon: CreditCard, title: "Pay In-App Only", desc: "Payments happen inside LocalLink so there are zero cash surprises.", color: "text-purple-400" },
];

const HOW = [
  { icon: Wrench, step: "1", title: "Pick a service", desc: "Browse all categories — AC repair, electricians, plumbers, lawyers and more." },
  { icon: Users, step: "2", title: "Worker accepts", desc: "A verified worker near you accepts and heads your way." },
  { icon: MapPin, step: "3", title: "Cheapest parts found", desc: "Worker finds the lowest-priced parts from nearby suppliers." },
  { icon: Zap, step: "4", title: "Pay & save", desc: "Pay in-app and see exactly how much you saved vs market rate." },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-sm text-orange-300 mb-6">
            <ShieldCheck className="w-4 h-4" /> Verified workers, transparent pricing
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
            Local services,{" "}
            <span className="gradient-text">no surprises.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Book verified home repairs, construction crews and professionals in Pune.
            Workers buy parts at wholesale — you pay less.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/categories")} className="text-base px-8">
              Browse Services
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/labour")} className="text-base px-8">
              Hire Labour Team
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-slate-800 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-black gradient-text">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why LocalLink?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="glass-card card-hover">
                <f.icon className={`w-8 h-8 ${f.color} mb-4`} />
                <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map(h => (
              <div key={h.step} className="text-center">
                <div className="w-12 h-12 gradient-btn rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <h.icon className="w-6 h-6" />
                </div>
                <div className="text-xs text-orange-400 font-bold mb-1">STEP {h.step}</div>
                <h3 className="font-semibold text-slate-100 mb-2">{h.title}</h3>
                <p className="text-sm text-slate-400">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-4xl font-black mb-4">Ready to save on your next repair?</h2>
        <p className="text-slate-400 mb-8">Join 18,000+ customers who never overpay again.</p>
        <Button size="lg" onClick={() => navigate("/register")} className="text-base px-10">
          Get Started Free
        </Button>
      </section>
    </div>
  );
}
