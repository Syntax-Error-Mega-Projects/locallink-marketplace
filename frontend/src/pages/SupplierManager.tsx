import { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { Package, Save, RefreshCw, TrendingUp } from "lucide-react";

interface PriceRecord {
  id: number;
  supplier_shop_id: number;
  part_id: number;
  part_name: string;
  part_category: string;
  price: number;
  stock: number;
}

export default function SupplierManager() {
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [edits, setEdits] = useState<Record<number, { price: number; stock: number }>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/api/supplier/prices");
      setPrices(r.data);
      const initEdits: typeof edits = {};
      r.data.forEach((p: PriceRecord) => { initEdits[p.id] = { price: p.price, stock: p.stock }; });
      setEdits(initEdits);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (id: number) => {
    setSaving(id);
    try {
      await api.put(`/api/supplier/prices/${id}`, edits[id]);
      await load();
    } finally { setSaving(null); }
  };

  const categories = [...new Set(prices.map(p => p.part_category))];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"/></div>;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">My Price & Stock Manager</h1>
            <p className="text-slate-400 text-sm">Update prices and stock for your parts. Changes are live immediately.</p>
          </div>
          <button onClick={load} className="text-slate-400 hover:text-slate-200 p-2 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card text-center">
            <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{prices.length}</p>
            <p className="text-xs text-slate-400">Total Parts Listed</p>
          </div>
          <div className="glass-card text-center">
            <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{prices.filter(p => p.stock > 10).length}</p>
            <p className="text-xs text-slate-400">In Stock</p>
          </div>
          <div className="glass-card text-center">
            <Package className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-100">{prices.filter(p => p.stock <= 5).length}</p>
            <p className="text-xs text-slate-400">Low Stock</p>
          </div>
        </div>

        {/* Parts by category */}
        {categories.map(cat => {
          const catPrices = prices.filter(p => p.part_category === cat);
          return (
            <div key={cat} className="mb-8">
              <h2 className="font-semibold text-slate-300 mb-3 capitalize flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full" />
                {cat.replace("_", " ")}
              </h2>
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400">
                      <th className="text-left px-5 py-3 font-medium">Part Name</th>
                      <th className="text-left px-5 py-3 font-medium">Price (Rs)</th>
                      <th className="text-left px-5 py-3 font-medium">Stock (units)</th>
                      <th className="text-left px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {catPrices.map(p => {
                      const edit = edits[p.id] || { price: p.price, stock: p.stock };
                      const changed = edit.price !== p.price || edit.stock !== p.stock;
                      return (
                        <tr key={p.id} className={`border-t border-slate-800 ${changed ? "bg-orange-500/5" : "hover:bg-slate-900/50"}`}>
                          <td className="px-5 py-3 text-slate-100 font-medium">{p.part_name}</td>
                          <td className="px-5 py-3">
                            <Input
                              id={`price-${p.id}`}
                              type="number"
                              value={edit.price}
                              onChange={e => setEdits({ ...edits, [p.id]: { ...edit, price: parseInt(e.target.value) || 0 } })}
                              className="w-28 h-8 text-sm"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <Input
                              id={`stock-${p.id}`}
                              type="number"
                              value={edit.stock}
                              onChange={e => setEdits({ ...edits, [p.id]: { ...edit, stock: parseInt(e.target.value) || 0 } })}
                              className="w-24 h-8 text-sm"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={p.stock > 10 ? "success" : p.stock > 0 ? "default" : "destructive"}>
                              {p.stock > 10 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock"}
                            </Badge>
                          </td>
                          <td className="px-5 py-3">
                            <Button id={`save-${p.id}`} size="sm" variant={changed ? "default" : "ghost"} onClick={() => save(p.id)} disabled={saving === p.id || !changed}>
                              {saving === p.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              <span className="ml-1.5">{changed ? "Save" : "Saved"}</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {prices.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No prices listed yet. Contact admin to add your parts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
