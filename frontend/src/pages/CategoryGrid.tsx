import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { ServiceCategory } from "@/types";
import ComingSoonCard from "@/components/ComingSoonCard";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const GROUP_LABELS: Record<string, string> = {
  home_repair: "Home Repair",
  household_personal: "Household & Personal",
  construction_labour: "Construction Labour",
  professional_services: "Professional Services",
};

export default function CategoryGrid() {
  const [cats, setCats] = useState<ServiceCategory[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => { api.get("/api/categories").then(r => setCats(r.data)); }, []);

  const groups = [...new Set(cats.map(c => c.group))];
  const filtered = cats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-black mb-2">All Services</h1>
          <p className="text-slate-400">Verified, transparent pricing. No surprises.</p>
        </div>
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input id="cat-search" className="pl-10" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {groups.map(group => {
          const groupCats = filtered.filter(c => c.group === group);
          if (!groupCats.length) return null;
          return (
            <section key={group} className="mb-12 animate-slide-up">
              <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                {GROUP_LABELS[group] || group}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {groupCats.map(cat => (
                  cat.coming_soon ? (
                    <ComingSoonCard key={cat.id} category={cat} />
                  ) : (
                    <button key={cat.id} id={`cat-${cat.id}`}
                      onClick={() => navigate(`/services/${cat.id}`)}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center card-hover group transition-all hover:border-orange-500/40">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</div>
                      <p className="font-semibold text-slate-100 text-sm leading-tight">{cat.name}</p>
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <span className="text-xs text-orange-400 font-medium">from Rs {cat.base_service_charge}</span>
                        <VerifiedBadge />
                      </div>
                      {cat.shop_visit_allowed && (
                        <Badge variant="info" className="mt-2 text-xs">Shop Visit</Badge>
                      )}
                    </button>
                  )
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
