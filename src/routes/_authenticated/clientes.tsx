import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/app/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Fluxo" },
      { name: "description", content: "Cadastre e organize os clientes da sua operação." },
      { property: "og:title", content: "Clientes — Fluxo" },
      { property: "og:description", content: "Cadastre e organize os clientes da sua operação." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Clientes"
      description="Cadastre e organize os clientes da sua operação."
    />
  ),
});
