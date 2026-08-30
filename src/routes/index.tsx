import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  Clock,
  LineChart,
  MinusCircle,
} from "lucide-react";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ListCard, receitas, despesas } from "@/components/dashboard/Lists";
import { Upcoming, CashSummary } from "@/components/dashboard/Upcoming";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Meu Fluxo de Caixa" },
      {
        name: "description",
        content:
          "Painel financeiro com receitas, despesas, cobranças a receber e resumo do fluxo de caixa do seu negócio.",
      },
      { property: "og:title", content: "Dashboard | Meu Fluxo de Caixa" },
      {
        property: "og:description",
        content: "Acompanhe receitas, despesas e vencimentos do seu negócio em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="min-w-0 flex-1 px-5 py-6 lg:px-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">Olá, Wesley Viegas 👋</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Aqui está o resumo financeiro do seu negócio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px]">
              <Calendar className="size-4 text-muted-foreground" />
              01/05/2025 - 31/05/2025
              <ChevronDown className="ml-3 size-4 text-muted-foreground" />
            </button>
            <button className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-card">
              <Bell className="size-[18px]" />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-info text-[10px] font-semibold text-foreground">
                3
              </span>
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={CircleDollarSign}
            tone="success"
            label="Receitas no período"
            value="R$ 58.750,00"
            trend="18,3%"
            trendUp
          />
          <StatCard
            icon={Clock}
            tone="info"
            label="A receber"
            value="R$ 27.450,00"
            note="12 cobranças pendentes"
          />
          <StatCard
            icon={MinusCircle}
            tone="destructive"
            label="Despesas no período"
            value="R$ 18.230,00"
            trend="7,6%"
          />
          <StatCard
            icon={LineChart}
            tone="info"
            label="Resultado líquido"
            value="R$ 40.520,00"
            trend="28,9%"
            trendUp
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <RevenueChart />
            <div className="grid gap-4 md:grid-cols-2">
              <ListCard
                title="Receitas recentes"
                action="Ver todas"
                items={receitas}
                dateTone="text-success"
              />
              <ListCard
                title="Despesas recentes"
                action="Ver todas"
                items={despesas}
                dateTone="text-destructive"
              />
            </div>
          </div>
          <div className="space-y-4">
            <Upcoming />
            <CashSummary />
          </div>
        </section>
      </main>
    </div>
  );
}
