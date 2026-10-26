import { CheckCircle } from "lucide-react";

interface Slab {
  workers: number;
  discount_pct: number;
}

export default function DiscountSlabTable({ slabs, activeWorkers }: { slabs: Slab[]; activeWorkers?: number }) {
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-slate-300">
            <th className="text-left px-4 py-2.5 font-medium">Crew Size</th>
            <th className="text-left px-4 py-2.5 font-medium">Bulk Discount</th>
            <th className="text-left px-4 py-2.5 font-medium">You Pay</th>
          </tr>
        </thead>
        <tbody>
          {slabs.map((slab) => {
            const isActive = activeWorkers === slab.workers;
            return (
              <tr key={slab.workers} className={`border-t border-slate-800 transition-colors ${isActive ? "bg-orange-500/10" : "hover:bg-slate-800/50"}`}>
                <td className="px-4 py-2.5 font-medium text-slate-100 flex items-center gap-2">
                  {isActive && <CheckCircle className="w-3.5 h-3.5 text-orange-400" />}
                  {slab.workers} worker{slab.workers > 1 ? "s" : ""}
                </td>
                <td className="px-4 py-2.5">
                  <span className={slab.discount_pct > 0 ? "text-emerald-400 font-medium" : "text-slate-500"}>
                    {slab.discount_pct > 0 ? `${slab.discount_pct}% off` : "No discount"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-300">
                  {slab.discount_pct > 0 ? `${100 - slab.discount_pct}% of subtotal` : "Full price"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
