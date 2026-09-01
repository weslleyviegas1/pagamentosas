import { createFileRoute } from "@tanstack/react-router";

import { PagePlaceholder } from "@/components/app/PagePlaceholder";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Fluxo" },
      { name: "description", content: "Preferências da conta e da organização." },
      { property: "og:title", content: "Configurações — Fluxo" },
      { property: "og:description", content: "Preferências da conta e da organização." },
    ],
  }),
  component: () => (
    <PagePlaceholder title="Configurações" description="Preferências da conta e da organização." />
  ),
});
