import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/app/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Fluxo" },
      { name: "description", content: "Visões consolidadas do desempenho financeiro." },
      { property: "og:title", content: "Relatórios — Fluxo" },
      { property: "og:description", content: "Visões consolidadas do desempenho financeiro." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Relatórios"
      description="Visões consolidadas do desempenho financeiro."
    />
  ),
});
