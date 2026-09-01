import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/lib/org";
import { initials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/cobrancas", label: "Cobranças", icon: Receipt },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { profileName, org } = useOrg();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          activeProps={{ className: "bg-muted text-foreground font-medium" }}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border p-4 lg:flex">
        <div className="space-y-6">
          <div>
            <p className="text-lg font-semibold tracking-tight">Fluxo</p>
            <p className="text-xs text-muted-foreground">{org?.name ?? "Sem organização"}</p>
          </div>
          {nav}
        </div>
        <UserBox name={profileName} onSignOut={signOut} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <p className="font-semibold">Fluxo</p>
          <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </header>

        <div className={cn("border-b border-border p-4 lg:hidden", open ? "block" : "hidden")}>
          {nav}
          <div className="mt-4">
            <UserBox name={profileName} onSignOut={signOut} />
          </div>
        </div>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function UserBox({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
        {initials(name)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
      <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sair">
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
