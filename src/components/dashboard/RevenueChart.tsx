import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  { mes: "Dez", receitas: 62000, despesas: 24000 },
  { mes: "Jan", receitas: 48000, despesas: 21000 },
  { mes: "Fev", receitas: 53000, despesas: 26000 },
  { mes: "Mar", receitas: 71000, despesas: 23000 },
  { mes: "Abr", receitas: 66000, despesas: 20000 },
  { mes: "Mai", receitas: 76000, despesas: 25000 },
];

const ranges = ["Este mês", "3 meses", "6 meses", "Este ano"];

export function RevenueChart() {
  return (
    <div className="surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">Receitas x Despesas</h2>
        <div className="flex rounded-lg bg-secondary p-1">
          {ranges.map((r, i) => (
            <button
              key={r}
              className={`rounded-md px-3 py-1.5 text-[12px] transition-colors ${
                i === 0
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-success" /> Receitas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-destructive" /> Despesas
        </span>
      </div>

      <div className="mt-4 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={62}
              ticks={[0, 20000, 40000, 60000, 80000]}
              tickFormatter={(v: number) => `R$ ${v / 1000}k`}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <Bar dataKey="receitas" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} barSize={22} />
            <Bar dataKey="despesas" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
