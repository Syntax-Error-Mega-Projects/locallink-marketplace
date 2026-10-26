import { formatINR } from "@/lib/utils";
import { TrendingDown, Tag } from "lucide-react";

interface RateCardProps {
  serviceName: string;
  serviceCharge: number;
  partsEstimate?: number;
  convenienceFee: number;
  total: number;
  marketEstimate: number;
  mode?: string;
}

export default function RateCard({ serviceName, serviceCharge, partsEstimate = 0, convenienceFee, total, marketEstimate, mode }: RateCardProps) {
  const savings = marketEstimate - total;
  const savingsPct = Math.round((savings / marketEstimate) * 100);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Tag className="w-4 h-4 text-orange-400" />
          Rate Card
        </h3>
        {mode === "shop" && (
          <span className="text-xs text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Shop Visit Discount Applied
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-slate-300">
          <span>Service charge</span>
          <span>{formatINR(serviceCharge)}</span>
        </div>
        {partsEstimate > 0 && (
          <div className="flex justify-between text-slate-300">
            <span>Est. parts (supplier wholesale)</span>
            <span>{formatINR(partsEstimate)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-300">
          <span>Convenience fee</span>
          <span>{formatINR(convenienceFee)}</span>
        </div>
        <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold text-slate-100">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>
      </div>
      {savings > 0 && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-emerald-300 font-semibold text-sm">
              You save {formatINR(savings)} ({savingsPct}%)
            </p>
            <p className="text-xs text-slate-500">vs market rate of {formatINR(marketEstimate)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
