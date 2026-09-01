import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const schema = z.object({
  cobrancaId: z.string().uuid(),
  accessToken: z.string().min(10),
});

/**
 * Cria uma preferência de pagamento no Mercado Pago (Checkout Pro) para uma
 * cobrança e devolve o link de checkout. A leitura da cobrança é feita com o
 * token do usuário logado, então o RLS continua valendo.
 */
export const criarLinkPagamento = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const mpToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
    if (!mpToken) throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");

    const supabaseUrl = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
    const supabaseKey =
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase não configurado.");

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          headers.set("apikey", supabaseKey);
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { data: cobranca, error } = await supabase
      .from("cobrancas")
      .select("id, descricao, valor, status, clientes(nome, email)")
      .eq("id", data.cobrancaId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!cobranca) throw new Error("Cobrança não encontrada.");
    if (cobranca.status !== "pendente") throw new Error("Esta cobrança não está pendente.");

    const cliente = (cobranca as { clientes?: { nome?: string; email?: string } | null }).clientes;
    const baseUrl = process.env["PUBLIC_APP_URL"] ?? "";

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            id: cobranca.id,
            title: cobranca.descricao,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(cobranca.valor),
          },
        ],
        payer: cliente?.email ? { name: cliente.nome, email: cliente.email } : undefined,
        external_reference: cobranca.id,
        notification_url: baseUrl ? `${baseUrl}/api/public/webhooks/mercadopago` : undefined,
        back_urls: baseUrl ? { success: `${baseUrl}/cobrancas` } : undefined,
      }),
    });

    if (!response.ok) {
      console.error("Mercado Pago preference error", await response.text());
      throw new Error("Não foi possível gerar o link de pagamento agora.");
    }

    const pref = (await response.json()) as {
      id: string;
      init_point?: string;
      sandbox_init_point?: string;
    };
    const link = pref.init_point ?? pref.sandbox_init_point ?? null;

    await supabase
      .from("cobrancas")
      .update({ mp_preference_id: pref.id, link_pagamento: link })
      .eq("id", cobranca.id);

    return { link, preferenceId: pref.id };
  });
