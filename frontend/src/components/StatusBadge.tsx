import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; variant: any; dot: string }> = {
  requested:  { label: "Requested",   variant: "secondary", dot: "bg-slate-400" },
  accepted:   { label: "Accepted",    variant: "info",      dot: "bg-blue-400" },
  on_the_way: { label: "On the Way",  variant: "info",      dot: "bg-blue-400 animate-pulse" },
  in_progress:{ label: "In Progress", variant: "default",   dot: "bg-orange-400 animate-pulse" },
  completed:  { label: "Completed",   variant: "success",   dot: "bg-emerald-400" },
  paid:       { label: "Paid",        variant: "success",   dot: "bg-emerald-400" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, variant: "secondary", dot: "bg-slate-400" };
  return (
    <Badge variant={cfg.variant} className="gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </Badge>
  );
}
