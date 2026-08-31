import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, CheckCircle2, Receipt, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fluxo — Controle financeiro para o seu negócio" },
      {
        name: "description",
        content:
          "Fluxo é o SaaS de gestão financeira para autônomos e pequenos negócios: receitas, despesas, clientes, cobranças e fluxo de caixa em um só lugar.",
      },
      { property: "og:title", content: "Fluxo — Controle financeiro para o seu negócio" },
      {
        property: "og:description",
        content: "Receitas, despesas, clientes e cobranças com relatórios em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Wallet,
    title: "Fluxo de caixa real",
    text: "Entradas, saídas e saldo do período calculados a partir dos seus lançamentos.",
  },
  {
    icon: Receipt,
    title: "Cobranças e vencimentos",
    text: "Acompanhe o que está a receber, o que vence hoje e o que está atrasado.",
  },
  {
    icon: BarChart3,
    title: "Relatórios claros",
    text: "Receitas x despesas mês a mês, por categoria e por cliente.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
            <Activity className="size-5 text-success" />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight">FLUXO</span>
        </div>
        <Link
          to="/auth"
          className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground"
        >
          Entrar
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="py-14 md:py-20">
          <p className="text-[13px] font-medium text-success">Gestão financeira sem planilha</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Todo o dinheiro do seu negócio sob controle
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-muted-foreground">
            Cadastre receitas e despesas, organize clientes, emita cobranças e acompanhe o fluxo de
            caixa da sua empresa em tempo real.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Criar minha conta
            </Link>
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold"
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="surface p-5">
              <Icon className="size-5 text-success" />
              <h2 className="mt-3 text-[15px] font-semibold">{title}</h2>
              <p className="mt-1.5 text-[13px] text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>

        <section className="surface mt-4 p-6">
          <h2 className="text-[15px] font-semibold">Feito para quem toca o negócio sozinho</h2>
          <ul className="mt-4 grid gap-2.5 text-[13px] text-muted-foreground md:grid-cols-2">
            {[
              "Cada empresa tem seu próprio espaço de trabalho isolado",
              "Dados protegidos por políticas de acesso no banco",
              "Cadastro de clientes com histórico de cobranças",
              "Resumo do fluxo de caixa mês a mês",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
