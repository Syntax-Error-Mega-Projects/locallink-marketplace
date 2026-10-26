import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { ServiceCategory, WorkerProvider } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RateCard from "@/components/RateCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Star, Clock, MapPin, ArrowLeft } from "lucide-react";

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [cat, setCat] = useState<ServiceCategory | null>(null);
  const [providers, setProviders] = useState<WorkerProvider[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.get("/api/categories").then(r => {
      const found = r.data.find((c: ServiceCategory) => c.id === parseInt(id));
      setCat(found || null);
    });
    api.get(`/api/categories/${id}/providers`).then(r => setProviders(r.data)).catch(() => {});
  }, [id]);

  if (!cat) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  if (cat.coming_soon) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-7xl mb-6 grayscale">{cat.icon}</div>
          <h1 className="text-3xl font-bold mb-3">{cat.name}</h1>
          <Badge variant="secondary" className="text-sm mb-4"><Clock className="w-3 h-3 mr-1" />Coming Soon</Badge>
          <p className="text-slate-400 mb-6">{cat.description || "We are working on bringing this service to you. Stay tuned!"}</p>
          <div className="glass-card p-6 text-left mb-6">
            <p className="text-sm text-slate-400 mb-2">This service will include:</p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>Verified & background-checked professionals</li>
              <li>Fixed, transparent pricing</li>
              <li>In-app payment only</li>
              <li>Savings summary after every job</li>
            </ul>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Go Back</Button>
        </div>
      </div>
    );
  }

  const isProfessional = cat.group === "professional_services";
  const isLabour = cat.group === "construction_labour";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="glass-card mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-5xl">{cat.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold">{cat.name}</h1>
                <VerifiedBadge size="md" />
                {cat.shop_visit_allowed && <Badge variant="info">Shop Visit Available</Badge>}
              </div>
              <p className="text-slate-400 text-sm">{cat.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{cat.fee_type.replace("_", " ")}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Pune city-wide</span>
          </div>
        </div>

        <RateCard
          serviceName={cat.name}
          serviceCharge={cat.base_service_charge}
          partsEstimate={cat.group === "home_repair" ? Math.round(cat.market_rate_estimate * 0.27) : 0}
          convenienceFee={50}
          total={cat.base_service_charge + 50}
          marketEstimate={cat.market_rate_estimate}
        />

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {isLabour ? (
            <Button className="flex-1" size="lg" onClick={() => navigate("/labour")}>
              Build Labour Package
            </Button>
          ) : isProfessional ? (
            <Button className="flex-1" size="lg" onClick={() => {
              if (!user) { navigate("/login"); return; }
              navigate(`/professional/${cat.id}`);
            }}>
              Book Consultation
            </Button>
          ) : (
            <>
              <Button className="flex-1" size="lg" onClick={() => {
                if (!user) { navigate("/login"); return; }
                navigate(`/book/${cat.id}?mode=home`);
              }}>
                Book Home Visit
              </Button>
              {cat.shop_visit_allowed && (
                <Button variant="outline" className="flex-1" size="lg" onClick={() => {
                  if (!user) { navigate("/login"); return; }
                  navigate(`/book/${cat.id}?mode=shop`);
                }}>
                  <MapPin className="w-4 h-4 mr-2" />Shop Visit (Cheaper)
                </Button>
              )}
            </>
          )}
        </div>

        {providers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Available Providers</h2>
            <div className="space-y-3">
              {providers.map(p => (
                <div key={p.id} className="glass-card flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center font-bold text-white">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-100">{p.name}</p>
                      {p.verified && <VerifiedBadge />}
                    </div>
                    <p className="text-xs text-slate-400">{p.experience_years} yrs exp · {p.bio}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400 justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-sm font-medium">{p.rating}</span>
                    </div>
                    {p.available_today && <Badge variant="success" className="text-xs">Today</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
