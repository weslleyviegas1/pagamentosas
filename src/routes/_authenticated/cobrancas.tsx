import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/app/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/cobrancas")({
  head: () => ({
    meta: [
      { title: "Cobranças — Fluxo" },
      { name: "description", content: "Acompanhe vencimentos e recebimentos pendentes." },
      { property: "og:title", content: "Cobranças — Fluxo" },
      { property: "og:description", content: "Acompanhe vencimentos e recebimentos pendentes." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      title="Cobranças"
      description="Acompanhe vencimentos e recebimentos pendentes."
    />
  ),
});
