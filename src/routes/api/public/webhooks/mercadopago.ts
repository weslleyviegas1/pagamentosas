import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Webhook do Mercado Pago. A notificação em si não é confiável: usamos apenas
 * o id do pagamento e consultamos a API oficial para confirmar o status.
 */
export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const mpToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
        const supabaseUrl = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"];
        const serviceKey = process.env["SB_SERVICE_ROLE_KEY"];
        if (!mpToken || !supabaseUrl || !serviceKey) {
          console.error("Webhook Mercado Pago: variáveis de ambiente ausentes");
          return new Response("not configured", { status: 500 });
        }

        let body: { type?: string; action?: string; data?: { id?: string | number } };
        try {
          body = await request.json();
        } catch {
          return new Response("invalid body", { status: 400 });
        }

        const isPayment = body.type === "payment" || body.action?.startsWith("payment.");
        const paymentId = body.data?.id ? String(body.data.id) : null;
        if (!isPayment || !paymentId) return new Response("ignored");

        const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${mpToken}` },
        });
        if (!paymentRes.ok) {
          console.error("Mercado Pago payment lookup failed", paymentRes.status);
          return new Response("lookup failed", { status: 502 });
        }

        const payment = (await paymentRes.json()) as {
          status?: string;
          external_reference?: string | null;
        };
        if (payment.status !== "approved" || !payment.external_reference) {
          return new Response("ok");
        }

        const admin = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              headers.set("apikey", serviceKey);
              headers.set("Authorization", `Bearer ${serviceKey}`);
              return fetch(input, { ...init, headers });
            },
          },
        });

        const { error } = await admin
          .from("cobrancas")
          .update({
            status: "pago",
            pago_em: new Date().toISOString().slice(0, 10),
            mp_payment_id: paymentId,
          })
          .eq("id", payment.external_reference);

        if (error) {
          console.error("Falha ao atualizar cobrança", error.message);
          return new Response("update failed", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
