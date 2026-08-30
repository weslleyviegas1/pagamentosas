import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  CircleDollarSign,
  TrendingDown,
  BarChart3,
  Settings,
  ChevronDown,
  Activity,
} from "lucide-react";

const items = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Clientes", icon: Users },
  { label: "Projetos", icon: Briefcase },
  { label: "Contratos", icon: FileText },
  { label: "Cobranças", icon: Receipt },
  { label: "Financeiro", icon: CircleDollarSign },
  { label: "Despesas", icon: TrendingDown },
  { label: "Relatórios", icon: BarChart3 },
  { label: "Configurações", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-[200px] shrink-0 flex-col justify-between bg-sidebar px-3 py-5 lg:flex">
      <div>
        <div className="mb-7 flex items-center gap-2 px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
            <Activity className="size-5 text-success" />
          </div>
          <span className="text-[13px] leading-tight font-extrabold tracking-tight">
            MEU FLUXO
            <br />
            DE CAIXA
          </span>
        </div>

        <nav className="space-y-1">
          {items.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              <Icon className="size-[18px]" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-card px-2.5 py-2.5">
        <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
          WV
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">Wesley Viegas</p>
          <p className="truncate text-[11px] text-muted-foreground">Administrador</p>
        </div>
        <ChevronDown className="size-4 text-muted-foreground" />
      </div>
    </aside>
  );
}
