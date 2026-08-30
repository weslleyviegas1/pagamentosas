import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Tone = "success" | "info" | "destructive" | "primary";

const toneMap: Record<Tone, string> = {
  success: "bg-success/12 text-success",
  info: "bg-info/15 text-info",
  destructive: "bg-destructive/12 text-destructive",
  primary: "bg-primary/12 text-primary",
};

export function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  trend,
  trendUp,
  note,
}: {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  note?: string;
}) {
  return (
    <div className="surface flex items-start gap-3.5 p-5">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${toneMap[tone]}`}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-muted-foreground">
          {trend ? (
            <>
              <span
                className={`flex items-center gap-0.5 font-medium ${
                  trendUp ? "text-success" : "text-destructive"
                }`}
              >
                {trendUp ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {trend}
              </span>
              vs mês anterior
            </>
          ) : (
            note
          )}
        </p>
      </div>
    </div>
  );
}
