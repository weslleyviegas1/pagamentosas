import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org";
import { brl, monthRange } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Fluxo" },
      { name: "description", content: "Acompanhe receitas, despesas e resultado do mês." },
      { property: "og:title", content: "Dashboard — Fluxo" },
      { property: "og:description", content: "Acompanhe receitas, despesas e resultado do mês." },
    ],
  }),
  component: DashboardPage,
});

type Row = { tipo: string; valor: number };

function DashboardPage() {
  const { org, loading } = useOrg();
  const range = monthRange();

  const query = useQuery({
    queryKey: ["dashboard", org?.id, range.from],
    enabled: Boolean(org?.id),
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("transacoes")
        .select("tipo, valor")
        .eq("organization_id", org!.id)
        .gte("data", range.from)
        .lte("data", range.to);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = query.data ?? [];
  const receitas = rows.filter((r) => r.tipo === "receita").reduce((s, r) => s + Number(r.valor), 0);
  const despesas = rows.filter((r) => r.tipo === "despesa").reduce((s, r) => s + Number(r.valor), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Entradas, saídas e saldo do período calculados a partir dos seus lançamentos.
        </p>
      </header>

      {loading || query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat title="Receitas" value={brl(receitas)} tone="text-emerald-400" />
          <Stat title="Despesas" value={brl(despesas)} tone="text-red-400" />
          <Stat title="Resultado líquido" value={brl(receitas - despesas)} />
        </div>
      )}

      {!query.isLoading && rows.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum lançamento neste mês ainda. Cadastre uma transação para ver seus números aqui.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ title, value, tone }: { title: string; value: string; tone?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold ${tone ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
