import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ExternalLink, Link2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { criarLinkPagamento } from "@/lib/mercadopago.functions";
import { useOrg } from "@/lib/org";
import { brl, dateBR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/cobrancas")({
  head: () => ({
    meta: [
      { title: "Cobranças — Fluxo" },
      { name: "description", content: "Gere links de pagamento no Mercado Pago e acompanhe recebimentos." },
      { property: "og:title", content: "Cobranças — Fluxo" },
      {
        property: "og:description",
        content: "Gere links de pagamento no Mercado Pago e acompanhe recebimentos.",
      },
    ],
  }),
  component: CobrancasPage,
});

type Cobranca = {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: "pendente" | "pago" | "cancelado";
  link_pagamento: string | null;
};

function CobrancasPage() {
  const { org } = useOrg();
  const queryClient = useQueryClient();
  const gerarLink = useServerFn(criarLinkPagamento);

  const query = useQuery({
    queryKey: ["cobrancas", org?.id],
    enabled: Boolean(org?.id),
    queryFn: async (): Promise<Cobranca[]> => {
      const { data, error } = await supabase
        .from("cobrancas")
        .select("id, descricao, valor, vencimento, status, link_pagamento")
        .eq("organization_id", org!.id)
        .order("vencimento", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Cobranca[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (cobrancaId: string) => {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      if (!accessToken) throw new Error("Sessão expirada. Entre novamente.");
      return gerarLink({ data: { cobrancaId, accessToken } });
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["cobrancas"] });
      if (result.link) {
        window.open(result.link, "_blank", "noopener");
        toast.success("Link de pagamento gerado.");
      } else {
        toast.error("O Mercado Pago não retornou um link de checkout.");
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cobrancas = query.data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Cobranças</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe vencimentos e gere links de pagamento pelo Mercado Pago.
        </p>
      </header>

      {query.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : cobrancas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma cobrança cadastrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cobrancas.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.descricao}</p>
                  <p className="text-xs text-muted-foreground">Vence em {dateBR(c.vencimento)}</p>
                </div>
                <p className="font-semibold">{brl(Number(c.valor))}</p>
                <Badge variant={c.status === "pago" ? "default" : "secondary"}>{c.status}</Badge>
                {c.status === "pendente" &&
                  (c.link_pagamento ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={c.link_pagamento} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 size-4" />
                        Abrir link
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => mutation.mutate(c.id)}
                      disabled={mutation.isPending}
                    >
                      <Link2 className="mr-2 size-4" />
                      Gerar link
                    </Button>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
