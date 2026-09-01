import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/app/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações — Fluxo" },
      { name: "description", content: "Todas as entradas e saídas do seu fluxo de caixa." },
      { property: "og:title", content: "Transações — Fluxo" },
      { property: "og:description", content: "Todas as entradas e saídas do seu fluxo de caixa." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Transações"
      description="Todas as entradas e saídas do seu fluxo de caixa."
    />
  ),
});
