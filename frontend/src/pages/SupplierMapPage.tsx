import { useEffect, useState, useCallback } from "react";
import api from "@/api/axios";
import { PartResult } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { Search, MapPin, CheckCircle, ArrowUpDown, Star } from "lucide-react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

function MapView({ results }: { results: PartResult[] }) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY, id: "gmap" });
  const [selected, setSelected] = useState<PartResult | null>(null);

  if (!MAPS_KEY || !isLoaded) return null;

  const dedupShops = Array.from(new Map(results.map(r => [r.shop_id, r])).values());

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700 h-80">
      <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={PUNE_CENTER} zoom={12}
        options={{ styles: [{ elementType: "geometry", stylers: [{ color: "#1e293b" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] }] }}>
        <Marker position={PUNE_CENTER} label={{ text: "You", color: "#fff", fontWeight: "bold" }} />
        {dedupShops.map(r => (
          <Marker key={r.shop_id} position={{ lat: r.lat, lng: r.lng }}
            onClick={() => setSelected(r)}
            icon={{ path: (window as any).google.maps.SymbolPath.CIRCLE, scale: r.is_cheapest ? 10 : 7, fillColor: r.is_cheapest ? "#10b981" : "#f97316", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 }} />
        ))}
        {selected && (
          <InfoWindow position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
            <div className="text-slate-900 text-xs">
              <p className="font-bold">{selected.shop_name}</p>
              <p>{selected.part_name}: Rs {selected.price}</p>
              <p className="text-slate-600">{selected.distance_km} km away</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default function SupplierMapPage() {
  const [query, setQuery] = useState("AC Capacitor");
  const [results, setResults] = useState<PartResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "distance">("price");
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/api/parts/search?q=${encodeURIComponent(query)}&lat=18.5204&lng=73.8567`);
      setResults(r.data);
      setSearched(true);
    } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { search(); }, []);

  const sorted = [...results].sort((a, b) => sortBy === "price" ? a.price - b.price : a.distance_km - b.distance_km);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Nearest Supplier Map</h1>
          <p className="text-slate-400">Find the cheapest nearby suppliers for parts. Cheapest highlighted in green.</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input id="supplier-search" className="pl-10" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search parts, e.g. AC Capacitor..."
              onKeyDown={e => e.key === "Enter" && search()} />
          </div>
          <Button onClick={search} disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
        </div>

        {/* Map (only if key present) */}
        {MAPS_KEY && searched && results.length > 0 && (
          <div className="mb-6">
            <MapView results={results} />
            <p className="text-xs text-slate-500 mt-2 text-center">Green = cheapest · Orange = other suppliers</p>
          </div>
        )}
        {!MAPS_KEY && (
          <div className="mb-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>Set <code className="text-orange-400">VITE_GOOGLE_MAPS_KEY</code> in frontend/.env to enable the interactive map. Showing list view below.</span>
          </div>
        )}

        {/* Sort controls */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-slate-400">{results.length} results</span>
            <button onClick={() => setSortBy(sortBy === "price" ? "distance" : "price")}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5" />Sort by {sortBy === "price" ? "distance" : "price"}
            </button>
          </div>
        )}

        {/* Results list */}
        <div className="space-y-3">
          {sorted.map(r => (
            <div key={r.supplier_price_id}
              className={`glass-card p-4 flex items-center gap-4 transition-all ${r.is_cheapest ? "border-emerald-500/40 bg-emerald-500/5" : ""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.is_cheapest ? "bg-emerald-500/20" : "bg-slate-800"}`}>
                {r.is_cheapest ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Star className="w-5 h-5 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-slate-100 truncate">{r.part_name}</p>
                  {r.is_cheapest && <Badge variant="success" className="flex-shrink-0">Cheapest</Badge>}
                </div>
                <p className="text-xs text-slate-400 truncate">{r.shop_name} · {r.shop_address}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{r.distance_km} km away · Stock: {r.stock}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-bold ${r.is_cheapest ? "text-emerald-400" : "text-slate-100"}`}>{formatINR(r.price)}</p>
                <p className="text-xs text-slate-500">per unit</p>
              </div>
            </div>
          ))}
          {searched && results.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No suppliers found for &quot;{query}&quot;. Try a different part name.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
