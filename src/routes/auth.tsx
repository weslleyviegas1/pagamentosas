import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar | Fluxo" },
      {
        name: "description",
        content: "Acesse sua conta Fluxo para gerenciar receitas, despesas e cobranças.",
      },
      { property: "og:title", content: "Entrar | Fluxo" },
      { property: "og:description", content: "Acesse o painel financeiro do seu negócio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate({ to: "/dashboard", replace: true });
        } else {
          toast.success("Conta criada! Confirme o e-mail para acessar.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="mb-7 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
            <Activity className="size-5 text-success" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight">FLUXO</span>
        </Link>

        <div className="surface p-6">
          <h1 className="text-[19px] font-bold tracking-tight">
            {mode === "login" ? "Entrar na sua conta" : "Criar conta"}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {mode === "login"
              ? "Use seu e-mail e senha para acessar o painel."
              : "Leva menos de um minuto para começar."}
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
            {mode === "signup" && (
              <Field
                label="Nome completo"
                value={fullName}
                onChange={setFullName}
                type="text"
                required
                autoComplete="name"
              />
            )}
            <Field
              label="E-mail"
              value={email}
              onChange={setEmail}
              type="email"
              required
              autoComplete="email"
            />
            <Field
              label="Senha"
              value={password}
              onChange={setPassword}
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-4 w-full text-center text-[13px] text-muted-foreground hover:text-foreground"
          >
            {mode === "login" ? (
              <>
                Não tem conta? <span className="font-medium text-success">Cadastre-se</span>
              </>
            ) : (
              <>
                Já tem conta? <span className="font-medium text-success">Entrar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-secondary px-3.5 py-2.5 text-sm outline-none focus:border-ring"
      />
    </label>
  );
}
