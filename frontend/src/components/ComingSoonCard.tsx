import { Clock } from "lucide-react";
import { ServiceCategory } from "@/types";
import { Link } from "react-router-dom";

export default function ComingSoonCard({ category }: { category: ServiceCategory }) {
  return (
    <Link to={`/services/${category.id}`} className="block">
      <div className="relative rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-5 text-center card-hover opacity-75">
        <div className="text-3xl mb-2 grayscale">{category.icon}</div>
        <p className="font-medium text-slate-300 text-sm">{category.name}</p>
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          Coming Soon
        </div>
      </div>
    </Link>
  );
}
